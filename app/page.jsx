'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const FEATURES = [
  { icon: '🛒', title: 'Kasir POS', desc: 'Proses transaksi cepat, hitung kembalian otomatis, cetak atau share struk lewat WhatsApp.' },
  { icon: '📦', title: 'Manajemen Stok', desc: 'CRUD barang lengkap, scan barcode pabrikan, alert stok menipis, import CSV/XLS.' },
  { icon: '📊', title: 'Laporan Lengkap', desc: 'Omzet harian, mingguan, bulanan. Laba kotor & barang terlaris setiap saat.' },
  { icon: '👥', title: 'Hutang Pelanggan', desc: 'Catat hutang, bayar sebagian, riwayat per pelanggan secara rapi.' },
  { icon: '🏪', title: 'Multi Cabang', desc: 'Kelola lebih dari satu cabang warung dari satu akun terpusat.' },
  { icon: '📱', title: 'Install di HP', desc: 'Bisa diinstall seperti aplikasi native di Android dan iOS (PWA).' },
]

const PLANS = [
  {
    name: 'Free', price: 'Rp 0', period: 'selamanya',
    desc: 'Cocok untuk mulai mencoba WarungKu.',
    highlight: false,
    features: [
      { text: '250 barang', ok: true }, { text: '1 kasir', ok: true }, { text: '1 cabang', ok: true },
      { text: 'Kasir & POS', ok: true }, { text: 'Manajemen stok', ok: true }, { text: 'Data pelanggan', ok: true },
      { text: 'Manajemen hutang', ok: false }, { text: 'Laporan bulanan', ok: false },
    ],
    cta: 'Mulai Gratis', href: '/auth/register',
  },
  {
    name: 'Basic', price: 'Rp 29.000', period: '/bulan',
    desc: 'Paling pas untuk UMKM yang ingin tumbuh.', badge: 'Rekomendasi',
    highlight: true,
    features: [
      { text: '500 barang', ok: true }, { text: '3 kasir', ok: true }, { text: '3 cabang', ok: true },
      { text: 'Kasir & POS', ok: true }, { text: 'Manajemen stok', ok: true }, { text: 'Data pelanggan', ok: true },
      { text: 'Manajemen hutang', ok: true }, { text: 'Laporan bulanan', ok: true },
    ],
    cta: 'Pilih Basic', href: '/auth/register',
  },
  {
    name: 'Pro', price: 'Rp 48.000', period: '/bulan',
    desc: 'Untuk bisnis besar dengan kontrol penuh.',
    highlight: false,
    features: [
      { text: 'Barang unlimited', ok: true }, { text: 'Kasir unlimited', ok: true }, { text: 'Cabang unlimited', ok: true },
      { text: 'Kasir & POS', ok: true }, { text: 'Manajemen stok', ok: true }, { text: 'Data pelanggan', ok: true },
      { text: 'Manajemen hutang', ok: true }, { text: 'Laporan & analitik lengkap', ok: true },
    ],
    cta: 'Pilih Pro', href: '/auth/register',
  },
]

const REVIEWS = [
  { name: 'Sari Dewi', role: 'Warung Sembako, Surabaya', avatar: 'SD', stars: 5,
    text: 'WarungKu beneran ngebantu banget! Dulu nyatat hutang pelanggan di buku, sering kelewat. Sekarang semua tercatat rapi dan bisa dicek kapan aja dari HP.' },
  { name: 'Budi Santoso', role: 'Toko Kelontong, Malang', avatar: 'BS', stars: 5,
    text: 'Laporan hariannya keren, langsung tahu untung berapa. Fitur kasirnya simpel, karyawan saya langsung bisa pakai tanpa diajari lama.' },
  { name: 'Rina Marlina', role: 'Warung Makan, Bandung', avatar: 'RM', stars: 5,
    text: 'Paket Basic harganya terjangkau banget untuk fitur selengkap ini. Manajemen stok bumbu jadi jauh lebih gampang, ga pernah kehabisan stok lagi.' },
  { name: 'Hendra Wijaya', role: 'Mini Market, Jakarta', avatar: 'HW', stars: 5,
    text: 'Sudah coba beberapa aplikasi kasir lain, WarungKu yang paling ringan dan mudah dipakai. Bisa install di HP juga jadi praktis banget buat usaha saya.' },
  { name: 'Fitri Handayani', role: 'Toko Sembako, Yogyakarta', avatar: 'FH', stars: 5,
    text: 'Awalnya ragu karena gratis, tapi ternyata fiturnya lengkap! Upgrade ke Basic setelah sebulan pakai, dan tidak menyesal sama sekali. Recommended!' },
]

