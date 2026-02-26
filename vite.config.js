import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['media/*'],
      manifest: {
        name: 'NatureSip',
        short_name: 'NatureSip',
        theme_color: '#ffffff',
        icons: [{ src: '/media/logo.png', sizes: '192x192', type: 'image/png' }]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,mp4}'],
        maximumFileSizeToCacheInBytes: 10000000 // up to 10MB to cache videos
      }
    })
  ],
  build: { chunkSizeWarningLimit: 1000, rollupOptions: { output: { manualChunks: undefined } } },
  base: '/',
})
