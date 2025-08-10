import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
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
          {
            src: "/icons/maskable-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
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
  ],
  define: {
    "__FIREBASE_API_KEY__": JSON.stringify(process.env.VITE_FIREBASE_API_KEY),
    "__FIREBASE_AUTH_DOMAIN__": JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN),
    "__FIREBASE_PROJECT_ID__": JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID),
    "__FIREBASE_STORAGE_BUCKET__": JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET),
    "__FIREBASE_MESSAGING_SENDER_ID__": JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    "__FIREBASE_APP_ID__": JSON.stringify(process.env.VITE_FIREBASE_APP_ID)
  }
});
