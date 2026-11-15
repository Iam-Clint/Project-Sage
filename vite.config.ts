import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5180, strictPort: true },
  preview: { port: 5181, strictPort: true },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'motion', test: /node_modules[\\/](?:motion|framer-motion|motion-dom|motion-utils)[\\/]/ },
            { name: 'auth-client', test: /node_modules[\\/](?:@neon|@better-auth|better-auth|@supabase)[\\/]/ },
          ],
        },
      },
    },
  },
})
