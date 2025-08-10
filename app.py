from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import messaging, credentials
from threading import Lock
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import os
import json
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

load_dotenv()

firebase_key_str = os.getenv("VITE_FIREBASE_KEY")
if not firebase_key_str:
    raise RuntimeError("❌ Variable de entorno FIREBASE_KEY no encontrada")

try:
    firebase_key_dict = json.loads(firebase_key_str)
except json.JSONDecodeError as e:
    raise RuntimeError(f"❌ Error al parsear FIREBASE_KEY: {e}")

# Inicializar Firebase con el dict en memoria
cred = credentials.Certificate(firebase_key_dict)
firebase_admin.initialize_app(cred)

tokens = set()
tokens_lock = Lock()

usuarios_pagos = {}
pagos_lock = Lock()

@app.route('/register-token', methods=['POST'])
def register_token():
    data = request.json
    token = data.get('token')
    if not token:
        return jsonify({"error": "Token no recibido"}), 400

    with tokens_lock:
        tokens.add(token)

    return jsonify({"message": "Token registrado correctamente"}), 200


@app.route('/sync-pagos', methods=['POST'])
def sync_pagos():
    data = request.json
    token = data.get("token")
    pagos = data.get("pagos")

    if not token or not isinstance(pagos, list):
        return jsonify({"error": "Faltan token o lista de pagos"}), 400

    with pagos_lock:
        usuarios_pagos[token] = pagos

    return jsonify({"message": "Pagos sincronizados correctamente"}), 200


@app.route('/test-notification', methods=['POST'])
def test_notification():
    data = request.json
    token = data.get('token')
    if not token:
        app.logger.error("No se recibió token en /test-notification")
        return jsonify({"error": "Token no recibido"}), 400

    titulo = "Notificación de prueba"
    cuerpo = "Esta es una notificación de prueba enviada desde el backend."

    exito = enviar_notificacion(token, titulo, cuerpo)
    if exito:
        return jsonify({"message": "Notificación de prueba enviada correctamente"}), 200
    else:
        return jsonify({"error": "Error enviando notificación de prueba"}), 500


def enviar_notificacion(token, titulo, cuerpo):
    message = messaging.Message(
        notification=messaging.Notification(title=titulo, body=cuerpo),
        token=token,
    )
    try:
        messaging.send(message)
        return True
    except Exception as e:
        app.logger.error(f"Error enviando a {token}: {e}")
        return False


def revisar_y_notificar():
    app.logger.info("Ejecutando tarea periódica de revisión de pagos...")
    ahora = datetime.now()
    rango_fin = ahora + timedelta(days=30)
    inicio_mes_anterior = (ahora.replace(day=1) - timedelta(days=1)).replace(day=1) 
    tokens_a_borrar = set()

    with pagos_lock:
        for token, pagos in usuarios_pagos.items():
            vencidos = []
            proximos = []

            for pago in pagos:
                try:
                    if pago.get('pagado', False):
                        continue

                    venc = datetime.strptime(pago["vencimiento"], "%Y-%m-%dT%H:%M")

                    if inicio_mes_anterior <= venc < ahora:
                        vencidos.append(pago)
                    elif ahora <= venc <= rango_fin:
                        proximos.append(pago)

                except Exception as e:
                    app.logger.error(f"Error procesando pago {pago}: {e}")

            if vencidos:
                conceptos = ", ".join([f"'{p['concepto']}'" for p in vencidos])
                titulo = "Pagos vencidos"
                cuerpo = f"Tienes pagos vencidos: {conceptos}."
                if not enviar_notificacion(token, titulo, cuerpo):
                    tokens_a_borrar.add(token)

            if proximos:
                conceptos = ", ".join([
                    f"'{p['concepto']}'"
                    f"{f' por {p.get('montoPesos') or p.get('montoDolares')}' if p.get('montoPesos') or p.get('montoDolares') else ''}"
                    for p in proximos
                ])
                titulo = "Pagos próximos a vencer"
                cuerpo = f"Tienes pagos próximos a vencer: {conceptos}."
                if not enviar_notificacion(token, titulo, cuerpo):
                    tokens_a_borrar.add(token)

    for token in tokens_a_borrar:
        usuarios_pagos.pop(token, None)

    if tokens_a_borrar:
        with tokens_lock, pagos_lock:
            for t in tokens_a_borrar:
                tokens.discard(t)
                usuarios_pagos.pop(t, None)
                app.logger.info(f"Token inválido eliminado: {t}")


scheduler = BackgroundScheduler()
scheduler.add_job(revisar_y_notificar, "interval", minutes=1)  
scheduler.start()

if __name__ == '__main__':
    app.run(debug=True)
