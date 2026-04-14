import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:3002',
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon-180.png'],
      devOptions: { enabled: true },
      manifest: {
        name: 'ParkWise',
        short_name: 'ParkWise',
        description: 'Réservation et guidage de parking intelligent',
        theme_color: '#2E7D32',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          // Guidage : CacheFirst — doit fonctionner hors-ligne dans le parking
          {
            urlPattern: ({ url }) => url.href.includes('/api/guide/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'guide-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Réservations : NetworkFirst — affiche le cache si hors-ligne
          {
            urlPattern: ({ url }) => url.href.includes('/api/reservations'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'reservations-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
