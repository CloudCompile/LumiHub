import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/chub': {
        target: 'https://gateway.chub.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chub/, ''),
        secure: false,
      },
      '/api/v1': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
