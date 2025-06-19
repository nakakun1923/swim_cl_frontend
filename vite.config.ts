import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // ← 必須
    port: 5173,
    watch: {
      usePolling: true  // ← Dockerでは推奨
    }
  }
})
