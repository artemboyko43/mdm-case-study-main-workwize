import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const usePolling = process.env.CHOKIDAR_USEPOLLING === 'true'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: usePolling
      ? {
          usePolling: true,
          interval: 300,
        }
      : undefined,
  },
})
