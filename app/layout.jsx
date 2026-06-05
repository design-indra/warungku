import './globals.css'

export const metadata = {
  title: 'WarungKu — Kelola Warung Makin Mudah',
  description: 'Aplikasi kasir dan manajemen warung serba bisa. Stok, laporan, hutang pelanggan dalam satu aplikasi.',
  manifest: '/manifest.json',
  themeColor: '#1d4ed8',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WarungKu',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />

        {/* Apple PWA */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WarungKu" />

        {/* Android PWA */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1d4ed8" />

        {/* Splash screen Apple (opsional, pakai logo) */}
        <link rel="apple-touch-startup-image" href="/assets/login.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
