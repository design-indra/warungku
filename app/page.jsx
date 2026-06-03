import Link from 'next/link'

const FEATURES = [
  { icon:'🛒', title:'Kasir (POS)', desc:'Proses transaksi cepat, hitung kembalian otomatis, cetak atau share struk.' },
  { icon:'📦', title:'Manajemen Stok', desc:'CRUD barang lengkap, alert stok menipis, import/export CSV.' },
  { icon:'📊', title:'Laporan Lengkap', desc:'Omzet harian, mingguan, bulanan. Laba kotor & barang terlaris.' },
  { icon:'👥', title:'Hutang Pelanggan', desc:'Catat hutang, bayar sebagian, riwayat per pelanggan.' },
  { icon:'🏪', title:'Multi Cabang', desc:'Kelola lebih dari satu cabang warung dari satu akun.' },
  { icon:'📱', title:'Install di HP', desc:'Bisa diinstall seperti aplikasi di Android dan iOS (PWA).' },
]

const PLANS = [
  {
    name: 'Gratis', price: 'Rp 0', period: 'selamanya', color: 'border-gray-200',
    features: ['50 barang', '1 kasir', '1 cabang', 'Kasir POS', 'Stok Barang', 'Laporan Harian'],
    missing: ['Laporan Bulanan', 'Hutang Pelanggan', 'Export CSV', 'Multi Cabang'],
    cta: 'Mulai Gratis', ctaClass: 'bg-gray-900 text-white',
  },
  {
    name: 'Basic', price: 'Rp 49.000', period: '/bulan', color: 'border-blue-500 ring-2 ring-blue-500', badge: 'Populer',
    features: ['500 barang', '3 kasir', '1 cabang', 'Kasir POS', 'Stok Barang', 'Laporan Harian', 'Laporan Bulanan', 'Hutang Pelanggan', 'Export CSV', 'Barcode Scanner'],
    missing: ['Multi Cabang', 'Priority Support'],
    cta: 'Mulai Basic', ctaClass: 'bg-blue-600 text-white',
  },
  {
    name: 'Pro', price: 'Rp 99.000', period: '/bulan', color: 'border-purple-500',
    features: ['Unlimited barang', 'Unlimited kasir', '5 cabang', 'Semua fitur Basic', 'Multi Cabang', 'Priority Support'],
    missing: [],
    cta: 'Mulai Pro', ctaClass: 'bg-purple-600 text-white',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏪</span>
          <span className="text-xl font-extrabold text-gray-900">WarungKu</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
            Masuk
          </Link>
          <Link href="/auth/register" className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Daftar Gratis
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-4 py-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-blue-100">
          🚀 Gratis untuk selamanya, upgrade kapan saja
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Kelola Warungmu<br />Lebih <span className="text-blue-600">Mudah & Cerdas</span>
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
          Dari kasir POS, stok barang, hutang pelanggan, sampai laporan lengkap — semuanya ada di WarungKu. Bisa install di HP!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/register"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-base transition-colors shadow-lg shadow-blue-200">
            Mulai Gratis Sekarang →
          </Link>
          <Link href="/auth/login"
            className="px-8 py-4 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl text-base transition-colors">
            Sudah punya akun? Masuk
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">Tidak perlu kartu kredit · Gratis selamanya untuk paket dasar</p>
      </section>

      {/* ── Features ── */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">Semua yang kamu butuhkan</h2>
          <p className="text-center text-gray-500 mb-10">Dirancang khusus untuk warung sembako, kelontong, dan toko kecil Indonesia</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">Harga yang Transparan</h2>
        <p className="text-center text-gray-500 mb-10">Mulai gratis, upgrade sesuai kebutuhan</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PLANS.map(plan => (
            <div key={plan.name} className={`relative bg-white rounded-2xl p-6 border-2 ${plan.color} shadow-sm`}>
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <h3 className="font-extrabold text-lg text-gray-900 mb-1">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-gray-400 text-sm"> {plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500 font-bold">✓</span> {f}
                  </li>
                ))}
                {plan.missing?.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span>✗</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register"
                className={`block text-center py-3 rounded-xl font-bold text-sm transition-colors ${plan.ctaClass}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 px-4 py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">🏪</span>
          <span className="font-bold text-white text-lg">WarungKu</span>
        </div>
        <p className="text-sm">Aplikasi manajemen warung untuk Indonesia</p>
        <p className="text-xs mt-4">© 2024 WarungKu. Semua hak dilindungi.</p>
      </footer>
    </div>
  )
}
