// lib/bluetooth-print.js
// ESC/POS Bluetooth Thermal Printer
// Mendukung: PWA (Web Bluetooth API) + APK Android (Capacitor BT Serial Plugin)
// Compatible: Xprinter, EPSON TM, GOOJPRT, Rongta, iDPRT, dll

// ─── ESC/POS CONSTANTS ───────────────────────────────────────────────────────
const ESC = 0x1B
const GS  = 0x1D
const LF  = 0x0A

const CMD = {
  INIT:         [ESC, 0x40],
  ALIGN_LEFT:   [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT:  [ESC, 0x61, 0x02],
  BOLD_ON:      [ESC, 0x45, 0x01],
  BOLD_OFF:     [ESC, 0x45, 0x00],
  DOUBLE_ON:    [GS,  0x21, 0x11],
  DOUBLE_OFF:   [GS,  0x21, 0x00],
  FONT_NORMAL:  [ESC, 0x4D, 0x00],
  FONT_SMALL:   [ESC, 0x4D, 0x01],
  CUT_PAPER:    [GS,  0x56, 0x42, 0x00],
  FEED_3:       [ESC, 0x64, 0x03],
  FEED_1:       [ESC, 0x64, 0x01],
}

// ─── TEXT ENCODER ─────────────────────────────────────────────────────────────
function encodeText(text) {
  const map = {
    'á':'a','à':'a','â':'a','ä':'a',
    'é':'e','è':'e','ê':'e','ë':'e',
    'í':'i','ì':'i','î':'i','ï':'i',
    'ó':'o','ò':'o','ô':'o','ö':'o',
    'ú':'u','ù':'u','û':'u','ü':'u',
    'ñ':'n','ç':'c',
  }
  let out = text
  for (const [k, v] of Object.entries(map)) out = out.replaceAll(k, v)
  return new TextEncoder().encode(out)
}

// ─── BUILDER ──────────────────────────────────────────────────────────────────
class EscPosBuilder {
  constructor(paperWidth = 32) {
    this.width  = paperWidth
    this.chunks = []
  }
  _raw(bytes)  { this.chunks.push(new Uint8Array(bytes)); return this }
  _text(str)   { this.chunks.push(encodeText(str)); return this }
  init()        { return this._raw(CMD.INIT) }
  newline()     { return this._raw([LF]) }
  feed(n = 1)   { return this._raw([ESC, 0x64, n]) }
  cut()         { return this._raw(CMD.FEED_3)._raw(CMD.CUT_PAPER) }
  alignLeft()   { return this._raw(CMD.ALIGN_LEFT) }
  alignCenter() { return this._raw(CMD.ALIGN_CENTER) }
  alignRight()  { return this._raw(CMD.ALIGN_RIGHT) }
  bold(on)      { return this._raw(on ? CMD.BOLD_ON : CMD.BOLD_OFF) }
  double(on)    { return this._raw(on ? CMD.DOUBLE_ON : CMD.DOUBLE_OFF) }
  small(on)     { return this._raw(on ? CMD.FONT_SMALL : CMD.FONT_NORMAL) }
  text(str)     { return this._text(str)._raw([LF]) }
  row(left, right) {
    const gap  = this.width - left.length - right.length
    const line = left + ' '.repeat(Math.max(1, gap)) + right
    return this._text(line)._raw([LF])
  }
  line(char = '-') { return this._text(char.repeat(this.width))._raw([LF]) }
  dashed()         { return this.line('-') }
  build() {
    const total = this.chunks.reduce((s, c) => s + c.length, 0)
    const out   = new Uint8Array(total)
    let offset  = 0
    for (const chunk of this.chunks) { out.set(chunk, offset); offset += chunk.length }
    return out
  }
}

// ─── FORMAT HELPERS ───────────────────────────────────────────────────────────
const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')
const fmt = (d) => new Date(d).toLocaleString('id-ID', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
})
const METODE_LABEL = {
  tunai: 'Tunai', qris: 'QRIS',
  debit: 'Kartu Debit/Kredit', ewallet: 'E-Wallet', hutang: 'Hutang'
}

