const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false,

  // fallbackRoutes: SW akan serve file ini saat halaman tidak tersedia offline
  fallbackRoutes: {
    document: '/offline.html',
  },

  workboxOptions: {
    disableDevLogs: true,

    // offline.html di-precache agar selalu tersedia sebagai fallback
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

      // Halaman dashboard — NetworkFirst dengan timeout
      // Jika offline, SW fallback ke cache. Jika cache juga tidak ada, tampil offline.html
      {
        urlPattern: /\/dashboard.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-dashboard',
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
        },
      },

      // API barang — NetworkFirst, fallback cache offline
      {
        urlPattern: /\/api\/barang.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-barang',
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 },
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
