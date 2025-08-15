import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "../src/styles/index.css";

import { registerSW } from "virtual:pwa-register";

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

function Main() {
  return <App />;
}

createRoot(document.getElementById("root")).render(<Main />);
