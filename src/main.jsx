import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "../src/styles/index.css";

// registro del SW con posibilidad de actualizar
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    // aquí podrías mostrar un toast que diga "Nueva versión disponible"
    if (confirm("Hay una nueva versión. ¿Deseas actualizar?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App lista para funcionar offline.");
  }
});

createRoot(document.getElementById("root")).render(<App />);
