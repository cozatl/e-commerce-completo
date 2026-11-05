import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Django backend used by the dev proxy (never exposed to the browser)
  const target = env.VITE_PROXY_TARGET || 'http://localhost:8000'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // In dev the browser talks to Vite (same origin) and Vite forwards to Django,
      // so there are no CORS problems. CORS is still enabled in Django for production.
      proxy: {
        '/api': { target, changeOrigin: true },
        '/media': { target, changeOrigin: true },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/vitest.setup.ts',
      pool: 'threads',
    },
  }
})
