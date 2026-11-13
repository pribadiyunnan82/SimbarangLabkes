export type UserRole = 'admin' | 'petugas' | 'pimpinan';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  email: string;
  phone?: string;
  department?: string;
  avatar?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface UnitMeasure {
  id: string;
  name: string;
  symbol: string;
  status: 'active' | 'inactive';
}

export interface StorageLocation {
  id: string;
  code: string;
  name: string;
  room: string;
  rack: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Department {
  id: string;
  code: string;
  name: string;
  pic: string;
  status: 'active' | 'inactive';
}

export type ItemStatus = 'Aktif' | 'Tidak Aktif' | 'Rusak' | 'Expired' | 'Quarantine' | 'Habis';

export interface Item {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  unitId: string;
  locationId: string;
  supplierId: string;
  minimumStock: number;
  maximumStock: number;
  price: number; // Harga satuan (Rp)
  currentStock: number;
  status: ItemStatus;
  description: string;
  // Lab specific fields
  batchNumber?: string;
  manufacturer?: string;
  productionDate?: string;
  expiryDate?: string;
  storageCondition?: string; // e.g. "2°C - 8°C" or "Suhu Ruang (20°C - 25°C)"
  storageTemp?: string;
  certificateNumber?: string; // COA
  createdAt: string;
  updatedAt: string;
}

export interface StockInDetail {
  id: string;
  itemId: string;
  quantity: number;
  price: number;
  batchNumber: string;
  productionDate?: string;
  expiryDate?: string;
  locationId: string;
  condition: 'Baik' | 'Rusak' | 'Segel Terbuka';
  notes?: string;
}

export interface StockInTransaction {
  id: string;
  transactionNumber: string; // BM-YYYYMM-XXX
  date: string;
  supplierId: string;
  documentNumber: string; // No PO / Faktur
  deliveryNote: string; // Surat Jalan
  userId: string;
  userName: string;
  description: string;
  details: StockInDetail[];
  createdAt: string;
}

export interface StockOutDetail {
  id: string;
  itemId: string;
  quantity: number;
  batchNumber?: string;
  locationId: string;
  notes?: string;
}

export interface StockOutTransaction {
  id: string;
  transactionNumber: string; // BK-YYYYMM-XXX
  date: string;
  departmentId: string;
  departmentName: string;
  requesterName: string;
  requestNumber: string;
  userId: string;
  userName: string;
  description: string;
  details: StockOutDetail[];
  createdAt: string;
}

export type AdjustmentReason =
  | 'Barang rusak'
  | 'Barang hilang'
  | 'Kesalahan pencatatan'
  | 'Barang kadaluarsa'
  | 'Penggunaan belum tercatat'
  | 'Lainnya';

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string; // ADJ-YYYYMM-XXX
  date: string;
  itemId: string;
  quantityBefore: number;
  quantityAfter: number;
  difference: number;
  reason: AdjustmentReason;
  userId: string;
  userName: string;
  description: string;
  createdAt: string;
}

export interface StockOpnameDetail {
  id: string;
  itemId: string;
  systemQuantity: number;
  physicalQuantity: number;
  difference: number;
  reason: string;
  notes?: string;
}

export interface StockOpname {
  id: string;
  opnameNumber: string; // SO-YYYYMM-XXX
  date: string;
  locationId: string;
  userId: string;
  userName: string;
  description: string;
  status: 'draft' | 'approved';
  details: StockOpnameDetail[];
  createdAt: string;
}

export type StockCardTransactionType = 'Saldo Awal' | 'Barang Masuk' | 'Barang Keluar' | 'Penyesuaian' | 'Stock Opname';

export interface StockCardEntry {
  id: string;
  date: string;
  transactionNumber: string;
  type: StockCardTransactionType;
  inQty: number;
  outQty: number;
  adjustmentQty: number;
  balance: number;
  officer: string;
  notes: string;
  batchNumber?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  activity: string;
  module: string;
  oldData?: string;
  newData?: string;
  ipAddress: string;
  createdAt: string;
}

export type StockStatus = 'AMAN' | 'MINIMUM' | 'HABIS';

export type ExpiryStatus = 'AMAN' | 'PERINGATAN' | 'SEGERA DIGUNAKAN' | 'EXPIRED';

export interface OrderRequestItem {
  id: string;
  itemId?: string;
  namaBahan: string;
  merkReagen: string;
  kemasanReagen: string;
  jumlah: string;
  satuan?: string;
  keterangan?: string;
}

export type OrderRequestStatus = 'Draf' | 'Diajukan' | 'Disetujui' | 'Selesai';

