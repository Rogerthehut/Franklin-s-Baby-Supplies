import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/postcss";
import path from "node:path";

// Standalone static build of just the homepage UI, for a look-and-feel
// preview on GitHub Pages. Bypasses the Cloudflare Worker / vinext / RSC
// pipeline entirely; this is a plain client-side React SPA, not the real
// deployable app (see DEPLOYMENT.md for that).
export default defineConfig({
  root: path.resolve(__dirname, "pages-preview"),
  base: "/Franklyn-s-Baby-Supplies/",
  publicDir: path.resolve(__dirname, "public"),
  resolve: {
    alias: {
      "@": __dirname,
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "dist-pages-preview"),
    emptyOutDir: true,
  },
});
