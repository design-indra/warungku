/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // Cache halaman Next.js
    {
      urlPattern: /^https:\/\/.*\.vercel\.app\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    // Cache halaman app (dashboard, kasir, dll)
    {
      urlPattern: /^https:\/\/.*\.vercel\.app\/dashboard.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
      },
    },
    // Cache API barang
    {
      urlPattern: /^https:\/\/.*\.vercel\.app\/api\/barang.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-barang',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 },
      },
    },
    // Cache gambar
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
    // Cache font & CSS
    {
      urlPattern: /\.(?:woff|woff2|ttf|eot|css)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-fonts',
        expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
  ],
})

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
}

module.exports = withPWA(nextConfig)
