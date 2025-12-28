import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

// #####################################################
// # FULL PRODUCTION VITE CONFIGURATION
// #####################################################
// ... existing imports

export default defineConfig({
  // CHANGE: Use "/" for SPAs and PWAs to ensure absolute paths for assets
  base: "/",

  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
    metaImagesPlugin(),
    // ... conditional plugins
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      // Ensure this matches your actual folder name on disk
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  // This tells Vite to look for index.html inside the client folder
  root: path.resolve(import.meta.dirname, "client"),

  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: false,
    reportCompressedSize: false,
    // Optimization: CSS code splitting ensures HUD styles load fast
    cssCodeSplit: true,
    rollupOptions: {
      input: path.resolve(import.meta.dirname, "client", "index.html"),
      output: {
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        manualChunks(id) {
          // Put ALL react-related core libraries in vendor
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-leaflet/") ||
            id.includes("node_modules/leaflet/") ||
            id.includes("node_modules/@react-leaflet/")
          ) {
            return "core-engine";
          }

          // Keep turf separate as it is pure math and doesn't use React context
          if (id.includes("@turf")) {
            return "spatial-math";
          }
        },
      },
    },
  },
  server: {
    cors: true,
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
