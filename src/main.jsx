import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "../src/styles/index.css";

import { registerSW } from "virtual:pwa-register";
import { requestPermission, onMessageListener } from "./firebase";

import { db } from "../src/database/db";

const API_URL = import.meta.env.VITE_API_URL;
console.log("API_URL:", API_URL);

const updateSW = registerSW({
  onNeedRefresh() {
    console.log("Nueva versión disponible, preguntando usuario...");
    if (confirm("Hay una nueva versión. ¿Deseas actualizar?")) {
      updateSW(true);
      console.log("Actualización de SW aceptada.");
    } else {
      console.log("Actualización de SW cancelada.");
    }
  },
  onOfflineReady() {
    console.log("App lista para funcionar offline.");
  },
});

async function sendTokenToBackend(token) {
  try {
    console.log("Enviando token al backend:", token);
    const res = await fetch(API_URL + "/register-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn("No se pudo guardar token en backend:", text);
    } else {
      const json = await res.json();
      console.log("Token guardado en backend correctamente:", json);
      return json;
    }
  } catch (error) {
    console.error("Error enviando token al backend:", error);
  }
}

async function sendAllPendientesToBackend(token) {
  try {
    console.log("Leyendo listas mensuales para sincronizar pendientes...");
    const listas = await db.listasMensuales.toArray();
    const pendientesLista = listas.flatMap((lista) =>
      (lista.pendientes || []).map((p) => {
        const fechaBase = p.vencimiento || p.fecha;
        const fechaConHora = fechaBase.includes("T") ? fechaBase : `${fechaBase}T00:00`;
        return {
          ...p,
          vencimiento: fechaConHora,
          concepto: p.descripcion,
          montoPesos: p.montoPesos,
          montoDolares: p.montoDolares,
          pagado: p.pagado,
        };
      })
    );

    console.log(`Sincronizando ${pendientesLista.length} pagos pendientes con backend...`);
    const res = await fetch(API_URL + "/sync-pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, pagos: pendientesLista }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn("No se pudo sincronizar pagos:", text);
      return;
    }

    const respuesta = await res.json();
    console.log("Pagos sincronizados correctamente:", respuesta);
    return respuesta;
  } catch (error) {
    console.error("Error enviando pendientes:", error);
  }
}

let lastPagosString = null;

async function checkAndSyncPagos(token) {
  try {
    console.log("Chequeando pagos pendientes para sincronizar...");
    const pagosPendientesRaw = await db.pendientes.where("pagado").equals(0).toArray();

    const pagosPendientes = pagosPendientesRaw.map((pago) => {
      let vencimientoStr = pago.fecha;
      if (pago.fecha instanceof Date) {
        vencimientoStr = pago.fecha.toISOString().slice(0, 16);
      } else if (typeof pago.fecha === "string" && !pago.fecha.includes("T")) {
        vencimientoStr = pago.fecha + "T00:00";
      }
      return {
        id: pago.id,
        concepto: pago.descripcion,
        vencimiento: vencimientoStr,
        montoPesos: pago.monto,
      };
    });

    const pagosString = JSON.stringify(pagosPendientes);
    if (pagosString !== lastPagosString) {
      console.log("Cambios detectados en pagos pendientes, sincronizando con backend...");
      lastPagosString = pagosString;
      await sendAllPendientesToBackend(token, pagosPendientes);
    } else {
      console.log("No hubo cambios en pagos pendientes, no se sincroniza.");
    }
  } catch (error) {
    console.error("Error leyendo pagos desde Dexie o sincronizando:", error);
  }
}

requestPermission()
  .then(async (token) => {
    if (token) {
      console.log("Permiso concedido y token recibido:", token);
      localStorage.setItem("fcmtoken", token);
      await sendTokenToBackend(token);

      await checkAndSyncPagos(token);

      setInterval(() => checkAndSyncPagos(token), 30 * 1000);
    } else {
      console.warn("No se recibió token FCM");
    }
  })
  .catch((error) => {
    console.error("Error solicitando permiso:", error);
  });

console.log("Listener configurado para recibir notificaciones");
onMessageListener()
  .then((payload) => {
    console.log("Notificación recibida en frontend:", payload);
    if (document.hasFocus()) {
      alert(`${payload.notification.title}\n${payload.notification.body}`);
    } else {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/icon-192x192.png",
      });
    }
  })
  .catch((error) => {
    console.error("Error al escuchar notificaciones:", error);
  });

function Main() {
  return (
    <>
      <App />
    </>
  );
}

createRoot(document.getElementById("root")).render(<Main />);
