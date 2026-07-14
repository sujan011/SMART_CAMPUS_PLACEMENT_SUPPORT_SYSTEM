import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
    resolve: {
      alias: {
        html2canvas: resolve(
          __dirname,
          'node_modules/html2canvas-pro'
        ),
      },
    },
})
