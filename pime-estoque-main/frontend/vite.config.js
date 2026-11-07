import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  server: { port: 9999 }, // mesmo valor de FRONT_URL no .env do backend
  plugins: [react()],
})
