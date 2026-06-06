import Link from 'next/link'

const FEATURES = [
  { icon: '🛒', title: 'Kasir (POS)', desc: 'Proses transaksi cepat, hitung kembalian otomatis, cetak atau share struk lewat WhatsApp.' },
  { icon: '📦', title: 'Manajemen Stok', desc: 'CRUD barang lengkap, alert stok menipis, import CSV/XLS dengan mudah.' },
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
    desc: 'Paling pas untuk UMKM yang ingin tumbuh.', badge: '⭐ Rekomendasi',
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
  { name: 'Sari Dewi', role: 'Pemilik Warung Sembako, Surabaya', avatar: 'SD', color: 'bg-blue-600', stars: 5,
    text: 'WarungKu beneran ngebantu banget! Dulu nyatat hutang pelanggan di buku, sering kelewat. Sekarang semua tercatat rapi dan bisa dicek kapan aja dari HP.' },
  { name: 'Budi Santoso', role: 'Toko Kelontong, Malang', avatar: 'BS', color: 'bg-emerald-600', stars: 5,
    text: 'Laporan hariannya keren, langsung tahu untung berapa. Fitur kasirnya simpel, karyawan saya langsung bisa pakai tanpa diajari lama.' },
  { name: 'Rina Marlina', role: 'Warung Makan, Bandung', avatar: 'RM', color: 'bg-amber-500', stars: 5,
    text: 'Paket Basic harganya terjangkau banget untuk fitur selengkap ini. Manajemen stok bumbu jadi jauh lebih gampang, ga pernah kehabisan stok lagi.' },
  { name: 'Hendra Wijaya', role: 'Mini Market, Jakarta', avatar: 'HW', color: 'bg-rose-600', stars: 5,
    text: 'Sudah coba beberapa aplikasi kasir lain, WarungKu yang paling ringan dan mudah dipakai. Bisa install di HP juga jadi praktis banget buat usaha saya.' },
  { name: 'Fitri Handayani', role: 'Toko Sembako, Yogyakarta', avatar: 'FH', color: 'bg-purple-600', stars: 5,
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
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', 'Nunito', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .gradient-hero { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 40%, #0ea5e9 100%); }
        .gradient-text { background: linear-gradient(135deg, #fbbf24, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(37,99,235,0.12); }
        .shine-btn { position: relative; overflow: hidden; }
        .shine-btn::after { content: ''; position: absolute; top: -50%; left: -75%; width: 50%; height: 200%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.25), transparent); transform: skewX(-20deg); animation: shine 3s infinite; }
        @keyframes shine { 0% { left: -75%; } 100% { left: 125%; } }
        .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15; pointer-events: none; }
        .float { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .review-scroll { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; -ms-overflow-style: none; }
        .review-scroll::-webkit-scrollbar { display: none; }
        .review-card { flex: 0 0 280px; }
        @media (min-width: 640px) { .review-scroll { display: grid; grid-template-columns: repeat(2, 1fr); } .review-card { flex: none; } }
        @media (min-width: 1024px) { .review-scroll { grid-template-columns: repeat(3, 1fr); } }
        .plan-popular { background: linear-gradient(135deg, #1d4ed8, #2563eb); color: white; transform: scale(1.04); box-shadow: 0 24px 60px rgba(37,99,235,0.3); }
        @media (max-width: 639px) { .plan-popular { transform: none; } }
      `}</style>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-blue-200">W</div>
            <span className="text-lg font-extrabold text-gray-900 tracking-tight">WarungKu</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all">Masuk</Link>
            <Link href="/auth/register" className="shine-btn px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Daftar Gratis →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="gradient-hero relative overflow-hidden px-5 pt-16 pb-24 text-white text-center">
        <div className="blob w-96 h-96 bg-white" style={{top:'-5rem',left:'-5rem'}} />
        <div className="blob w-80 h-80 bg-yellow-300" style={{bottom:'-3rem',right:'-3rem'}} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold mb-7">
            🚀 Gratis untuk selamanya · Upgrade kapan saja
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 tracking-tight">
            Warungmu Makin Maju<br />dengan <span className="gradient-text">WarungKu</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Kasir POS, stok barang, hutang pelanggan, laporan lengkap — semua dalam satu aplikasi. Bisa install di HP kamu!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/auth/register" className="shine-btn px-8 py-4 bg-white text-blue-700 font-extrabold rounded-2xl text-base shadow-2xl hover:-translate-y-0.5 transition-all">
              Mulai Gratis Sekarang →
            </Link>
            <Link href="/auth/login" className="px-8 py-4 bg-white/10 backdrop-blur border border-white/25 font-semibold rounded-2xl text-base hover:bg-white/20 transition-all">
              Sudah punya akun? Masuk
            </Link>
          </div>
          <p className="text-blue-200 text-xs mb-12">Tidak perlu kartu kredit · Gratis selamanya untuk paket dasar</p>
          {/* Mock dashboard card */}
          <div className="float max-w-sm mx-auto bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-5 text-left shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-blue-200 font-medium">Total Omzet Hari Ini</p>
                <p className="text-3xl font-extrabold text-white">Rp 1.250.000</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📈</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[['42','Transaksi'],['18','Produk'],['3','Hutang']].map(([v,l]) => (
                <div key={l} className="bg-white/10 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-extrabold text-white">{v}</p>
                  <p className="text-[10px] text-blue-200">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gray-50 border-y border-gray-100 px-5 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-blue-600 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-5 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-blue-100">✨ Fitur Lengkap</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Semua yang kamu butuhkan</h2>
            <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">Dirancang khusus untuk warung sembako, toko kelontong, dan UMKM Indonesia</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card-hover bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: ['#eff6ff','#f0fdf4','#fefce8','#fff1f2','#f5f3ff','#ecfeff'][i] }}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-gray-50 px-5 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-blue-100">💰 Harga Transparan</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Mulai gratis, upgrade kapan saja</h2>
            <p className="text-gray-500">Harga terjangkau, fitur lengkap untuk semua skala usaha</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
            {PLANS.map(plan => (
              <div key={plan.name} className={`relative rounded-3xl p-7 border ${plan.highlight ? 'plan-popular border-blue-600' : 'bg-white border-gray-200 shadow-sm'}`}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-extrabold px-4 py-1 rounded-full shadow-lg whitespace-nowrap">{plan.badge}</div>
                )}
                <h3 className={`font-extrabold text-xl mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <p className={`text-xs mb-5 ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>{plan.desc}</p>
                <div className="mb-6">
                  <span className={`text-4xl font-extrabold tracking-tight ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                  <span className={`text-sm ml-1 ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map(f => (
                    <li key={f.text} className={`flex items-center gap-2.5 text-sm ${!f.ok ? 'opacity-35' : ''}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                        f.ok
                          ? plan.highlight ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                          : plan.highlight ? 'bg-white/10 text-white/40' : 'bg-gray-100 text-gray-400'
                      }`}>{f.ok ? '✓' : '✗'}</span>
                      <span className={plan.highlight ? 'text-blue-100' : f.ok ? 'text-gray-700' : 'text-gray-300'}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`block text-center py-3.5 rounded-2xl font-bold text-sm transition-all ${
                  plan.highlight ? 'bg-white text-blue-700 hover:bg-blue-50 shadow-lg' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100'
                }`}>{plan.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="px-5 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block bg-amber-50 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-amber-100">⭐ Testimoni Pengguna</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Dipercaya ribuan warung<br />di seluruh Indonesia
            </h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_,i) => (
                <svg key={i} className="w-6 h-6 text-amber-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
              <span className="ml-2 text-gray-600 text-sm font-semibold">4.9 dari 5 · 10.000+ ulasan</span>
            </div>
          </div>
          <div className="review-scroll">
            {REVIEWS.map(r => (
              <div key={r.name} className="review-card card-hover bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(r.stars)].map((_,i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${r.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{r.avatar}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="gradient-hero px-5 py-16 text-center text-white relative overflow-hidden">
        <div className="blob w-80 h-80 bg-white" style={{top:'-3rem',right:'-3rem'}} />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
            Siap kelola warungmu<br />lebih profesional?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">Daftar sekarang, gratis untuk selamanya. Tidak perlu kartu kredit.</p>
          <Link href="/auth/register" className="shine-btn inline-block px-10 py-4 bg-white text-blue-700 font-extrabold rounded-2xl text-base shadow-2xl hover:-translate-y-1 transition-all">
            Mulai Gratis Sekarang →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-gray-400 px-5 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm">W</div>
            <span className="font-bold text-white">WarungKu</span>
          </div>
          <p className="text-sm text-center">Aplikasi manajemen warung untuk Indonesia 🇮🇩</p>
          <div className="flex gap-4 text-sm">
            <Link href="/auth/login" className="hover:text-white transition-colors">Masuk</Link>
            <Link href="/auth/register" className="hover:text-white transition-colors">Daftar</Link>
          </div>
        </div>
        <p className="text-xs text-center mt-6 text-gray-600">© 2026 WarungKu. Semua hak dilindungi.</p>
      </footer>

    </div>
  )
}
