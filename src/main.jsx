import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "../src/styles/index.css";

import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Hay una nueva versión. ¿Deseas actualizar?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App lista para funcionar offline.");
  }
});

createRoot(document.getElementById("root")).render(<App />);
