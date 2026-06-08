const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false,

  fallbackRoutes: {
    document: '/offline.html',
  },

  workboxOptions: {
    disableDevLogs: true,

    additionalManifestEntries: [
      { url: '/offline.html', revision: '1' },
    ],

    runtimeCaching: [
      // Static Next.js chunks
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static',
          expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },

      // Static assets (gambar, font, css)
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot|css)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },

      // FIX 14: Halaman dashboard — tambah cachingStrategy yang lebih robust.
      // Sebelumnya hanya NetworkFirst tanpa fallback eksplisit ke offline.html.
      // Workbox sudah handle via fallbackRoutes, tapi perlu pastikan
      // cacheName konsisten dan expiration cukup panjang untuk offline lama.
      {
        urlPattern: /\/dashboard.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-dashboard',
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 hari
        },
      },

      // API barang — NetworkFirst, fallback cache offline
      {
        urlPattern: /\/api\/barang.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-barang',
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 }, // 24 jam
        },
      },

      // API profil & subscription
      {
        urlPattern: /\/api\/(?:pengaturan\/profil|subscription\/status).*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-config',
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 6 },
        },
      },

      // FIX 15: Tambah cache untuk _next/data (RSC payload Next.js 14).
      // Tanpa ini, navigasi client-side ke halaman yang pernah dikunjungi
      // akan gagal offline karena fetch ke /_next/data/... tidak ter-cache.
      {
        urlPattern: /\/_next\/data\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'next-data',
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
        },
      },

      // Supabase auth — JANGAN PERNAH cache
      {
        urlPattern: /supabase\.co\/auth.*/i,
        handler: 'NetworkOnly',
      },

      // Supabase REST API — NetworkFirst
      {
        urlPattern: /supabase\.co\/rest.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-rest',
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
        },
      },
    ],
  },
})

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
}

module.exports = withPWA(nextConfig)
