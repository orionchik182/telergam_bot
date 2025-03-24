import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    allowedHosts: ["89ab-176-221-227-68.ngrok-free.app"],
  },

  build: {
    outDir: "docs",
  },
});
