import Link from 'next/link'
import Image from 'next/image'

const FEATURES = [
  { icon: '🛒', title: 'Kasir POS', desc: 'Proses transaksi cepat, hitung kembalian otomatis, share struk lewat WhatsApp.' },
  { icon: '📦', title: 'Manajemen Stok', desc: 'CRUD barang lengkap, alert stok menipis, import CSV/XLS.' },
  { icon: '📊', title: 'Laporan Lengkap', desc: 'Omzet harian, mingguan, bulanan. Laba kotor & barang terlaris.' },
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
    name: 'Basic', price: 'Rp 15.000', period: '/bulan',
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
    name: 'Pro', price: 'Rp 30.000', period: '/bulan',
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
    text: 'WarungKu beneran ngebantu banget! Dulu nyatat hutang pelanggan di buku, sering kelewat. Sekarang semua tercatat rapi dari HP.' },
  { name: 'Budi Santoso', role: 'Toko Kelontong, Malang', avatar: 'BS', stars: 5,
    text: 'Laporan hariannya keren, langsung tahu untung berapa. Fitur kasirnya simpel, karyawan langsung bisa pakai tanpa diajari lama.' },
  { name: 'Rina Marlina', role: 'Warung Makan, Bandung', avatar: 'RM', stars: 5,
    text: 'Paket Basic harganya terjangkau banget untuk fitur selengkap ini. Manajemen stok bumbu jadi jauh lebih gampang.' },
  { name: 'Hendra Wijaya', role: 'Mini Market, Jakarta', avatar: 'HW', stars: 5,
    text: 'Sudah coba beberapa aplikasi kasir lain, WarungKu yang paling ringan dan mudah dipakai. Bisa install di HP juga praktis!' },
  { name: 'Fitri Handayani', role: 'Toko Sembako, Yogyakarta', avatar: 'FH', stars: 5,
    text: 'Awalnya ragu karena gratis, tapi ternyata fiturnya lengkap! Upgrade ke Basic setelah sebulan pakai, tidak menyesal!' },
]

