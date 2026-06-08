const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false, // Jangan auto reload — kita handle manual via OnlineSyncHandler

  workboxOptions: {
    disableDevLogs: true,

    // ── Navigations (halaman HTML) — fallback ke cache ─────────────────────
    // Ini kunci utama agar halaman dashboard bisa dibuka offline
    navigateFallback: '/dashboard/kasir',
    navigateFallbackDenylist: [
      /^\/auth\//,        // Jangan fallback halaman auth
      /^\/api\//,         // Jangan fallback API routes
      /^\/_next\//,       // Jangan fallback asset Next.js internal
    ],

    runtimeCaching: [
      // ── Static Next.js chunks ──────────────────────────
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static',
          expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },

      // ── Static assets (gambar, font, css) ─────────────
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot|css)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },

      // ── Halaman dashboard — NetworkFirst + fallback cache ──
      // networkTimeoutSeconds: 4 detik coba network, kalau gagal pakai cache
      {
        urlPattern: /\/dashboard.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-dashboard',
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
        },
      },

      // ── API barang — NetworkFirst, fallback cache offline ──
      {
        urlPattern: /\/api\/barang.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-barang',
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 },
        },
      },

      // ── API profil & subscription ──────────────────────
      {
        urlPattern: /\/api\/(?:pengaturan\/profil|subscription\/status).*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-config',
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 6 },
        },
      },

      // ── Supabase auth — JANGAN PERNAH cache ───────────
      // Token auth harus selalu fresh dari server
      {
        urlPattern: /supabase\.co\/auth.*/i,
        handler: 'NetworkOnly',
      },

      // ── Supabase REST API — NetworkFirst ───────────────
      // Jika offline, fallback ke cache response terakhir
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
