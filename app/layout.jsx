import './globals.css'

export const metadata = {
  title: 'WarungKu — Aplikasi Manajemen Warung',
  description: 'Kelola warung Anda dengan lebih mudah. Kasir, stok, laporan, hutang pelanggan dalam satu aplikasi.',
  manifest: '/manifest.json',
  themeColor: '#1e3a8a',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WarungKu',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  )
}
