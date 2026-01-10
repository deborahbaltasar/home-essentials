import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["settla-icon.svg", "settla-icon-maskable.svg"],
      manifest: {
        name: "Settla",
        short_name: "Settla",
        description: "Checklist para organizar sua casa nova.",
        theme_color: "#0f766e",
        background_color: "#f8fafc",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/settla-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
          {
            src: "/settla-icon-maskable.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});