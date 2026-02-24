import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file for the current mode so we can read VITE_API_BASE_URL
  const env = loadEnv(mode, process.cwd(), '')

  // Derive backend origin from VITE_API_BASE_URL for the dev proxy
  // e.g. "http://localhost:8000/api/v1" → "http://localhost:8000"
  const _rawApiUrl = env.VITE_API_BASE_URL || 'https://report-api.dbagovlk.com/api/v1'
  // Force HTTPS for non-localhost URLs to prevent Mixed Content errors
  const apiUrl = _rawApiUrl.startsWith('http://')
    && !_rawApiUrl.includes('localhost')
    && !_rawApiUrl.includes('127.0.0.1')
    ? _rawApiUrl.replace('http://', 'https://')
    : _rawApiUrl
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
      allowedHosts: ['dba-report-fe-production.up.railway.app', 'reports.dbagovlk.com'],
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  }
})

