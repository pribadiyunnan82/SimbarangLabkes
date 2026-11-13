import {
  Category,
  UnitMeasure,
  StorageLocation,
  Supplier,
  Department,
  Item,
  StockInTransaction,
  StockOutTransaction,
  StockAdjustment,
  StockOpname,
  AuditLog,
  User,
  OrderRequestLetter,
  PurchaseOrderLetter,
} from '../types/inventory';

export const INITIAL_USERS: User[] = [];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', code: 'KAT-REA', name: 'Reagen', description: 'Reagen analitik dan kimia klinis laboratorium', status: 'active' },
  { id: 'cat-2', code: 'KAT-KIM', name: 'Bahan Kimia', description: 'Pelarut, asam, basa, dan bahan kimia murni', status: 'active' },
  { id: 'cat-3', code: 'KAT-LAB', name: 'Alat Laboratorium', description: 'Peralatan gelas, instrumen, dan alat ukur', status: 'active' },
  { id: 'cat-4', code: 'KAT-APD', name: 'Alat Pelindung Diri', description: 'Sarung tangan, masker, jas lab, pelindung mata', status: 'active' },
  { id: 'cat-5', code: 'KAT-ATK', name: 'Alat Tulis Kantor', description: 'Kertas, pena, label dan perlengkapan kantor', status: 'active' },
  { id: 'cat-6', code: 'KAT-BUM', name: 'Barang Umum', description: 'Perlengkapan pembersih dan operasional umum', status: 'active' },
  { id: 'cat-7', code: 'KAT-ELE', name: 'Elektronik', description: 'Perangkat elektronik dan instrumen digital', status: 'active' },
  { id: 'cat-8', code: 'KAT-BHP', name: 'Barang Habis Pakai', description: 'Consumables, tips micropipette, syringe', status: 'active' },
  { id: 'cat-9', code: 'KAT-SUK', name: 'Suku Cadang', description: 'Sparepart instrumen centrifuge, autoklaf', status: 'active' },
  { id: 'cat-10', code: 'KAT-INV', name: 'Barang Inventaris', description: 'Aset tetap laboratorium dan kantor', status: 'active' },
];

export const INITIAL_UNITS: UnitMeasure[] = [
  { id: 'unt-1', name: 'Pieces', symbol: 'Pcs', status: 'active' },
  { id: 'unt-2', name: 'Unit', symbol: 'Unit', status: 'active' },
  { id: 'unt-3', name: 'Box', symbol: 'Box', status: 'active' },
  { id: 'unt-4', name: 'Botol', symbol: 'Btl', status: 'active' },
  { id: 'unt-5', name: 'Vial', symbol: 'Vial', status: 'active' },
  { id: 'unt-6', name: 'Pack', symbol: 'Pack', status: 'active' },
  { id: 'unt-7', name: 'Kilogram', symbol: 'Kg', status: 'active' },
  { id: 'unt-8', name: 'Gram', symbol: 'g', status: 'active' },
  { id: 'unt-9', name: 'Liter', symbol: 'L', status: 'active' },
  { id: 'unt-10', name: 'Mililiter', symbol: 'mL', status: 'active' },
];

