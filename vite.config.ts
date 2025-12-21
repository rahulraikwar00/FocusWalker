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
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  // This tells Vite to look for index.html inside the client folder
  root: path.resolve(import.meta.dirname, "client"),

  build: {
    // This puts the frontend exactly where your Express server looks for it (dist/public)
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      // Ensure index.html is the entry point
      input: path.resolve(import.meta.dirname, "client", "index.html"),
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-leaflet", "leaflet"],
        },
      },
    },
  },

  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
