import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      // Bundle analyzer - only in analyze mode
      mode === 'analyze' && visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      strictPort: false,
      host: "localhost",
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY_TARGET || "http://localhost:4000",
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
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'azure-vendor': ['@azure/msal-browser', '@azure/msal-react'],
            'apollo-vendor': ['@apollo/client', 'graphql'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'ui-vendor': ['lucide-react', 'clsx'],
          },
        },
      },
      // Enable source maps for production debugging (optional)
      sourcemap: mode === 'production' ? false : true,
    }
  };
});
