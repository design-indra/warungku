'use client'
import './globals.css'
import { useEffect } from 'react'
import OfflineBadge from '@/components/OfflineBadge'

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
  useEffect(() => {
    // Auto sync saat kembali online
    const handleOnline = async () => {
      const { syncPendingTransaksi } = await import('@/lib/useOfflineSync')
      await syncPendingTransaksi()
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

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

        {/* ── Splash screen styles ── */}
        <style dangerouslySetInnerHTML={{ __html: `
          #wk-splash {
            position: fixed;
            inset: 0;
            background: #1565e8;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            overflow: hidden;
            transition: opacity 0.6s ease, transform 0.6s ease;
          }
          #wk-splash.hide {
            opacity: 0;
            transform: scale(1.05);
            pointer-events: none;
          }

          /* Ripple */
          .wk-ripple {
            position: absolute;
            width: 220px; height: 220px;
            border-radius: 50%;
            background: rgba(255,255,255,0.05);
            animation: wkRipple 2.6s ease-out infinite;
          }
          .wk-ripple:nth-child(2) { animation-delay: 0.6s; }
          .wk-ripple:nth-child(3) { animation-delay: 1.2s; }
          @keyframes wkRipple {
            0%   { transform: scale(0.8); opacity: 0.6; }
            100% { transform: scale(3.5); opacity: 0; }
          }

          /* Wave bawah */
          .wk-wave {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 120px; z-index: 1;
            background: linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.07) 100%);
            clip-path: ellipse(130% 100% at 50% 100%);
            animation: wkFadeIn 1s ease 0.4s both;
          }

          /* Logo dalam lingkaran border putih */
          .wk-logo-wrap {
            width: 200px; height: 200px;
            z-index: 2;
            animation: wkLogoIn 0.9s cubic-bezier(0.34,1.46,0.64,1) 0.2s both;
            border-radius: 50%;
            border: 3px solid rgba(255,255,255,0.35);
            box-shadow: 0 0 0 10px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.2);
            overflow: hidden;
            margin-bottom: 12px;
          }
          .wk-logo-wrap img {
            width: 100%; height: 100%;
            object-fit: cover;
          }
          .wk-logo-fallback {
            width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            font-size: 80px;
          }
          @keyframes wkLogoIn {
            from { opacity: 0; transform: scale(0.3) translateY(50px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }

          /* Loading dots */
          .wk-dots {
            display: flex; gap: 8px;
            margin-top: 24px; z-index: 2;
            animation: wkFadeIn 0.6s ease 1s both;
          }
          .wk-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: rgba(255,255,255,0.35);
            animation: wkDotPulse 1.3s ease-in-out infinite;
          }
          .wk-dot:nth-child(2) { animation-delay: 0.2s; }
          .wk-dot:nth-child(3) { animation-delay: 0.4s; }
          @keyframes wkDotPulse {
            0%,100% { transform: scale(1);   background: rgba(255,255,255,0.3); }
            50%      { transform: scale(1.6); background: rgba(255,255,255,0.95); }
          }

          /* Versi */
          .wk-ver {
            position: absolute;
            bottom: max(36px, env(safe-area-inset-bottom, 36px));
            color: rgba(255,255,255,0.25);
            font-family: 'Inter', sans-serif;
            font-size: 11px; z-index: 2;
            animation: wkFadeIn 0.6s ease 1.3s both;
          }

          @keyframes wkFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}} />
      </head>
      <body>

        {/* ── Offline Badge ── */}
        <OfflineBadge />

        {/* ── Animated Splash Screen ── */}
        <div id="wk-splash">
          <div className="wk-ripple"></div>
          <div className="wk-ripple"></div>
          <div className="wk-ripple"></div>
          <div className="wk-wave"></div>

          <div className="wk-logo-wrap">
            <img
              src="/assets/logo.png"
              alt="WarungKu"
              onError="this.style.display='none';this.nextElementSibling.style.display='flex'"
            />
            <div className="wk-logo-fallback" style={{display:'none'}}>🏪</div>
          </div>

          <div className="wk-dots">
            <div className="wk-dot"></div>
            <div className="wk-dot"></div>
            <div className="wk-dot"></div>
          </div>

          <div className="wk-ver">v1.2.0</div>
        </div>

        {children}

        {/* ── Splash hide + anti-reload ── */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            // Sembunyikan splash setelah konten siap
            function hideSplash() {
              var s = document.getElementById('wk-splash');
              if (!s) return;
              s.classList.add('hide');
              setTimeout(function() { if (s.parentNode) s.parentNode.removeChild(s); }, 600);
            }

            if (document.readyState === 'complete') {
              setTimeout(hideSplash, 1800);
            } else {
              window.addEventListener('load', function() { setTimeout(hideSplash, 1800); });
              setTimeout(hideSplash, 3500); // fallback max 3.5 detik
            }

            // Disable pull-to-refresh
            var lastY = 0;
            document.addEventListener('touchstart', function(e) {
              lastY = e.touches[0].clientY;
            }, { passive: true });
            document.addEventListener('touchmove', function(e) {
              var y = e.touches[0].clientY;
              var el = e.target;
              while (el && el !== document.body) {
                if (el.scrollTop > 0) return;
                el = el.parentElement;
              }
              if (y > lastY && window.scrollY === 0) e.preventDefault();
            }, { passive: false });

            // Blokir F5 / Ctrl+R / Cmd+R
            document.addEventListener('keydown', function(e) {
              if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.metaKey && e.key === 'r')) {
                e.preventDefault();
              }
            });
          })();
        `}} />
      </body>
    </html>
  )
}
