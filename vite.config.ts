import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: 3000,
      strictPort: false,
      host: "localhost",
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
        },
      }
    },
    preview: {
      port: 3000,
      host: true, // 👈 ensures it binds to 0.0.0.0
      allowedHosts: ['qatalyst.tech']
    },
    // Load environment variables from .env file
    envDir: ".",
    envPrefix: ["VITE_"],
    build: {
      chunkSizeWarningLimit: 3000,
    }
  };
});
