import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "images/pwa1.png",
        "images/pwa2.png",
        "images/favicon.ico",
        "images/logo4.png",
        "images/logo3.png",
        "images/logo2.png",
        "images/logo1.png",
        "images/logo.png",
      ],
      manifest: {
        name: "Smartflow 360",
        short_name: "Smartflow 360",
        description: "Progressive ERP System",
        theme_color: "#d8b76a",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/images/pwa1.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/images/pwa2.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MB

        // ✅ MOVE runtimeCaching INSIDE workbox
        runtimeCaching: [
          {
            urlPattern: /^http:\/\/localhost:5000\/api\/.*$/,
            // urlPattern: /^https:\/\/erp-backend-joj6\.onrender\.com\/api\/.*$/,
            // urlPattern: /^https:\/\/api\.smartflow360\.com\/api\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [0, 200, 201, 202, 203, 206, 205, 204],
              },
            },
          },
        ],
      },
    }),
  ],
});
