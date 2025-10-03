import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import { viteExternalsPlugin } from 'vite-plugin-externals'
// import vueDevTools from 'vite-plugin-vue-devtools'

const isDev = process.env.NODE_ENV != 'production'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    //  vueDevTools()
    viteExternalsPlugin({ xmlbuilder2: 'xmlbuilder2' }),
  ],
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
        additionalData: `@import "@/scss/_vars.scss";`,
      },
    },
  },
  server: {
    port: 5001,
  },
  build: {
    minify: !isDev,
  },
  esbuild: {
    treeShaking: true,
    legalComments: 'external',
    platform: 'browser',
    target: 'esnext',
    globalName: 'script',
  },
})