// ─── BUILD STRUK BYTES ────────────────────────────────────────────────────────
export function buildStrukBytes(tx, store, paperWidth = 32) {
  const b = new EscPosBuilder(paperWidth)
  b.init()
  b.alignCenter()
  b.bold(true).double(true)
  b.text(store.nama_warung || 'WARUNGKU')
  b.double(false).bold(false)
  if (store.alamat) b.text(store.alamat)
  if (store.no_hp)  b.text(store.no_hp)
  b.dashed()
  b.alignLeft()
  b.small(true)
  b.row('No. Trx', tx.nomor_transaksi || '-')
  b.row('Tanggal', fmt(tx.created_at || new Date()))
  b.row('Kasir',   'Admin')
  b.small(false)
  b.dashed()
  for (const item of tx.items) {
    b.text(item.nama)
    const qtyStr = `  ${item.qty} x ${Number(item.harga).toLocaleString('id-ID')}`
    const subStr = Number(item.harga * item.qty).toLocaleString('id-ID')
    b.row(qtyStr, subStr)
  }
  b.dashed()
  b.small(true)
  b.row('Total Item', String(tx.items.reduce((s, i) => s + i.qty, 0)))
  b.row('Subtotal',   rp(tx.subtotal || tx.total))
  if (tx.diskon > 0) b.row('Diskon', '-' + rp(tx.diskon))
  b.small(false)
  b.bold(true)
  b.row('TOTAL BAYAR', rp(tx.total))
  b.bold(false)
  b.dashed()
  b.small(true)
  b.row('Metode',   METODE_LABEL[tx.metode_bayar] || 'Tunai')
  b.row('Dibayar',  rp(tx.bayar))
  if (tx.kembalian > 0) b.row('Kembalian', rp(tx.kembalian))
  b.small(false)
  b.dashed()
  b.alignCenter()
  b.small(true)
  b.text('Terima kasih sudah berbelanja!')
  b.text('Simpan struk sebagai bukti')
  b.small(false)
  b.cut()
  return b.build()
}

// ─── DETECT ENVIRONMENT ───────────────────────────────────────────────────────
function isCapacitorApp() {
  return typeof window !== 'undefined' && !!(window.Capacitor?.isNativePlatform?.())
}

// ─── STATE GLOBAL ─────────────────────────────────────────────────────────────
let btDevice         = null  // Web Bluetooth device
let btCharacteristic = null  // Web Bluetooth characteristic
let btNativeAddress  = null  // Capacitor BT device address

// ─── SERVICE UUIDs (Web Bluetooth) ───────────────────────────────────────────
const PRINT_SERVICE_UUIDS = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  '00001101-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
]
const PRINT_CHAR_UUIDS = [
  '00002af1-0000-1000-8000-00805f9b34fb',
  '000018f1-0000-1000-8000-00805f9b34fb',
  'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
  '49535343-8841-43f4-a8d4-ecbe34729bb3',
]

// ─── CAPACITOR BT SERIAL: CONNECT ─────────────────────────────────────────────
async function connectCapacitor() {
  const { BluetoothSerial } = await import('@e-is/capacitor-bluetooth-serial')

  // Cek apakah BT aktif
  const { isEnabled } = await BluetoothSerial.isEnabled()
  if (!isEnabled) {
    await BluetoothSerial.enable()
    await new Promise(r => setTimeout(r, 1500))
  }

  // scan() = ambil daftar paired device (method yang benar untuk @e-is/capacitor-bluetooth-serial)
  const result = await BluetoothSerial.scan()
  const devices = result?.devices || []

  if (devices.length === 0) {
    throw new Error(
      'Tidak ada perangkat Bluetooth yang dipasangkan.\n' +
      'Buka Pengaturan → Bluetooth → Pasangkan printer terlebih dahulu, lalu coba lagi.'
    )
  }

  // Prioritaskan device dengan nama yang mirip printer
  const printerKeywords = ['print', 'xp', 'pt', 'rp', 'tm', 'pos', 'thermal', 'mtp', 'mpp', 'gp']
  let target = devices.find(d =>
    printerKeywords.some(k => d.name?.toLowerCase().includes(k))
  ) || devices[0]

  // Jika >1 device dan tidak ada yang cocok keyword, tanya user
  if (devices.length > 1 && !printerKeywords.some(k => target.name?.toLowerCase().includes(k))) {
    const names = devices.map((d, i) => (i + 1) + '. ' + (d.name || d.address)).join('\n')
    const choice = window.prompt(
      'Pilih nomor printer:\n' + names + '\n\n(Ketik angka 1-' + devices.length + ')',
      '1'
    )
    const idx = parseInt(choice) - 1
    if (!isNaN(idx) && idx >= 0 && idx < devices.length) target = devices[idx]
  }

  await BluetoothSerial.connect({ address: target.address })
  btNativeAddress = target.address
  return target.name || 'Printer Termal'
}

