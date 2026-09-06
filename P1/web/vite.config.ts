import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Évite les soucis CORS en dev : le navigateur parle à Vite,
      // Vite relaie vers l'API Laravel (voir backend/.env, port 8123).
      '/api': 'http://127.0.0.1:8123',
    },
  },
})
