import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    command === 'serve' ? basicSsl() : null,
  ].filter(Boolean),
  server: {
    https: true,
    host: true,
    port: 5173
  }
}))