// ─── WEB BLUETOOTH: CONNECT ───────────────────────────────────────────────────
async function connectWeb() {
  if (!navigator.bluetooth) {
    throw new Error(
      'Web Bluetooth tidak didukung di browser ini.\n' +
      'Gunakan Chrome Android dan buka warungku-one.vercel.app di browser.'
    )
  }

  btDevice = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: PRINT_SERVICE_UUIDS,
  })

  const server = await btDevice.gatt.connect()
  let service  = null
  let charFound = null

  for (const svcUuid of PRINT_SERVICE_UUIDS) {
    try { service = await server.getPrimaryService(svcUuid); break } catch { /* coba berikutnya */ }
  }
  if (!service) {
    const services = await server.getPrimaryServices()
    if (services.length === 0) throw new Error('Tidak ada GATT service di printer ini.')
    service = services[0]
  }

  const chars = await service.getCharacteristics()
  for (const c of chars) {
    if (c.properties.write || c.properties.writeWithoutResponse) { charFound = c; break }
  }
  if (!charFound) throw new Error('Tidak ada writable characteristic di printer.')
  btCharacteristic = charFound
  return btDevice.name || 'Printer Termal'
}

// ─── PUBLIC: connectPrinter ───────────────────────────────────────────────────
export async function connectPrinter() {
  if (isCapacitorApp()) {
    return await connectCapacitor()
  }
  return await connectWeb()
}

// ─── PUBLIC: isConnected ──────────────────────────────────────────────────────
export function isConnected() {
  if (isCapacitorApp()) return !!btNativeAddress
  return !!(btDevice?.gatt?.connected && btCharacteristic)
}

// ─── PUBLIC: disconnectPrinter ────────────────────────────────────────────────
export async function disconnectPrinter() {
  if (isCapacitorApp()) {
    try {
      const { BluetoothSerial } = await import('@e-is/capacitor-bluetooth-serial')
      if (btNativeAddress) await BluetoothSerial.disconnect()
    } catch { /* abaikan error disconnect */ }
    btNativeAddress = null
  } else {
    btDevice?.gatt?.disconnect()
    btDevice         = null
    btCharacteristic = null
  }
}

// ─── WRITE CHUNKED (Web Bluetooth) ────────────────────────────────────────────
async function writeChunked(data, chunkSize = 512) {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    if (btCharacteristic.properties.writeWithoutResponse) {
      await btCharacteristic.writeValueWithoutResponse(chunk)
    } else {
      await btCharacteristic.writeValue(chunk)
    }
    await new Promise(r => setTimeout(r, 50))
  }
}

// ─── PUBLIC: printStruk ───────────────────────────────────────────────────────
export async function printStruk(tx, store, paperWidth = 32) {
  if (!isConnected()) throw new Error('Printer belum terhubung.')

  const bytes = buildStrukBytes(tx, store, paperWidth)

  if (isCapacitorApp()) {
    const { BluetoothSerial } = await import('@e-is/capacitor-bluetooth-serial')
    // Convert Uint8Array ke base64 string untuk dikirim via plugin
    const b64 = btoa(String.fromCharCode(...bytes))
    await BluetoothSerial.write({ address: btNativeAddress, data: b64 })
  } else {
    await writeChunked(bytes)
  }
}
