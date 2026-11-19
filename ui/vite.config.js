import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { readFileSync } from 'node:fs'

// Versions come from the manifests so the UI can't drift from them:
// the app (package.json) and the API service that /health reports (functions/package.json).
const readVersion = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')).version

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(readVersion('./package.json')),
    __API_VERSION__: JSON.stringify(readVersion('./functions/package.json')),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