export interface OrderRequestLetter {
  id: string;
  nomor: string; // e.g. "024/SP/Labkesda/2026"
  lampiran: string; // e.g. "-"
  perihal: string; // e.g. "Permohonan Alat Habis Pakai"
  tempat: string; // e.g. "Tasikmalaya"
  tanggal: string; // e.g. "2026-02-24"
  tanggalFormatted: string; // e.g. "24 Februari 2026"
  tanggalHijriah?: string; // e.g. "06 Ramadhan 1447 H"
  tujuanJabatan: string; // e.g. "Yth. Bendahara Barang UPTD Labkesda"
  tujuanInstansi: string; // e.g. "Kabupaten Tasikmalaya"
  tujuanTempat: string; // e.g. "di Tasikmalaya"
  
  kopPemda: string; // "PEMERINTAH DAERAH KABUPATEN TASIKMALAYA"
  kopDinas: string; // "DINAS KESEHATAN"
  kopUnit: string; // "UPTD LABKESDA KAB. TASIKMALAYA"
  kopAlamat: string; // "Jalan Pancasila No. 27 Kota Tasikmalaya"
  kopKontak: string; // "e-mail : labkabtsm@gmail.com Telp. (0265) 332723 Kode Pos 46111"
  
  paragrafPembuka: string;
  items: OrderRequestItem[];
  paragrafPenutup: string;
  
  namaPemohon: string; // e.g. "Nurjanah, A.Md. AK"
  nipPemohon: string; // e.g. "198810202024212022"
  jabatanPemohon?: string; // e.g. "Pemohon"
  status: OrderRequestStatus;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  no?: number;
  itemId?: string;
  namaBarang: string;
  merk: string;
  volume: string;
  banyaknya: number;
  satuan: string;
  hargaSatuan: number;
  jumlahHarga: number;
  keterangan?: string;
}

export type PurchaseOrderStatus =
  | 'Draf'
  | 'Diterbitkan'
  | 'Terkirim ke Pemasok'
  | 'Dikirim ke Supplier'
  | 'Barang Diterima'
  | 'Selesai'
  | 'Dibatalkan';

export interface PurchaseOrderLetter {
  id: string;
  nomorSurat: string; // e.g. "400.7.18.3/006/LABKESDA/I/2026"
  tempat: string; // e.g. "Tasikmalaya"
  tanggal: string; // e.g. "2026-02-24"
  tanggalFormatted: string; // e.g. "24 Februari 2026"
  
  // Linkage to Master Supplier
  supplierId?: string;
  namaSupplier: string; // "PT. Mata Pensil Globalindo"
  alamatSupplier: string; // "Gedung Wahid 27. Jl. KH. Wahid Hasyim no.27. Menteng. Jakarta Pusat."
  supplierName?: string; // alias
  supplierAddress?: string; // alias
  teleponSupplier?: string;
  emailSupplier?: string;
  
  // Kop Surat
  kopPemda: string; // "PEMERINTAH DAERAH KABUPATEN TASIKMALAYA"
  kopDinas: string; // "DINAS KESEHATAN"
  kopUnit: string; // "UPTD LABORATORIUM KESEHATAN DAERAH"
  kopAlamat: string; // "JL. Pancasila No. 27 Kota Tasikmalaya Telepon : (0265) 332723"
  kopEmail?: string; // "labkabtsm@gmail.com"
  kopKodePos?: string; // "46111"
  kopKontak?: string;
  
  // Narasi Surat Pesanan
  paragrafPengantar: string;
  narasiPengantar?: string;
  
  // Items
  items: PurchaseOrderItem[];
  
  // Syarat-syarat
  syarat1?: string; // "Harga barang sudah termasuk PPN"
  syarat2?: string; // "Barang harus sesuai dengan pesanan"
  syarat3?: string; // "Pembayaran dilaksanakan setelah barang diterima dengan baik"
  syarat4?: string; // "Batas waktu penyerahan selambat-lambatnya Tanggal 3 Maret 2026."
  syaratSyarat?: string[];
  batasWaktuPenyerahan: string; // "Tanggal 3 Maret 2026"
  
  // Penandatangan (Kepala UPTD)
  jabatanPenandatangan: string; // "Kepala UPTD Labkesda Kabupaten Tasikmalaya"
  namaPenandatangan: string; // "T. ALDYANSYAH, ST. MM"
  nipPenandatangan: string; // "19781125 200501 1 008"
  
  totalHarga?: number;
  catatanInternal?: string;
  status: PurchaseOrderStatus;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

