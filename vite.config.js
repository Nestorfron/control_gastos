import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // actualiza automáticamente el SW
      includeAssets: ["favicon.svg", "robots.txt", "icons/*.png"],
      manifest: {
        name: "Control de Gastos",
        short_name: "Gastos",
        description: "Controla tus ingresos y gastos. Todo local en tu dispositivo.",
        theme_color: "#0ea5a4",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/maskable-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts-stylesheets" }
          },
          {
            urlPattern: /^https?:.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: { cacheName: "images" }
          }
        ]
      }
    })
  ]
});
