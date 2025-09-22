import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    //  vueDevTools()
  ],
  define: { DEV: !process.env.PROD },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Optional: Silence Sass deprecation warnings. See note below.
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'color-functions', 'global-builtin'],
        additionalData: `@import "bootstrap/scss/bootstrap.scss";`,
        // additionalData: `@import "bootstrap/scss/_functions.scss";@import "bootstrap/scss/_variables.scss";`,
      },
    },
  },
  server: {
    port: 5001,
  },
})
