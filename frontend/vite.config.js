import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Add this to ensure relative paths in the build
  server: {
    port: 3000,
    host: true,
  }
})