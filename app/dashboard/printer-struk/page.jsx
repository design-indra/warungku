'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Printer, Bluetooth, Wifi, Usb, Settings2 } from 'lucide-react'

export default function PrinterStrukPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Printer & Struk</h1>
      </div>

      <div className="flex-1 overflow-y-auto page-content space-y-4">
        {/* Coming soon card */}
        <div className="card p-8 text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Printer className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">Printer & Struk</h3>
          <p className="text-sm text-gray-400 mb-1">Fitur konfigurasi printer thermal</p>
          <p className="text-xs text-gray-300 mb-6">akan tersedia segera.</p>
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 text-xs font-semibold px-4 py-2 rounded-full">
            <Settings2 className="w-3.5 h-3.5" />
            Dalam Pengembangan
          </div>
        </div>

        {/* Koneksi yang akan didukung */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Jenis Koneksi yang Akan Didukung</h3>
          <div className="space-y-3">
            {[
              { icon: Bluetooth, label: 'Bluetooth', desc: 'Printer thermal bluetooth (58mm / 80mm)', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: Wifi, label: 'WiFi / LAN', desc: 'Printer jaringan (IP Address)', color: 'text-green-500', bg: 'bg-green-50' },
              { icon: Usb, label: 'USB', desc: 'Printer USB terhubung langsung', color: 'text-orange-500', bg: 'bg-orange-50' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 opacity-50">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info struk */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 text-sm mb-3">Pengaturan Struk</h3>
          <div className="space-y-2 opacity-50">
            {[
              'Nama & logo warung di struk',
              'Pesan footer struk (ucapan terima kasih, dll)',
              'Lebar kertas (58mm / 80mm)',
              'Format tanggal & waktu',
              'Tampilkan nomor meja / kasir',
            ].map(item => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                <p className="text-xs text-gray-500">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