const STATS = [
  { value: '10.000+', label: 'Warung Terdaftar' },
  { value: '99.9%', label: 'Uptime Server' },
  { value: '4.9/5', label: 'Rating Pengguna' },
  { value: 'Gratis', label: 'Mulai Pakai' },
]

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#EFF6FF', color: '#1e3a5f', minHeight: '100vh', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        :root {
          --blue-900: #1e3a8a;
          --blue-800: #1e40af;
          --blue-700: #1d4ed8;
          --blue-600: #2563eb;
          --blue-500: #3b82f6;
          --blue-100: #dbeafe;
          --blue-50:  #eff6ff;
          --white:    #ffffff;
          --gray-50:  #f8fafc;
          --gray-100: #f1f5f9;
          --gray-400: #94a3b8;
          --gray-600: #475569;
          --gray-800: #1e293b;
        }

        /* NAVBAR */
        .navbar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,0.9);
          border-bottom: 1px solid #dbeafe;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .nav-inner {
          max-width: 1100px; margin: 0 auto;
          padding: 0 20px;
          display: flex; align-items: center; justify-content: space-between;
          height: 60px;
        }

        /* BUTTONS */
        .btn-primary {
          background: var(--blue-700);
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          padding: 12px 28px;
          border-radius: 100px;
          text-decoration: none;
          display: inline-block;
          transition: all 0.2s;
          border: none; cursor: pointer;
          white-space: nowrap;
        }
        .btn-primary:hover { background: var(--blue-800); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(29,78,216,0.3); }

        .btn-secondary {
          background: transparent;
          color: var(--blue-700);
          font-weight: 600;
          font-size: 14px;
          padding: 12px 24px;
          border-radius: 100px;
          text-decoration: none;
          display: inline-block;
          border: 1.5px solid var(--blue-700);
          transition: all 0.2s;
          white-space: nowrap;
        }
        .btn-secondary:hover { background: var(--blue-50); }

        .btn-ghost {
          color: var(--gray-600);
          font-size: 14px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 100px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-ghost:hover { color: var(--blue-700); background: var(--blue-50); }

        /* SECTION */
        .section { padding: 80px 20px; }
        .section-sm { padding: 48px 20px; }
        .container { max-width: 1100px; margin: 0 auto; }
        .container-sm { max-width: 760px; margin: 0 auto; }

        /* EYEBROW */
        .eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--blue-600);
          background: var(--blue-100);
          padding: 5px 14px; border-radius: 100px;
          margin-bottom: 16px;
        }

        /* SECTION TITLE */
        .section-title {
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 800;
          color: var(--gray-800);
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 16px;
        }
        .section-title span { color: var(--blue-700); }
        .section-sub {
          color: var(--gray-600);
          font-size: 15px;
          line-height: 1.7;
          max-width: 520px;
        }

        /* CARDS */
        .card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 28px;
          transition: all 0.2s;
        }
        .card:hover { border-color: var(--blue-500); box-shadow: 0 8px 32px rgba(37,99,235,0.1); transform: translateY(-2px); }

        /* FEATURE GRID */
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        /* PRICING GRID */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          align-items: start;
        }
        .plan-card {
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 24px;
          padding: 28px 24px;
          transition: all 0.2s;
        }
        .plan-card:hover { border-color: var(--blue-500); box-shadow: 0 8px 32px rgba(37,99,235,0.1); }
        .plan-popular {
          background: var(--blue-700);
          border-color: var(--blue-700);
          color: #fff;
          position: relative;
        }
        .plan-popular:hover { box-shadow: 0 12px 40px rgba(29,78,216,0.35); }

        /* REVIEW GRID */
        .review-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .review-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
        }

        /* AVATAR */
        .avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--blue-100);
          border: 2px solid var(--blue-200, #bfdbfe);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800;
          color: var(--blue-700);
          flex-shrink: 0;
        }

        /* STATS */
        .stats-row {
          display: flex; justify-content: center;
          flex-wrap: wrap; gap: 0;
        }
        .stat-item { flex: 1; min-width: 140px; text-align: center; padding: 20px 24px; }
        .stat-sep { width: 1px; background: #dbeafe; align-self: stretch; }

        /* HERO MOCK */
        .hero-mock {
          background: #fff;
          border: 1.5px solid #dbeafe;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 24px 64px rgba(29,78,216,0.12);
        }

        /* HERO */
        .hero-section {
          background: linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%);
          position: relative;
          overflow: hidden;
          padding: 80px 20px 100px;
        }
        .hero-section::before {
          content: '';
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .float-anim { animation: floatY 6s ease-in-out infinite; }

        /* MOBILE */
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-mock-wrap { display: none; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .nav-links { display: none; }
          .section { padding: 60px 20px; }
          .hero-section { padding: 60px 20px 80px; }
          .stat-sep { display: none; }
        }

        @media (max-width: 480px) {
          .section { padding: 48px 16px; }
          .hero-section { padding: 48px 16px 64px; }
          .btn-primary, .btn-secondary { font-size: 13px; padding: 11px 22px; }
          .card { padding: 20px; }
          .plan-card { padding: 24px 20px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/assets/logo.png" alt="WarungKu" width={32} height={32} style={{ borderRadius: 8 }} />
            <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--blue-800)', letterSpacing: '-0.02em' }}>WarungKu</span>
          </div>
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <a href="#fitur" className="btn-ghost">Fitur</a>
            <a href="#harga" className="btn-ghost">Harga</a>
            <a href="#ulasan" className="btn-ghost">Ulasan</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/auth/login" className="btn-ghost">Masuk</Link>
            <Link href="/auth/register" className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>Daftar Gratis →</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section">
        {/* Dekorasi bulatan */}
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', top: -150, right: -100, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', bottom: -80, left: -60, pointerEvents: 'none' }} />

        <div className="container">
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', position: 'relative', zIndex: 1 }}>

            {/* Left */}
            <div>
              <div className="eyebrow" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                🏪 Manajemen Warung Modern
              </div>
              <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
                Warungmu Makin<br />
                <span style={{ color: '#93c5fd' }}>Maju & Cerdas</span>
              </h1>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, marginBottom: 36, maxWidth: 440 }}>
                Kasir POS, stok barang, hutang pelanggan, laporan lengkap — semua dalam satu aplikasi. Bisa install di HP kamu!
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                <Link href="/auth/register" style={{ background: '#fff', color: 'var(--blue-700)', fontWeight: 800, fontSize: 14, padding: '13px 28px', borderRadius: 100, textDecoration: 'none', transition: 'all 0.2s', display: 'inline-block', whiteSpace: 'nowrap' }}>
                  Mulai Gratis →
                </Link>
                <Link href="/auth/login" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, fontSize: 14, padding: '13px 24px', borderRadius: 100, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.25)', display: 'inline-block', whiteSpace: 'nowrap' }}>
                  Sudah punya akun
                </Link>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                {['✓ Gratis selamanya', '✓ Tanpa kartu kredit', '✓ Setup 2 menit'].map(t => (
                  <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Right: Mock dashboard */}
            <div className="hero-mock-wrap float-anim" style={{ position: 'relative' }}>

              {/* Floating badge Stok Rendah */}
              <div style={{ position: 'absolute', top: -18, right: -18, zIndex: 2, background: '#fff', border: '1.5px solid #dbeafe', borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(29,78,216,0.12)' }}>
                <span style={{ fontSize: 16 }}>⚡</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-800)' }}>Stok Rendah</p>
                  <p style={{ fontSize: 10, color: 'var(--blue-600)' }}>5 produk perlu restock</p>
                </div>
              </div>

              {/* Floating badge Scan Barcode */}
              <div style={{ position: 'absolute', bottom: -16, left: -16, zIndex: 2, background: '#fff', border: '1.5px solid #dbeafe', borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(29,78,216,0.12)' }}>
                <span style={{ fontSize: 16 }}>📷</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-800)' }}>Scan Barcode</p>
                  <p style={{ fontSize: 10, color: 'var(--blue-600)' }}>Auto-isi nama produk</p>
                </div>
              </div>

              <div className="hero-mock">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Total Omzet Hari Ini</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--blue-700)', letterSpacing: '-0.02em' }}>Rp 1.250.000</p>
                  </div>
                  <div style={{ padding: 12, borderRadius: 14, background: 'var(--blue-50)', fontSize: 22 }}>📈</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
                  {[['42', 'Transaksi', '↑ 12%'], ['18', 'Terjual', '↑ 8%'], ['3', 'Hutang', '→']].map(([v, l, ch]) => (
                    <div key={l} style={{ background: 'var(--blue-50)', border: '1px solid #dbeafe', borderRadius: 12, padding: '12px' }}>
                      <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue-800)', lineHeight: 1 }}>{v}</p>
                      <p style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 3 }}>{l}</p>
                      <p style={{ fontSize: 10, color: 'var(--blue-600)', marginTop: 2, fontWeight: 700 }}>{ch}</p>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Transaksi Terbaru</p>
                  {[['Indomie Goreng', '2x', 'Rp 7.000'], ['Aqua 600ml', '1x', 'Rp 4.000'], ['Rokok Surya 12', '1x', 'Rp 24.000']].map(([name, qty, price]) => (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue-500)', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--gray-800)', fontWeight: 500 }}>{name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{qty}</span>
                        <span style={{ fontSize: 12, color: 'var(--blue-700)', fontWeight: 700 }}>{price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: '#fff', borderTop: '1px solid #dbeafe', borderBottom: '1px solid #dbeafe' }}>
        <div className="container">
          <div className="stats-row">
            {STATS.map((s, i) => (
              <>
                <div key={s.label} className="stat-item">
                  <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--blue-700)', marginBottom: 4, letterSpacing: '-0.02em' }}>{s.value}</p>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                </div>
                {i < STATS.length - 1 && <div className="stat-sep" key={`sep-${i}`} />}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section" id="fitur" style={{ background: 'var(--blue-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="eyebrow" style={{ display: 'inline-flex' }}>Fitur Lengkap</div>
            <h2 className="section-title">Semua yang kamu <span>butuhkan</span></h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>
              Dirancang khusus untuk warung sembako, toko kelontong, dan UMKM Indonesia
            </p>
          </div>
          <div className="feature-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="card">
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APP PREVIEW ── */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container-sm" style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ display: 'inline-flex' }}>Tampilan Aplikasi</div>
          <h2 className="section-title">Desain yang <span>intuitif</span> & cepat</h2>
          <div style={{ borderRadius: 24, overflow: 'hidden', border: '1.5px solid #dbeafe', boxShadow: '0 16px 48px rgba(29,78,216,0.1)', marginTop: 32 }}>
            <Image
              src="/assets/login.png"
              alt="WarungKu App Preview"
              width={900} height={500}
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="section" id="harga" style={{ background: 'var(--blue-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="eyebrow" style={{ display: 'inline-flex' }}>Harga Transparan</div>
            <h2 className="section-title">Mulai gratis, <span>upgrade kapan saja</span></h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>Harga terjangkau, fitur lengkap untuk semua skala usaha</p>
          </div>
          <div className="pricing-grid">
            {PLANS.map(plan => (
              <div key={plan.name} className={`plan-card ${plan.highlight ? 'plan-popular' : ''}`} style={{ position: 'relative' }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: '#fff', color: 'var(--blue-700)', fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: 100, letterSpacing: '0.05em', whiteSpace: 'nowrap', textTransform: 'uppercase', border: '1.5px solid var(--blue-700)' }}>
                    ⭐ {plan.badge}
                  </div>
                )}
                <h3 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: plan.highlight ? 'rgba(255,255,255,0.7)' : 'var(--gray-400)', marginBottom: 16 }}>{plan.name}</h3>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: plan.highlight ? '#fff' : 'var(--blue-700)', letterSpacing: '-0.02em' }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.6)' : 'var(--gray-400)', marginLeft: 4 }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.7)' : 'var(--gray-600)', marginBottom: 24, lineHeight: 1.5 }}>{plan.desc}</p>
                <div style={{ height: 1, background: plan.highlight ? 'rgba(255,255,255,0.15)' : '#e2e8f0', marginBottom: 20 }} />
                <ul style={{ listStyle: 'none', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map(f => (
                    <li key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: f.ok ? 1 : 0.35 }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: f.ok ? (plan.highlight ? 'rgba(255,255,255,0.2)' : 'var(--blue-100)') : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: f.ok ? (plan.highlight ? '#fff' : 'var(--blue-700)') : 'var(--gray-400)', flexShrink: 0, fontWeight: 800 }}>
                        {f.ok ? '✓' : '✗'}
                      </span>
                      <span style={{ fontSize: 13, color: plan.highlight ? (f.ok ? '#fff' : 'rgba(255,255,255,0.5)') : (f.ok ? 'var(--gray-800)' : 'var(--gray-400)') }}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{
                  display: 'block', textAlign: 'center', padding: '13px',
                  borderRadius: 14, fontSize: 13, fontWeight: 700, textDecoration: 'none',
                  background: plan.highlight ? '#fff' : 'var(--blue-700)',
                  color: plan.highlight ? 'var(--blue-700)' : '#fff',
                  transition: 'all 0.2s',
                }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="section" id="ulasan" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="eyebrow" style={{ display: 'inline-flex' }}>Testimoni</div>
            <h2 className="section-title">Dipercaya ribuan warung <span>di seluruh Indonesia</span></h2>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
              {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#f59e0b', fontSize: 18 }}>{s}</span>)}
              <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--gray-400)' }}>4.9 dari 5 · 10.000+ ulasan</span>
            </div>
          </div>
          <div className="review-grid">
            {REVIEWS.map(r => (
              <div key={r.name} className="review-card">
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {'★'.repeat(r.stars).split('').map((s, i) => <span key={i} style={{ color: '#f59e0b', fontSize: 13 }}>{s}</span>)}
                </div>
                <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: 18, fontStyle: 'italic' }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar">{r.avatar}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>{r.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section" style={{ background: 'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', top: -100, right: -80, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', bottom: -80, left: -60, pointerEvents: 'none' }} />
        <div className="container-sm" style={{ position: 'relative', zIndex: 1 }}>
          <div className="eyebrow" style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.15)', color: '#fff' }}>Mulai Sekarang</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20 }}>
            Siap kelola warungmu lebih <span style={{ color: '#93c5fd' }}>profesional?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 40, fontSize: 15, lineHeight: 1.7 }}>
            Daftar sekarang, gratis untuk selamanya.<br />Tidak perlu kartu kredit.
          </p>
          <Link href="/auth/register" style={{ background: '#fff', color: 'var(--blue-700)', fontWeight: 800, fontSize: 15, padding: '16px 44px', borderRadius: 100, textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s' }}>
            Mulai Gratis Sekarang →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f172a', padding: '40px 20px' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20, marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Image src="/assets/logo.png" alt="WarungKu" width={28} height={28} style={{ borderRadius: 6, opacity: 0.9 }} />
              <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>WarungKu</span>
            </div>
            <p style={{ fontSize: 12, color: '#475569', textAlign: 'center' }}>Aplikasi manajemen warung untuk Indonesia 🇮🇩</p>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link href="/auth/login" style={{ color: '#475569', fontSize: 13, textDecoration: 'none' }}>Masuk</Link>
              <Link href="/auth/register" style={{ color: '#475569', fontSize: 13, textDecoration: 'none' }}>Daftar</Link>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#334155' }}>© 2026 WarungKu. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
