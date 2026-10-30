import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base: './' keeps every generated asset relative, so the same dist works at
// the domain root (Vercel), under a repository sub-path (GitHub Pages), and
// inside the static-asset importer of platforms such as 秒哒.
export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'es2019',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1200,
  },
})
