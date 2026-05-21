import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    // permite abrir dist/index.html diretamente sem servidor
    assetsInlineLimit: 0,
  },
})