export const INITIAL_LOCATIONS: StorageLocation[] = [
  { id: 'loc-1', code: 'GUD-UTM-A', name: 'Gudang Utama - Rak A', room: 'Gudang Utama', rack: 'Rak A (Barang Kering)', description: 'Penyimpanan APD dan wadah kering', status: 'active' },
  { id: 'loc-2', code: 'GUD-UTM-B', name: 'Gudang Utama - Rak B', room: 'Gudang Utama', rack: 'Rak B (Consumables)', description: 'Tips, tabung reaksi, dan pipet', status: 'active' },
  { id: 'loc-3', code: 'GUD-REA-L1', name: 'Gudang Reagen - Lemari 1', room: 'Gudang Reagen', rack: 'Lemari 1 (Suhu Ruang 20-25°C)', description: 'Penyimpanan reagen kering dan buffer', status: 'active' },
  { id: 'loc-4', code: 'GUD-REA-LP', name: 'Gudang Reagen - Chiller 2-8°C', room: 'Gudang Reagen', rack: 'Lemari Pendingin No. 2', description: 'Penyimpanan reagen enzim dan kontrol klinis', status: 'active' },
  { id: 'loc-5', code: 'GUD-B3-K1', name: 'Gudang Bahan Berbahaya (B3)', room: 'Ruang B3 Khusus', rack: 'Kabinet Asam Basa', description: 'Pelarut organik mudah terbakar dan asam pekat', status: 'active' },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    code: 'SUP-001',
    name: 'PT. Mata Pensil Globalindo',
    address: 'Gedung Wahid 27. Jl. KH. Wahid Hasyim no.27. Menteng. Jakarta Pusat',
    phone: '(021) 39832288',
    email: 'info@matapensilglobal.com',
    contactPerson: 'Bambang Sugiarto',
    description: 'Distributor utama reagen, alat laboratorium klinis dan bahan medis habis pakai (BMHP)',
    status: 'active',
  },
  {
    id: 'sup-2',
    code: 'SUP-002',
    name: 'PT. Kimia Farma Trading & Distribution',
    address: 'Jl. Budi Utomo No. 1, Pasar Baru, Sawah Besar, Jakarta Pusat',
    phone: '(021) 3847755',
    email: 'kftd@kimiafarma.co.id',
    contactPerson: 'Rudi Hartono',
    description: 'Penyedia obat, bahan farmasi, dan reagen diagnostik resmi BUMN',
    status: 'active',
  },
  {
    id: 'sup-3',
    code: 'SUP-003',
    name: 'PT. Enseval Putera Megatrading',
    address: 'Kawasan Industri Pulogadung, Jl. Pulo Lentut No. 10, Jakarta Timur',
    phone: '(021) 4609042',
    email: 'customercare@enseval.com',
    contactPerson: 'Dewi Lestari',
    description: 'Distributor alat kesehatan, reagen diagnostik Mindray dan laboratorium',
    status: 'active',
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [];

export const INITIAL_ITEMS: Item[] = [];

export const INITIAL_STOCK_IN: StockInTransaction[] = [];

export const INITIAL_STOCK_OUT: StockOutTransaction[] = [];

export const INITIAL_ADJUSTMENTS: StockAdjustment[] = [];

export const INITIAL_STOCK_OPNAMES: StockOpname[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_ORDER_REQUESTS: OrderRequestLetter[] = [
  {
    id: 'req-2026-001',
    nomor: '024/SP/Labkesda/2026',
    lampiran: '-',
    perihal: 'Permohonan Alat Habis Pakai',
    tempat: 'Tasikmalaya',
    tanggal: '2026-02-24',
    tanggalFormatted: '24 Februari 2026',
    tanggalHijriah: '06 Ramadhan 1447 H',
    tujuanJabatan: 'Yth. Bendahara Barang UPTD Labkesda',
    tujuanInstansi: 'Kabupaten Tasikmalaya',
    tujuanTempat: 'di Tasikmalaya',
    kopPemda: 'PEMERINTAH DAERAH KABUPATEN TASIKMALAYA',
    kopDinas: 'DINAS KESEHATAN',
    kopUnit: 'UPTD LABKESDA KAB. TASIKMALAYA',
    kopAlamat: 'Jalan Pancasila No. 27 Kota Tasikmalaya',
    kopKontak: 'e-mail : labkabtsm@gmail.com Telp. (0265) 332723 Kode Pos 46111',
    paragrafPembuka: 'Untuk memenuhi kebutuhan pelayanan pada pasien, bersama ini kami sampaikan Usulan Kebutuhan bahan habis pakai Laboratorium. Adapun yang kami usulkan sebagai berikut :',
    items: [
      {
        id: 'item-req-1',
        namaBahan: 'Reagen Hematologi Diluent 3-Diff',
        merkReagen: 'Mindray',
        kemasanReagen: '20 Liter / Dus',
        jumlah: '2 Dus',
      },
      {
        id: 'item-req-2',
        namaBahan: 'Reagen Glukosa Darah GOD-PAP',
        merkReagen: 'Human Diagnostics',
        kemasanReagen: 'Kit 4 x 100 mL',
        jumlah: '3 Kit',
      },
      {
        id: 'item-req-3',
        namaBahan: 'Tabung Vacutainer K3 EDTA 3 mL',
        merkReagen: 'Vaculab',
        kemasanReagen: '100 Pcs / Pack',
        jumlah: '5 Pack',
      },
      {
        id: 'item-req-4',
        namaBahan: 'Yellow Tips Mikropipet 20-200 uL',
        merkReagen: 'Biologix',
        kemasanReagen: '1.000 Pcs / Bag',
        jumlah: '4 Bag',
      },
    ],
    paragrafPenutup: 'Demikian yang dapat kami sampaikan, atas perhatian diucapkan terima kasih.',
    namaPemohon: 'Nurjanah, A.Md. AK',
    nipPemohon: '198810202024212022',
    jabatanPemohon: 'Pemohon',
    status: 'Diajukan',
    createdAt: '2026-02-24T08:30:00.000Z',
    updatedAt: '2026-02-24T08:30:00.000Z',
  },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrderLetter[] = [
  {
    id: 'po-2026-001',
    nomorSurat: '400.7.18.3/006/LABKESDA/I/2026',
    tempat: 'Tasikmalaya',
    tanggal: '2026-02-24',
    tanggalFormatted: '24 Februari 2026',
    supplierId: 'sup-1',
    namaSupplier: 'PT. Mata Pensil Globalindo',
    alamatSupplier: 'Gedung Wahid 27. Jl. KH. Wahid Hasyim no.27. Menteng. Jakarta Pusat.',
    supplierName: 'PT. Mata Pensil Globalindo',
    supplierAddress: 'Gedung Wahid 27. Jl. KH. Wahid Hasyim no.27. Menteng. Jakarta Pusat.',
    teleponSupplier: '(021) 39832288',
    emailSupplier: 'info@matapensilglobal.com',
    kopPemda: 'PEMERINTAH DAERAH KABUPATEN TASIKMALAYA',
    kopDinas: 'DINAS KESEHATAN',
    kopUnit: 'UPTD LABORATORIUM KESEHATAN DAERAH',
    kopAlamat: 'JL. Pancasila No. 27 Kota Tasikmalaya Telepon : (0265) 332723',
    kopEmail: 'labkabtsm@gmail.com',
    kopKodePos: '46111',
    paragrafPengantar:
      'Bersama ini kami berharap saudara segera mengirim/menyerahkan barang-barang yang tertera dibawah ini kepada Kepala UPTD Labkesda Kabupaten Tasikmalaya, Jalan Pancasila No.27 Kel. Lengkongsari Kec. Tawang Kota Tasikmalaya',
    narasiPengantar:
      'Bersama ini kami berharap saudara segera mengirim/menyerahkan barang-barang yang tertera dibawah ini kepada Kepala UPTD Labkesda Kabupaten Tasikmalaya, Jalan Pancasila No.27 Kel. Lengkongsari Kec. Tawang Kota Tasikmalaya',
    items: [
      {
        id: 'po-item-1',
        namaBarang: 'Reagen Hematologi Diluent 3-Diff',
        merk: 'Mindray',
        volume: '20 Liter',
        banyaknya: 2,
        satuan: 'Dus',
        hargaSatuan: 1850000,
        jumlahHarga: 3700000,
      },
      {
        id: 'po-item-2',
        namaBarang: 'Reagen Glukosa Darah GOD-PAP',
        merk: 'Human',
        volume: 'Kit 4x100 mL',
        banyaknya: 3,
        satuan: 'Kit',
        hargaSatuan: 750000,
        jumlahHarga: 2250000,
      },
      {
        id: 'po-item-3',
        namaBarang: 'Tabung Vacutainer K3 EDTA 3 mL',
        merk: 'Vaculab',
        volume: '100 Pcs/Pack',
        banyaknya: 5,
        satuan: 'Pack',
        hargaSatuan: 140000,
        jumlahHarga: 700000,
      },
      {
        id: 'po-item-4',
        namaBarang: 'Yellow Tips Mikropipet 20-200 uL',
        merk: 'Biologix',
        volume: '1.000 Pcs/Bag',
        banyaknya: 4,
        satuan: 'Bag',
        hargaSatuan: 125000,
        jumlahHarga: 500000,
      },
    ],
    syarat1: 'Harga barang sudah termasuk PPN',
    syarat2: 'Barang harus sesuai dengan pesanan',
    syarat3: 'Pembayaran dilaksanakan setelah barang diterima dengan baik',
    syarat4: 'Batas waktu penyerahan selambat-lambatnya Tanggal 3 Maret 2026.',
    syaratSyarat: [
      'Harga barang sudah termasuk PPN',
      'Barang harus sesuai dengan pesanan',
      'Pembayaran dilaksanakan setelah barang diterima dengan baik',
      'Batas waktu penyerahan selambat-lambatnya Tanggal 3 Maret 2026.',
    ],
    batasWaktuPenyerahan: 'Tanggal 3 Maret 2026',
    jabatanPenandatangan: 'Kepala UPTD Labkesda Kabupaten Tasikmalaya',
    namaPenandatangan: 'T. ALDYANSYAH, ST. MM',
    nipPenandatangan: '19781125 200501 1 008',
    totalHarga: 7150000,
    status: 'Terkirim ke Pemasok',
    createdAt: '2026-02-24T09:00:00.000Z',
    updatedAt: '2026-02-24T09:00:00.000Z',
  },
];

