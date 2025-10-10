import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5176,
    proxy: {
      '/api': {
        target: 'https://localhost:7029',
        changeOrigin: true,
        secure: false // This ignores SSL certificate errors
      }
    }
  }
})