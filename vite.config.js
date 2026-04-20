import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file for the current mode so we can read VITE_API_BASE_URL
  const env = loadEnv(mode, process.cwd(), '')

  // Derive backend origin from VITE_API_BASE_URL for the dev proxy
  // e.g. "http://localhost:8000/api/v1" → "http://localhost:8000"
  const apiUrl = env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  const backendOrigin = apiUrl.replace(/\/api\/v1.*$/, '')

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        // Forward /api requests to the backend during local dev
        '/api': {
          target: backendOrigin,
          changeOrigin: true,
        },
      },
    },
    preview: {
      // Used by "vite preview" (Railway start command)
      port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
      host: '0.0.0.0',
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  }
})

