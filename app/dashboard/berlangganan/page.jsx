'use client'

import React from 'react'
import { Check, Crown, Zap, ShieldCheck } from 'lucide-react'

const plans = [
  {
    name: 'Gratis',
    price: 'Rp 0',
    desc: 'Cocok untuk warung rintisan yang baru memulai.',
    features: ['Kelola hingga 50 produk', 'Laporan harian standar', '1 Akun kasir', 'Catatan utang dasar'],
    isPopular: false,
    buttonText: 'Paket Aktif Saat Ini',
    buttonClass: 'bg-gray-100 text-gray-500 cursor-not-allowed',
  },
  {
    name: 'Warung Pro',
    price: 'Rp 49.000',
    period: '/bulan',
    desc: 'Pilihan terbaik untuk meningkatkan omset dan efisiensi.',
    features: ['Produk tidak terbatas', 'Laporan laba rugi lengkap', 'Multi-kasir (hingga 5 staf)', 'Fitur PWA & Cetak Struk Bluetooth', 'Manajemen stok otomatis'],
    isPopular: true,
    buttonText: 'Upgrade ke Pro',
    buttonClass: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200',
  }
]

export default function BerlanggananPage() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-200 text-amber-700 text-xs font-semibold">
          <Crown className="w-3.5 h-3.5" /> Premium Plan
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">Kembangkan Bisnis Warungmu</h1>
        <p className="text-xs md:text-sm text-gray-500">Pilih paket yang paling sesuai dengan kebutuhan operasional harian Anda.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`bg-white rounded-2xl border p-5 md:p-6 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-lg ${
              plan.isPopular ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
            }`}
          >
            {plan.isPopular && (
              <span className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> Rekomendasi
              </span>
            )}

            <div>
              <h3 className="text-base font-bold text-gray-800">{plan.name}</h3>
              <p className="text-xs text-gray-400 mt-1 min-h-[32px]">{plan.desc}</p>
              
              <div className="mt-4 mb-5 flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900">{plan.price}</span>
                {plan.period && <span className="text-xs text-gray-400">{plan.period}</span>}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Fitur Utama:</p>
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs text-gray-600">
                      <div className="w-4 h-4 bg-emerald-50 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-2">
              <button className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-colors ${plan.buttonClass}`}>
                {plan.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-blue-900">Jaminan Keamanan Transaksi</h4>
          <p className="text-[11px] text-blue-700/80 mt-0.5">Pembayaran diproses secara aman. Anda dapat membatalkan atau mengubah paket langganan kapan saja dari pengaturan akun.</p>
        </div>
      </div>
    </div>
  )
}
