import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// Polling solo cuando hace falta (Docker Desktop en Windows/Mac), controlado por env.
// En Linux nativo el inotify funciona, así que se deja apagado para no malgastar CPU.
const usePolling = process.env.CHOKIDAR_USEPOLLING === "true";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // escucha en 0.0.0.0 (accesible desde fuera del contenedor)
    port: 5173,
    watch: usePolling ? { usePolling: true, interval: 300 } : undefined,
  },
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
