import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "../src/styles/index.css";

import { registerSW } from "virtual:pwa-register";
import { requestPermission, onMessageListener } from "./firebase";

import { db } from "../src/database/db"; 

const API_URL = import.meta.env.VITE_API_URL;

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Hay una nueva versión. ¿Deseas actualizar?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App lista para funcionar offline.");
  },
});

async function sendTokenToBackend(token) {
  try {
    const res = await fetch("http://localhost:5000/register-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      console.warn("No se pudo guardar token en backend:", await res.text());
    } else {
      return await res.json();
    }
  } catch (error) {
    console.error("Error enviando token al backend:", error);
  }
}

async function sendAllPendientesToBackend(token) {
  try {
    const listas = await db.listasMensuales.toArray();
    const pendientesLista = listas.flatMap(lista =>
      (lista.pendientes || []).map(p => {
        const fechaBase = p.vencimiento || p.fecha;
        const fechaConHora = fechaBase.includes("T")
          ? fechaBase
          : `${fechaBase}T00:00`;
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
    
    const res = await fetch(API_URL + "/sync-pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, pagos: pendientesLista }),
    });

    if (!res.ok) {
      console.warn("No se pudo sincronizar pagos:", await res.text());
      return;
    }

    const respuesta = await res.json();
    return respuesta;

  } catch (error) {
    console.error("Error enviando pendientes:", error);
  }
}


let lastPagosString = null;

async function checkAndSyncPagos(token) {
  try {
    
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
      lastPagosString = pagosString;
      await sendAllPendientesToBackend(token, pagosPendientes);
    }
  } catch (error) {
    console.error("Error leyendo pagos desde Dexie o sincronizando:", error);
  }
}


requestPermission()
  .then(async (token) => {
    if (token) {
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

  onMessageListener()
  .then((payload) => {
       
    if (document.hasFocus()) {
      
      alert(`${payload.notification.title}\n${payload.notification.body}`);
    } else {
      
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/icon-192.png",
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
