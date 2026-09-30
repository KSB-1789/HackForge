import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // D-015: without this the browser sees :5173 calling :5000, which is
  // cross-origin, so CORS gets exercised in development for no benefit. The proxy
  // makes dev look like production, where one origin serves both. CORS is still
  // configured on the server and still tested against the deployed build.
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
