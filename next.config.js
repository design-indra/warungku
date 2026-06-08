const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // ── Static Next.js ─────────────────────────────────
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static',
          expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      // ── Static assets ──────────────────────────────────
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot|css)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      // ── Halaman dashboard ───────────────────────────────
      {
        urlPattern: /\/dashboard.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-dashboard',
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
        },
      },
      // ── API barang ──────────────────────────────────────
      {
        urlPattern: /\/api\/barang.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-barang',
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 },
        },
      },
      // ── API profil & subscription ───────────────────────
      {
        urlPattern: /\/api\/(?:pengaturan\/profil|subscription\/status).*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-config',
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 6 },
        },
      },
      // ── Supabase auth — jangan cache ────────────────────
      {
        urlPattern: /supabase\.co\/auth.*/i,
        handler: 'NetworkOnly',
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
