import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set third parameter to '' to load all env regardless of prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"), // same as working config
      },
    },
    server: {
      port: 3000,
      strictPort: true, // match working config
      host: "localhost",
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 3000,
      host: true, // ensures binding to 0.0.0.0
      allowedHosts: ["qatalyst.tech"],
    },
    envDir: ".",
    envPrefix: ["VITE_", "STORAGE_", "CONTAINER_", "AZURE_", "SAS_"],
    build: {
      chunkSizeWarningLimit: 3000,
    },
  };
});
