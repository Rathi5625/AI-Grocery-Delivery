import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,          // Match the port expected by Spring Boot CORS config
    strictPort: true,    // Fail if port 3000 is taken (don't silently fallback)
  },
})
