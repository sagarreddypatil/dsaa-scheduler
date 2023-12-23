import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "dsaa schd",
        short_name: "schd",
        description: "Personal task scheduler",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      injectRegister: null,
      srcDir: "src",
      filename: "sw.ts",
      strategies: "injectManifest",

      workbox: {
        swDest: "sw.js",
      }, // TODO: add workbox config
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
});