const STATS = [
  { value: '10.000+', label: 'Warung Terdaftar' },
  { value: '99.9%', label: 'Uptime Server' },
  { value: '4.9/5', label: 'Rating Pengguna' },
  { value: 'Gratis', label: 'Mulai Pakai' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Instrument Sans', 'DM Sans', sans-serif", background: '#0a0a0f', color: '#e8e6f0' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --gold: #c9a84c;
          --gold-light: #e8c97a;
          --gold-dim: #7a6130;
          --surface: #13121a;
          --surface-2: #1a1826;
          --surface-3: #211f2e;
          --border: rgba(201,168,76,0.15);
          --border-soft: rgba(255,255,255,0.07);
          --text-muted: #7c7a8e;
          --text-dim: #4a4860;
          --radius: 16px;
          --radius-sm: 10px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* Noise overlay */
        body::before {
          content: '';
          position: fixed; inset: 0; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        .serif-italic { font-family: 'Instrument Serif', Georgia, serif; font-style: italic; }

        /* Glow orbs */
        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(120px); pointer-events: none;
        }

        /* Glass card */
        .glass {
          background: rgba(255,255,255,0.03);
          border: 0.5px solid var(--border-soft);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .glass-gold {
          background: linear-gradient(135deg, rgba(201,168,76,0.06), rgba(201,168,76,0.02));
          border: 0.5px solid var(--border);
        }

        /* Gold gradient text */
        .text-gold {
          background: linear-gradient(135deg, #e8c97a 0%, #c9a84c 50%, #a07d2a 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Premium button */
        .btn-gold {
          background: linear-gradient(135deg, #c9a84c, #a07d2a);
          color: #0a0a0f;
          font-weight: 700;
          border: none;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .btn-gold::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #e8c97a, #c9a84c);
          opacity: 0; transition: opacity 0.3s;
        }
        .btn-gold:hover::before { opacity: 1; }
        .btn-gold:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(201,168,76,0.35); }

        .btn-outline {
          background: transparent;
          border: 0.5px solid var(--border);
          color: var(--gold-light);
          transition: all 0.3s;
        }
        .btn-outline:hover {
          background: rgba(201,168,76,0.08);
          border-color: var(--gold);
          transform: translateY(-1px);
        }

        /* Divider line */
        .divider {
          width: 48px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }

        /* Shimmer badge */
        .badge-premium {
          background: linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05));
          border: 0.5px solid var(--border);
          color: var(--gold-light);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 100px;
        }

        /* Feature card */
        .feature-card {
          background: var(--surface);
          border: 0.5px solid var(--border-soft);
          border-radius: var(--radius);
          padding: 28px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .feature-card:hover {
          border-color: var(--border);
          background: var(--surface-2);
          transform: translateY(-3px);
        }
        .feature-card:hover::before { opacity: 1; }

        /* Stat separator */
        .stat-sep { width: 1px; background: var(--border-soft); align-self: stretch; }

        /* Review card */
        .review-card {
          background: var(--surface);
          border: 0.5px solid var(--border-soft);
          border-radius: var(--radius);
          padding: 24px;
          transition: border-color 0.3s;
        }
        .review-card:hover { border-color: var(--border); }

        /* Pricing card */
        .plan-card {
          background: var(--surface);
          border: 0.5px solid var(--border-soft);
          border-radius: 20px;
          padding: 32px 28px;
          transition: all 0.3s;
        }
        .plan-card:hover { border-color: var(--border); }
        .plan-popular {
          background: linear-gradient(160deg, #1c1a2a 0%, #14121e 100%);
          border: 1px solid var(--gold-dim);
          position: relative;
          overflow: hidden;
        }
        .plan-popular::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }

        /* Avatar ring */
        .avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, var(--gold-dim), #2a2518);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
          color: var(--gold-light);
          flex-shrink: 0;
        }

        /* Nav */
        .navbar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(10,10,15,0.85);
          border-bottom: 0.5px solid var(--border-soft);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        /* Section label */
        .section-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 16px;
        }
        .section-eyebrow::before, .section-eyebrow::after {
          content: ''; display: block;
          width: 24px; height: 0.5px;
          background: var(--gold-dim);
        }

        /* Scroll reviews */
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        /* Footer */
        .footer-link { color: var(--text-muted); font-size: 13px; text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: var(--gold-light); }

        /* Floating animation */
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes rotateSlow { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes pulseGlow { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
        .float-anim { animation: floatY 7s ease-in-out infinite; }
        .pulse-orb { animation: pulseGlow 4s ease-in-out infinite; }

        /* Mock card shine */
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .shimmer-line {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 30%, rgba(201,168,76,0.07) 50%, transparent 70%);
          animation: shimmer 3s infinite;
          pointer-events: none;
        }

        @media (max-width: 640px) {
          .hero-title { font-size: 2.4rem !important; }
          .stats-row { flex-wrap: wrap; }
          .stat-sep { display: none; }
          .plan-popular { transform: none !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/assets/logo.png" alt="WarungKu" width={32} height={32} style={{ borderRadius: 8 }} />
            <span style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>WarungKu</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/auth/login" style={{ padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color='var(--gold-light)'}
              onMouseLeave={e => e.target.style.color='var(--text-muted)'}>
              Masuk
            </Link>
            <Link href="/auth/register" className="btn-gold" style={{ padding: '9px 22px', borderRadius: 100, fontSize: 13, textDecoration: 'none', display: 'inline-block', position: 'relative', zIndex: 1 }}>
              <span style={{ position: 'relative', zIndex: 1 }}>Daftar Gratis →</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '80px 24px' }}>
        {/* Orbs */}
        <div className="orb pulse-orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(201,168,76,0.12), transparent 70%)', top: '-150px', left: '-150px' }} />
        <div className="orb pulse-orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,76,201,0.1), transparent 70%)', bottom: '-100px', right: '-100px', animationDelay: '2s' }} />
        <div className="orb" style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(201,168,76,0.06), transparent 70%)', top: '40%', left: '55%' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', position: 'relative', zIndex: 1 }}>

          {/* Left: Text */}
          <div>
            <div className="section-eyebrow">Manajemen Warung Modern</div>
            <h1 className="hero-title serif" style={{ fontSize: '3.6rem', lineHeight: 1.1, fontWeight: 400, color: '#f5f3ff', marginBottom: 20, letterSpacing: '-0.02em' }}>
              Warungmu Makin<br />
              <span className="serif-italic text-gold">Maju & Cerdas</span>
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 36, maxWidth: 440 }}>
              Kasir POS, stok barang, hutang pelanggan, laporan lengkap — semua dalam satu aplikasi premium. Bisa install di HP kamu!
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link href="/auth/register" className="btn-gold" style={{ padding: '14px 32px', borderRadius: 100, fontSize: 14, textDecoration: 'none', display: 'inline-block', position: 'relative', zIndex: 1 }}>
                <span style={{ position: 'relative', zIndex: 1 }}>Mulai Gratis Sekarang →</span>
              </Link>
              <Link href="/auth/login" className="btn-outline" style={{ padding: '14px 28px', borderRadius: 100, fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'inline-block' }}>
                Sudah punya akun
              </Link>
            </div>
            {/* Trust badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {['✓ Gratis selamanya', '✓ Tanpa kartu kredit', '✓ Setup 2 menit'].map(t => (
                <span key={t} style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Right: Mock dashboard */}
          <div className="float-anim" style={{ position: 'relative' }}>
            <div className="glass-gold" style={{ borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden' }}>
              <div className="shimmer-line" />

              {/* Dashboard header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Total Omzet Hari Ini</p>
                  <p className="serif text-gold" style={{ fontSize: '2rem', fontWeight: 400 }}>Rp 1.250.000</p>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(201,168,76,0.1)', border: '0.5px solid var(--border)', fontSize: 22 }}>📈</div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
                {[['42', 'Transaksi', '↑ 12%'], ['18', 'Produk Terjual', '↑ 8%'], ['3', 'Hutang Baru', '→ Sama']].map(([v, l, ch]) => (
                  <div key={l} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border-soft)', borderRadius: 12, padding: '12px 14px' }}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#f5f3ff', lineHeight: 1 }}>{v}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{l}</p>
                    <p style={{ fontSize: 10, color: 'var(--gold)', marginTop: 2, fontWeight: 600 }}>{ch}</p>
                  </div>
                ))}
              </div>

              {/* Recent transactions */}
              <div style={{ borderTop: '0.5px solid var(--border-soft)', paddingTop: 16 }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Transaksi Terbaru</p>
                {[
                  ['Indomie Goreng', '2x', 'Rp 7.000'],
                  ['Aqua 600ml', '1x', 'Rp 4.000'],
                  ['Rokok Surya 12', '1x', 'Rp 24.000'],
                ].map(([name, qty, price]) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid var(--border-soft)' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)' }} />
                      <span style={{ fontSize: 12, color: '#ccc' }}>{name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{qty}</span>
                      <span style={{ fontSize: 12, color: 'var(--gold-light)', fontWeight: 600 }}>{price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div className="glass-gold" style={{ position: 'absolute', top: -18, right: -18, borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#f5f3ff' }}>Stok Rendah</p>
                <p style={{ fontSize: 10, color: 'var(--gold)' }}>5 produk perlu restock</p>
              </div>
            </div>

            {/* Floating scan badge */}
            <div className="glass" style={{ position: 'absolute', bottom: -16, left: -16, borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>📷</span>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#f5f3ff' }}>Scan Barcode</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Auto-isi nama produk</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ borderTop: '0.5px solid var(--border-soft)', borderBottom: '0.5px solid var(--border-soft)', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 0 }} className="stats-row">
          {STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              <div style={{ flex: 1, textAlign: 'center', padding: '0 32px' }}>
                <p className="serif text-gold" style={{ fontSize: '2rem', fontWeight: 400, marginBottom: 6 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</p>
              </div>
              {i < STATS.length - 1 && <div className="stat-sep" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
        <div className="orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(201,168,76,0.07), transparent 70%)', top: '10%', right: '-100px' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Fitur Lengkap</div>
            <h2 className="serif" style={{ fontSize: '2.6rem', fontWeight: 400, color: '#f5f3ff', marginBottom: 16, letterSpacing: '-0.02em' }}>
              Semua yang kamu<br /><span className="serif-italic text-gold">butuhkan</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7, fontSize: 15 }}>
              Dirancang khusus untuk warung sembako, toko kelontong, dan UMKM Indonesia
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="feature-card">
                <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f5f3ff', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCREENSHOT / APP PREVIEW ── */}
      <section style={{ padding: '80px 24px', borderTop: '0.5px solid var(--border-soft)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Tampilan Aplikasi</div>
          <h2 className="serif" style={{ fontSize: '2.4rem', fontWeight: 400, color: '#f5f3ff', marginBottom: 48, letterSpacing: '-0.02em' }}>
            Desain yang <span className="serif-italic text-gold">intuitif</span> & cepat
          </h2>
          <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', border: '0.5px solid var(--border)' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(10,10,15,0.9) 100%)', zIndex: 1, pointerEvents: 'none' }} />
            <Image
              src="/assets/login.png"
              alt="WarungKu App Preview"
              width={900}
              height={500}
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
        <div className="orb" style={{ width: 600, height: 400, background: 'radial-gradient(circle, rgba(99,76,201,0.08), transparent 70%)', bottom: '0', left: '-100px' }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Harga Transparan</div>
            <h2 className="serif" style={{ fontSize: '2.6rem', fontWeight: 400, color: '#f5f3ff', marginBottom: 16, letterSpacing: '-0.02em' }}>
              Mulai gratis,<br /><span className="serif-italic text-gold">upgrade kapan saja</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Harga terjangkau, fitur lengkap untuk semua skala usaha</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
            {PLANS.map((plan) => (
              <div key={plan.name} className={`plan-card ${plan.highlight ? 'plan-popular' : ''}`} style={{ position: 'relative' }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #c9a84c, #a07d2a)', color: '#0a0a0f', fontSize: 10, fontWeight: 700, padding: '4px 14px', borderRadius: 100, letterSpacing: '0.05em', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                    ⭐ {plan.badge}
                  </div>
                )}
                <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: plan.highlight ? 'var(--gold-light)' : 'var(--text-muted)', marginBottom: 20 }}>{plan.name}</h3>
                <div style={{ marginBottom: 8 }}>
                  <span className={plan.highlight ? 'text-gold' : ''} style={{ fontSize: '2.2rem', fontWeight: 700, color: plan.highlight ? '' : '#f5f3ff', fontFamily: 'inherit' }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.5 }}>{plan.desc}</p>
                <div className="divider" style={{ marginBottom: 24 }} />
                <ul style={{ listStyle: 'none', marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map(f => (
                    <li key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: f.ok ? 1 : 0.3 }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: f.ok ? (plan.highlight ? 'rgba(201,168,76,0.2)' : 'rgba(201,168,76,0.1)') : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: f.ok ? 'var(--gold)' : 'var(--text-dim)', flexShrink: 0 }}>
                        {f.ok ? '✓' : '✗'}
                      </span>
                      <span style={{ fontSize: 13, color: plan.highlight ? (f.ok ? '#e8e6f0' : 'var(--text-muted)') : (f.ok ? '#ccc' : 'var(--text-dim)') }}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={plan.highlight ? 'btn-gold' : 'btn-outline'} style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: 12, fontSize: 13, fontWeight: 600, textDecoration: 'none', position: 'relative', zIndex: 1 }}>
                  <span style={{ position: 'relative', zIndex: 1 }}>{plan.cta}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section style={{ padding: '100px 24px', borderTop: '0.5px solid var(--border-soft)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Testimoni</div>
            <h2 className="serif" style={{ fontSize: '2.6rem', fontWeight: 400, color: '#f5f3ff', marginBottom: 16, letterSpacing: '-0.02em' }}>
              Dipercaya ribuan warung<br /><span className="serif-italic text-gold">di seluruh Indonesia</span>
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginBottom: 6 }}>
              {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: 'var(--gold)', fontSize: 18 }}>{s}</span>)}
              <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--text-muted)' }}>4.9 dari 5 · 10.000+ ulasan</span>
            </div>
          </div>
          <div className="reviews-grid">
            {REVIEWS.map(r => (
              <div key={r.name} className="review-card">
                <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                  {'★'.repeat(r.stars).split('').map((s, i) => <span key={i} style={{ color: 'var(--gold)', fontSize: 13 }}>{s}</span>)}
                </div>
                <p style={{ fontSize: 13, color: '#9e9cb0', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar">{r.avatar}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#f5f3ff' }}>{r.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden', borderTop: '0.5px solid var(--border-soft)' }}>
        <div className="orb pulse-orb" style={{ width: 700, height: 400, background: 'radial-gradient(circle, rgba(201,168,76,0.1), transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="divider" style={{ margin: '0 auto 32px' }} />
          <h2 className="serif" style={{ fontSize: '3rem', fontWeight: 400, color: '#f5f3ff', marginBottom: 20, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Siap kelola warungmu<br />lebih <span className="serif-italic text-gold">profesional?</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 40, fontSize: 15, lineHeight: 1.7 }}>
            Daftar sekarang, gratis untuk selamanya.<br />Tidak perlu kartu kredit.
          </p>
          <Link href="/auth/register" className="btn-gold" style={{ padding: '16px 44px', borderRadius: 100, fontSize: 15, textDecoration: 'none', display: 'inline-block', position: 'relative', zIndex: 1 }}>
            <span style={{ position: 'relative', zIndex: 1 }}>Mulai Gratis Sekarang →</span>
          </Link>
          <div className="divider" style={{ margin: '40px auto 0' }} />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '0.5px solid var(--border-soft)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Image src="/assets/logo.png" alt="WarungKu" width={28} height={28} style={{ borderRadius: 6, opacity: 0.8 }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#f5f3ff' }}>WarungKu</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center' }}>Aplikasi manajemen warung untuk Indonesia 🇮🇩</p>
            <div style={{ display: 'flex', gap: 24 }}>
              <Link href="/auth/login" className="footer-link">Masuk</Link>
              <Link href="/auth/register" className="footer-link">Daftar</Link>
            </div>
          </div>
          <div style={{ borderTop: '0.5px solid var(--border-soft)', paddingTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>© 2026 WarungKu. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
