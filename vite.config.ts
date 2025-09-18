import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// configurado asi porque sino la web tira problemas de CORS al hacer requests al backend
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
