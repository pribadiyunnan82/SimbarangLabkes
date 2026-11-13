import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  PurchaseOrderLetter,
  PurchaseOrderItem,
  PurchaseOrderStatus,
} from '../../types/inventory';
import {
  ShoppingCart,
  Printer,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  RotateCcw,
  Boxes,
  Eye,
  Edit3,
  Calendar,
  Building,
  User,
  ArrowRight,
  PackagePlus,
  X,
  FileSpreadsheet,
  FileText,
  Search,
  ExternalLink,
  DollarSign,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';

const DEFAULT_PURCHASE_ORDER_FORM: Omit<PurchaseOrderLetter, 'id' | 'createdAt' | 'updatedAt'> = {
  nomorSurat: '400.7.18.3/006/LABKESDA/I/2026',
  tempat: 'Tasikmalaya',
  tanggal: '2026-02-24',
  tanggalFormatted: '24 Februari 2026',
  supplierId: 'sup-1',
  namaSupplier: 'PT. Mata Pensil Globalindo',
  alamatSupplier: 'Gedung Wahid 27. Jl. KH. Wahid Hasyim no.27. Menteng. Jakarta Pusat.',
  supplierName: 'PT. Mata Pensil Globalindo',
  supplierAddress: 'Gedung Wahid 27. Jl. KH. Wahid Hasyim no.27. Menteng. Jakarta Pusat.',
  paragrafPengantar:
    'Bersama ini kami berharap saudara segera mengirim/menyerahkan barang-barang yang tertera dibawah ini kepada Kepala UPTD Labkesda Kabupaten Tasikmalaya, Jalan Pancasila No.27 Kel. Lengkongsari Kec. Tawang Kota Tasikmalaya',
  narasiPengantar:
    'Bersama ini kami berharap saudara segera mengirim/menyerahkan barang-barang yang tertera dibawah ini kepada Kepala UPTD Labkesda Kabupaten Tasikmalaya, Jalan Pancasila No.27 Kel. Lengkongsari Kec. Tawang Kota Tasikmalaya',
  kopPemda: 'PEMERINTAH DAERAH KABUPATEN TASIKMALAYA',
  kopDinas: 'DINAS KESEHATAN',
  kopUnit: 'UPTD LABORATORIUM KESEHATAN DAERAH',
  kopAlamat: 'JL. Pancasila No. 27 Kota Tasikmalaya Telepon : (0265) 332723',
  kopKontak: 'email : labkabtsm@gmail.com',
  kopKodePos: 'Kode Pos : 46111',
  items: [],
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
  status: 'Diterbitkan',
  catatanInternal: 'Pesanan reagen & BMHP rutin laboratorium bulan Februari 2026.',
};

const INDO_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const normalizePOData = (
  po: Partial<PurchaseOrderLetter> | null | undefined
): Omit<PurchaseOrderLetter, 'id' | 'createdAt' | 'updatedAt'> => {
  if (!po) return DEFAULT_PURCHASE_ORDER_FORM;

  const defaultSyarat = [
    po.syarat1 || 'Harga barang sudah termasuk PPN',
    po.syarat2 || 'Barang harus sesuai dengan pesanan',
    po.syarat3 || 'Pembayaran dilaksanakan setelah barang diterima dengan baik',
    po.syarat4 || `Batas waktu penyerahan selambat-lambatnya ${po.batasWaktuPenyerahan || 'Tanggal 3 Maret 2026'}.`,
  ];

  const rawSyarat =
    Array.isArray(po.syaratSyarat) && po.syaratSyarat.length > 0
      ? po.syaratSyarat
      : defaultSyarat;

  const rawItems = Array.isArray(po.items) && po.items.length > 0
    ? po.items
    : DEFAULT_PURCHASE_ORDER_FORM.items;

  return {
    ...DEFAULT_PURCHASE_ORDER_FORM,
    ...po,
    items: rawItems.map((item, idx) => ({
      ...item,
      no: item.no || idx + 1,
      banyaknya: Number(item.banyaknya) || 0,
      hargaSatuan: Number(item.hargaSatuan) || 0,
      jumlahHarga:
        Number(item.jumlahHarga) ||
        (Number(item.banyaknya) || 0) * (Number(item.hargaSatuan) || 0),
    })),
    syaratSyarat: rawSyarat,
    batasWaktuPenyerahan:
      po.batasWaktuPenyerahan || DEFAULT_PURCHASE_ORDER_FORM.batasWaktuPenyerahan,
    supplierName:
      po.supplierName || po.namaSupplier || DEFAULT_PURCHASE_ORDER_FORM.supplierName,
    namaSupplier:
      po.namaSupplier || po.supplierName || DEFAULT_PURCHASE_ORDER_FORM.namaSupplier,
    supplierAddress:
      po.supplierAddress || po.alamatSupplier || DEFAULT_PURCHASE_ORDER_FORM.supplierAddress,
    alamatSupplier:
      po.alamatSupplier || po.supplierAddress || DEFAULT_PURCHASE_ORDER_FORM.alamatSupplier,
    narasiPengantar:
      po.narasiPengantar || po.paragrafPengantar || DEFAULT_PURCHASE_ORDER_FORM.narasiPengantar,
    paragrafPengantar:
      po.paragrafPengantar || po.narasiPengantar || DEFAULT_PURCHASE_ORDER_FORM.paragrafPengantar,
    kopPemda: po.kopPemda || DEFAULT_PURCHASE_ORDER_FORM.kopPemda,
    kopDinas: po.kopDinas || DEFAULT_PURCHASE_ORDER_FORM.kopDinas,
    kopUnit: po.kopUnit || DEFAULT_PURCHASE_ORDER_FORM.kopUnit,
    kopAlamat: po.kopAlamat || DEFAULT_PURCHASE_ORDER_FORM.kopAlamat,
    kopKontak: po.kopKontak || DEFAULT_PURCHASE_ORDER_FORM.kopKontak,
    kopKodePos: po.kopKodePos || DEFAULT_PURCHASE_ORDER_FORM.kopKodePos,
    jabatanPenandatangan:
      po.jabatanPenandatangan || DEFAULT_PURCHASE_ORDER_FORM.jabatanPenandatangan,
    namaPenandatangan:
      po.namaPenandatangan || DEFAULT_PURCHASE_ORDER_FORM.namaPenandatangan,
    nipPenandatangan:
      po.nipPenandatangan || DEFAULT_PURCHASE_ORDER_FORM.nipPenandatangan,
    status: po.status || 'Diterbitkan',
  };
};

export const PurchaseOrderView: React.FC = () => {
  const {
    purchaseOrders = [],
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    suppliers = [],
    items: masterItems = [],
    currentUser,
  } = useInventory();

  // Active sub-tab: 'editor' | 'list'
  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'list'>('editor');

  // Form State
  const [currentId, setCurrentId] = useState<string | null>(
    purchaseOrders && purchaseOrders.length > 0 ? purchaseOrders[0].id : null
  );

  const [formData, setFormData] = useState<
    Omit<PurchaseOrderLetter, 'id' | 'createdAt' | 'updatedAt'>
  >(() => {
    if (purchaseOrders && purchaseOrders.length > 0) {
      return normalizePOData(purchaseOrders[0]);
    }
    return DEFAULT_PURCHASE_ORDER_FORM;
  });

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Modal for selecting from Master Inventory Items
  const [isItemPickerOpen, setIsItemPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Helper to format ISO date to Indonesian string (e.g. 2026-02-24 -> 24 Februari 2026)
  const formatIndonesianDate = (isoDate: string): string => {
    try {
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[2], 10);
        const monthIdx = parseInt(parts[1], 10) - 1;
        const year = parts[0];
        if (monthIdx >= 0 && monthIdx < 12) {
          return `${day} ${INDO_MONTHS[monthIdx]} ${year}`;
        }
      }
      return isoDate;
    } catch {
      return isoDate;
    }
  };

  const handleDateChange = (val: string) => {
    const formatted = formatIndonesianDate(val);
    setFormData((prev) => ({
      ...prev,
      tanggal: val,
      tanggalFormatted: formatted,
    }));
  };

  // Handler when selecting a supplier from master data
  const handleSupplierSelect = (supplierId: string) => {
    if (!supplierId) {
      setFormData((prev) => ({
        ...prev,
        supplierId: undefined,
      }));
      return;
    }

    const found = suppliers.find((s) => s.id === supplierId);
    if (found) {
      // Build address string from supplier fields
      const fullAddressParts = [found.address, found.city, found.phone ? `Telp. ${found.phone}` : '']
        .filter(Boolean)
        .join('. ');

      setFormData((prev) => ({
        ...prev,
        supplierId: found.id,
        namaSupplier: found.name,
        alamatSupplier: fullAddressParts || found.address || '',
        supplierName: found.name,
        supplierAddress: fullAddressParts || found.address || '',
      }));
    }
  };

  // Item Table handlers
  const handleItemChange = (
    index: number,
    field: keyof PurchaseOrderItem,
    value: any
  ) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      const target = { ...updated[index], [field]: value };

      // Auto compute jumlahHarga if banyaknya or hargaSatuan changes
      if (field === 'banyaknya' || field === 'hargaSatuan') {
        const qty = field === 'banyaknya' ? Number(value) || 0 : Number(target.banyaknya) || 0;
        const price =
          field === 'hargaSatuan' ? Number(value) || 0 : Number(target.hargaSatuan) || 0;
        target.jumlahHarga = qty * price;
      }

      updated[index] = target;
      return { ...prev, items: updated };
    });
  };

  const handleAddItemRow = () => {
    const newRow: PurchaseOrderItem = {
      id: 'po-item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      no: formData.items.length + 1,
      namaBarang: '',
      merk: '',
      volume: '',
      banyaknya: 1,
      satuan: 'Pcs',
      hargaSatuan: 0,
      jumlahHarga: 0,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newRow],
    }));
  };

  const handleRemoveItemRow = (index: number) => {
    if (formData.items.length <= 1) {
      setNotification({
        type: 'error',
        message: 'Minimal harus ada 1 baris barang pada surat pesanan.',
      });
      return;
    }
    setFormData((prev) => {
      const updated = prev.items.filter((_, idx) => idx !== index);
      // Re-index row numbers
      return {
        ...prev,
        items: updated.map((item, idx) => ({ ...item, no: idx + 1 })),
      };
    });
  };

  // Add Item from Master Inventory
  const handleSelectMasterItem = (masterItem: any) => {
    const newRow: PurchaseOrderItem = {
      id: 'po-item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      no: formData.items.length + 1,
      itemId: masterItem.id,
      namaBarang: masterItem.name,
      merk: masterItem.category || '',
      volume: masterItem.minStock ? `${masterItem.minStock} min` : '1 Unit',
      banyaknya: 1,
      satuan: masterItem.unit || 'Pcs',
      hargaSatuan: masterItem.unitPrice || 0,
      jumlahHarga: masterItem.unitPrice || 0,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newRow],
    }));
    setIsItemPickerOpen(false);
    setNotification({
      type: 'success',
      message: `Barang "${masterItem.name}" berhasil ditambahkan ke daftar pesanan.`,
    });
  };

  // Clause 4 (Batas waktu penyerahan) sync
  const handleBatasWaktuChange = (val: string) => {
    setFormData((prev) => {
      const baseSyarat =
        Array.isArray(prev.syaratSyarat) && prev.syaratSyarat.length > 0
          ? prev.syaratSyarat
          : [
              prev.syarat1 || 'Harga barang sudah termasuk PPN',
              prev.syarat2 || 'Barang harus sesuai dengan pesanan',
              prev.syarat3 || 'Pembayaran dilaksanakan setelah barang diterima dengan baik',
              `Batas waktu penyerahan selambat-lambatnya ${val}.`,
            ];
      const updatedSyarat = [...baseSyarat];
      const clauseText = `Batas waktu penyerahan selambat-lambatnya ${val}.`;
      if (updatedSyarat.length >= 4) {
        updatedSyarat[3] = clauseText;
      } else {
        updatedSyarat.push(clauseText);
      }
      return {
        ...prev,
        batasWaktuPenyerahan: val,
        syarat4: clauseText,
        syaratSyarat: updatedSyarat,
      };
    });
  };

  // Save / Update Handler
  const handleSave = () => {
    if (!formData.nomorSurat.trim()) {
      setNotification({ type: 'error', message: 'Nomor surat pesanan wajib diisi!' });
      return;
    }
    if (!formData.supplierName.trim()) {
      setNotification({ type: 'error', message: 'Nama supplier / rekanan tujuan wajib diisi!' });
      return;
    }


    if (currentId) {
      // Update
      const res = updatePurchaseOrder(currentId, formData);
      if (res.success) {
        setNotification({
          type: 'success',
          message: `Surat Pesanan No. ${formData.nomorSurat} berhasil diperbarui!`,
        });
      }
    } else {
      // Add new
      const res = addPurchaseOrder(formData);
      if (res.success) {
        setCurrentId(res.id);
        setNotification({
          type: 'success',
          message: `Surat Pesanan No. ${formData.nomorSurat} berhasil disimpan!`,
        });
      }
    }
  };

  // Create New Letter
  const handleCreateNew = () => {
    setCurrentId(null);
    setFormData({
      ...DEFAULT_PURCHASE_ORDER_FORM,
      nomorSurat: `400.7.18.3/${String((purchaseOrders || []).length + 1).padStart(3, '0')}/LABKESDA/I/2026`,
      tanggal: new Date().toISOString().split('T')[0],
      tanggalFormatted: formatIndonesianDate(new Date().toISOString().split('T')[0]),
    });
    setActiveSubTab('editor');
    setNotification({
      type: 'success',
      message: 'Formulir Surat Pesanan Baru telah disiapkan.',
    });
  };

  // Load Existing Letter for Editing
  const handleLoadLetter = (po: PurchaseOrderLetter) => {
    setCurrentId(po.id);
    setFormData(normalizePOData(po));
    setActiveSubTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete Letter
  const handleDeleteLetter = (id: string, nomor: string) => {
    if (window.confirm(`Yakin ingin menghapus Surat Pesanan No. ${nomor}?`)) {
      const res = deletePurchaseOrder(id);
      if (res.success) {
        setNotification({ type: 'success', message: `Surat Pesanan No. ${nomor} berhasil dihapus.` });
        if (currentId === id) {
          if (purchaseOrders.length > 1) {
            const next = purchaseOrders.find((p) => p.id !== id);
            if (next) handleLoadLetter(next);
          } else {
            handleCreateNew();
          }
        }
      }
    }
  };

  // Direct Print
  const handlePrint = () => {
    window.print();
  };

  // Export to Excel
  const handleExportExcel = () => {
    exportToExcel({
      fileName: `Surat_Pesanan_${formData.nomorSurat.replace(/[/\\?%*:|"<>]/g, '_')}`,
      sheetName: 'Surat Pesanan',
      reportTitle: `SURAT PESANAN - ${formData.nomorSurat}`,
      subtitle: `Kepada: ${formData.namaSupplier || formData.supplierName} | Tanggal: ${formData.tanggalFormatted}`,
      headers: [
        'No',
        'Nama Barang',
        'Merk',
        'Volume',
        'Banyaknya',
        'Satuan',
        'Harga Satuan (Rp)',
        'Jumlah Harga (Rp)',
      ],
      data: formData.items.map((item, idx) => [
        idx + 1,
        item.namaBarang,
        item.merk || '-',
        item.volume || '-',
        item.banyaknya,
        item.satuan,
        item.hargaSatuan,
        item.jumlahHarga,
      ]),
      columnWidths: [6, 32, 18, 16, 12, 12, 18, 20],
    });
  };

  // Total summary calculation
  const currentItems = formData?.items || [];
  const totalNilaiPesanan = currentItems.reduce(
    (sum, item) => sum + (Number(item.jumlahHarga) || 0),
    0
  );
  const totalBanyaknya = currentItems.reduce(
    (sum, item) => sum + (Number(item.banyaknya) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* =========================================================================
          PRINT ONLY STYLES
         ========================================================================= */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #surat-pesanan-print-area, #surat-pesanan-print-area * {
            visibility: visible;
          }
          #surat-pesanan-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 1.5cm 1.5cm 1.5cm 1.5cm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* TOP HEADER / ACTION BAR (NO PRINT) */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <ShoppingCart className="w-4 h-4" />
            Dokumen Resmi Pengadaan & Pesanan
          </div>
          <h1 className="text-xl font-bold text-slate-800">Surat Pesanan (PO)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Format resmi surat pesanan pengadaan reagen/BMHP ke rekanan supplier Labkesda
            Kabupaten Tasikmalaya
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sub Tab Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('editor')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === 'editor'
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editor & Cetak
            </button>
            <button
              onClick={() => setActiveSubTab('list')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === 'list'
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              Daftar PO ({purchaseOrders.length})
            </button>
          </div>

          <button
            onClick={handleCreateNew}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            title="Buat Surat Pesanan Baru"
          >
            <Plus className="w-4 h-4" />
            PO Baru
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            title="Simpan Dokumen"
          >
            <Save className="w-4 h-4" />
            Simpan Dokumen
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            title="Cetak Langsung / Unduh PDF"
          >
            <Printer className="w-4 h-4" />
            Cetak / PDF
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Ekspor data pesanan ke Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* NOTIFICATION BANNER */}
      {notification && (
        <div
          className={`no-print p-4 rounded-xl text-xs flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUB-VIEW 1: LIST OF SAVED PURCHASE ORDERS */}
      {activeSubTab === 'list' && (
        <div className="no-print bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-600" />
              Arsip Surat Pesanan (PO) Terdaftar
            </h2>
            <span className="text-xs text-slate-400">Total {purchaseOrders.length} Dokumen</span>
          </div>

          {purchaseOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">Belum ada Surat Pesanan yang tersimpan.</p>
              <button
                onClick={handleCreateNew}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Buat Surat Pesanan Sekarang
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3">Nomor Surat</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Kepada (Supplier)</th>
                    <th className="p-3 text-center">Jumlah Item</th>
                    <th className="p-3 text-right">Total Nilai (Rp)</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseOrders.map((po, idx) => {
                    const totalPO = po.items.reduce(
                      (acc, it) => acc + (Number(it.jumlahHarga) || 0),
                      0
                    );
                    return (
                      <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">
                          {po.nomorSurat}
                        </td>
                        <td className="p-3 text-slate-600">
                          {po.tanggalFormatted || po.tanggal}
                        </td>
                        <td className="p-3 font-medium text-slate-800">
                          <div>{po.supplierName}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">
                            {po.supplierAddress}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold">
                            {po.items.length} Barang
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800">
                          Rp {totalPO.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              po.status === 'Selesai'
                                ? 'bg-emerald-100 text-emerald-800'
                                : po.status === 'Dikirim ke Supplier'
                                ? 'bg-indigo-100 text-indigo-800'
                                : po.status === 'Diterbitkan'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {po.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleLoadLetter(po)}
                              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                              title="Buka & Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                handleLoadLetter(po);
                                setTimeout(() => window.print(), 300);
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                              title="Cetak Dokumen"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLetter(po.id, po.nomorSurat)}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: EDITOR + LIVE DOCUMENT PREVIEW */}
      {activeSubTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* =========================================================================
              LEFT COLUMN: FORM EDITOR CONTROLS (NO PRINT)
             ========================================================================= */}
          <div className="no-print lg:col-span-5 space-y-5">
            {/* Summary KPI Widget */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                    Total Nilai Surat Pesanan
                  </span>
                  <div className="text-2xl font-black font-mono tracking-tight mt-0.5">
                    Rp {totalNilaiPesanan.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                <div>
                  <span className="text-blue-200 text-[11px]">Jumlah Item Barang:</span>
                  <p className="font-bold">{formData.items.length} Macam Barang</p>
                </div>
                <div>
                  <span className="text-blue-200 text-[11px]">Total Volume Fisik:</span>
                  <p className="font-bold">{totalBanyaknya} Qty Total</p>
                </div>
              </div>
            </div>

            {/* Section 1: Header & Nomor Surat */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  1. Nomor & Tanggal Surat Pesanan
                </h3>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Wajib
                </span>
              </div>

              <div className="space-y-3">
                {/* Nomor Surat Pesanan */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nomor Surat Pesanan:
                  </label>
                  <input
                    type="text"
                    value={formData.nomorSurat}
                    onChange={(e) => setFormData({ ...formData, nomorSurat: e.target.value })}
                    placeholder="400.7.18.3/006/LABKESDA/I/2026"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono font-bold text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Format resmi: 400.7.18.3/[Nomor]/LABKESDA/I/2026
                  </p>
                </div>

                {/* Tempat & Tanggal */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tempat:
                    </label>
                    <input
                      type="text"
                      value={formData.tempat}
                      onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                      placeholder="Tasikmalaya"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pilih Tanggal:
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Teks Tanggal Terformat */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Teks Tanggal Surat (Tercetak di PO):
                  </label>
                  <input
                    type="text"
                    value={formData.tanggalFormatted}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggalFormatted: e.target.value })
                    }
                    placeholder="24 Februari 2026"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Master Data Supplier / Pemasok Rekanan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  2. Hubungkan ke Master Supplier / Rekanan
                </h3>
                <span className="text-[10px] font-medium text-slate-400">Pemasok</span>
              </div>

              <div className="space-y-3">
                {/* Master Supplier Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Pilih Dari Master Data Pemasok:
                  </label>
                  <select
                    value={formData.supplierId || ''}
                    onChange={(e) => handleSupplierSelect(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-800"
                  >
                    <option value="">-- Pilih Supplier Master (Otomatis Isi) --</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} {sup.city ? `(${sup.city})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Memilih supplier akan otomatis mengisi nama dan alamat surat pesanan.
                  </p>
                </div>

                {/* Nama Rekanan / Supplier */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Kepada : Nama Supplier / Rekanan:
                  </label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supplierName: e.target.value,
                        namaSupplier: e.target.value,
                      })
                    }
                    placeholder="PT. Mata Pensil Globalindo"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-slate-800"
                  />
                </div>

                {/* Alamat Supplier */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Alamat Lengkap Rekanan / Supplier:
                  </label>
                  <textarea
                    rows={2}
                    value={formData.supplierAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supplierAddress: e.target.value,
                        alamatSupplier: e.target.value,
                      })
                    }
                    placeholder="Gedung Wahid 27. Jl. KH. Wahid Hasyim no.27. Menteng. Jakarta Pusat."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
                  />
                </div>

                {/* Paragraf Pengantar */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Kalimat Narasi Pengantar Pesanan:
                  </label>
                  <textarea
                    rows={3}
                    value={formData.narasiPengantar}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        narasiPengantar: e.target.value,
                        paragrafPengantar: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Syarat-syarat & Penandatangan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  3. Syarat & Pejabat Penandatangan
                </h3>
                <span className="text-[10px] font-medium text-slate-400">Kepala UPTD</span>
              </div>

              <div className="space-y-3">
                {/* Batas Waktu Penyerahan (Klausul 4) */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Batas Waktu Penyerahan Barang:
                  </label>
                  <input
                    type="text"
                    value={formData.batasWaktuPenyerahan}
                    onChange={(e) => handleBatasWaktuChange(e.target.value)}
                    placeholder="Tanggal 3 Maret 2026"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Otomatis tercatat pada butir Syarat-syarat nomor 4.
                  </p>
                </div>

                {/* Nama Kepala UPTD */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nama Penandatangan (beserta gelar):
                  </label>
                  <input
                    type="text"
                    value={formData.namaPenandatangan}
                    onChange={(e) =>
                      setFormData({ ...formData, namaPenandatangan: e.target.value })
                    }
                    placeholder="T. ALDYANSYAH, ST. MM"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-slate-800"
                  />
                </div>

                {/* NIP Penandatangan */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    NIP Penandatangan:
                  </label>
                  <input
                    type="text"
                    value={formData.nipPenandatangan}
                    onChange={(e) =>
                      setFormData({ ...formData, nipPenandatangan: e.target.value })
                    }
                    placeholder="19781125 200501 1 008"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono font-medium"
                  />
                </div>

                {/* Status Surat Pesanan */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Status Surat:
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as PurchaseOrderStatus,
                        })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                    >
                      <option value="Draf">Draf</option>
                      <option value="Diterbitkan">Diterbitkan</option>
                      <option value="Dikirim ke Supplier">Dikirim ke Supplier</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Dibatalkan">Dibatalkan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Catatan Internal:
                    </label>
                    <input
                      type="text"
                      value={formData.catatanInternal || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, catatanInternal: e.target.value })
                      }
                      placeholder="Catatan..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Edit Daftar Barang 8 Kolom (Form Accordion) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-amber-600" />
                  4. Kelola Item Barang Pesanan ({formData.items.length})
                </h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsItemPickerOpen(true)}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <PackagePlus className="w-3.5 h-3.5" />
                    + Master Barang
                  </button>
                  <button
                    onClick={handleAddItemRow}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Manual
                  </button>
                </div>
              </div>

              {/* Items List in Editor */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {formData.items.map((row, idx) => (
                  <div
                    key={row.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 relative group hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1 border-b border-slate-200/50">
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        Barang #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-blue-700 font-extrabold">
                          Rp {(Number(row.jumlahHarga) || 0).toLocaleString('id-ID')}
                        </span>
                        <button
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Nama Barang */}
                    <div>
                      <input
                        type="text"
                        value={row.namaBarang}
                        onChange={(e) => handleItemChange(idx, 'namaBarang', e.target.value)}
                        placeholder="Nama Barang (misal: Reagen Hematologi Diluent)"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800"
                      />
                    </div>

                    {/* Merk & Volume */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500">Merk:</label>
                        <input
                          type="text"
                          value={row.merk}
                          onChange={(e) => handleItemChange(idx, 'merk', e.target.value)}
                          placeholder="Merk (Mindray, dsb)"
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Volume:</label>
                        <input
                          type="text"
                          value={row.volume}
                          onChange={(e) => handleItemChange(idx, 'volume', e.target.value)}
                          placeholder="Volume (20 Liter, dsb)"
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>

                    {/* Banyaknya, Satuan, Harga Satuan */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500">Banyaknya:</label>
                        <input
                          type="number"
                          min="1"
                          value={row.banyaknya}
                          onChange={(e) =>
                            handleItemChange(idx, 'banyaknya', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Satuan:</label>
                        <input
                          type="text"
                          value={row.satuan}
                          onChange={(e) => handleItemChange(idx, 'satuan', e.target.value)}
                          placeholder="Dus / Kit / Pack"
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">
                          Harga Satuan (Rp):
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={row.hargaSatuan}
                          onChange={(e) =>
                            handleItemChange(idx, 'hargaSatuan', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-mono font-medium"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: LIVE DOCUMENT PREVIEW (PRINT AREA REPLICATING IMAGE)
             ========================================================================= */}
          <div className="lg:col-span-7">
            {/* Header info bar */}
            <div className="no-print mb-3 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Eye className="w-4 h-4 text-blue-600" />
                Pratinjau Resmi Kertas Surat Pesanan (A4 Standar Kedinasan)
              </span>
              <button
                onClick={handlePrint}
                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Lembar Ini
              </button>
            </div>

            {/* Document Paper Container */}
            <div className="bg-slate-200/80 p-2 md:p-6 rounded-2xl overflow-x-auto shadow-inner">
              <div
                id="surat-pesanan-print-area"
                className="bg-white mx-auto shadow-xl transition-all"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  padding: '20mm 20mm 20mm 20mm',
                  boxSizing: 'border-box',
                  fontFamily: "'Times New Roman', Times, serif",
                  color: '#000000',
                  fontSize: '12pt',
                  lineHeight: '1.25',
                }}
              >
                {/* 1. KOP SURAT RESMI UPTD LABORATORIUM KESEHATAN DAERAH KABUPATEN TASIKMALAYA */}
                <div className="relative pb-2 mb-2">
                  <div className="flex items-center justify-between gap-3">
                    {/* Logo Kabupaten Tasikmalaya */}
                    <div className="w-24 shrink-0 flex items-center justify-center">
                      <img
                        src="/assets/aistudio/Tasikmalaya_Regency_Emblem_-_Colored_-_2048x2048_-_zonalogo.com_fedd3e15.png"
                        alt="Lambang Kabupaten Tasikmalaya"
                        className="w-20 h-24 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/logo-tasikmalaya.png';
                        }}
                      />
                    </div>

                    {/* Teks Kop Surat Resmi */}
                    <div className="flex-1 text-center font-serif leading-tight">
                      <h2 className="text-[14.5px] font-bold tracking-wide uppercase">
                        {formData.kopPemda}
                      </h2>
                      <h2 className="text-[15.5px] font-extrabold tracking-wide uppercase mt-0.5">
                        {formData.kopDinas}
                      </h2>
                      <h1 className="text-[16.5px] font-black tracking-wide uppercase mt-0.5">
                        {formData.kopUnit}
                      </h1>
                      <p className="text-[11.5px] mt-0.5 font-serif">
                        {formData.kopAlamat}
                      </p>
                      <p className="text-[11px] font-serif">
                        <span className="underline">{formData.kopKontak}</span>
                      </p>
                      <p className="text-[11px] font-serif">{formData.kopKodePos}</p>
                    </div>

                    {/* Right spacer for symmetrical centering */}
                    <div className="w-24 shrink-0"></div>
                  </div>

                  {/* Garis Pembatas Kop Surat Tunggal Tebal sesuai Format Dokumen Resmi */}
                  <div className="mt-3 border-t-[3.5px] border-black"></div>
                </div>

                {/* 2. JUDUL DOKUMEN & NOMOR */}
                <div className="text-center my-4">
                  <h2 className="text-[15px] font-bold tracking-[0.25em] uppercase underline">
                    SURAT PESANAN
                  </h2>
                  <p className="text-[12px] font-bold font-serif mt-1">
                    NOMOR: {formData.nomorSurat}
                  </p>
                </div>

                {/* 3. KEPADA SUPPLIER & NARASI PENGANTAR */}
                <div className="space-y-2.5 mt-4 mb-4 text-[12px] font-serif">
                  <div className="flex items-start">
                    <span className="w-16 shrink-0 font-serif">Kepada</span>
                    <span className="w-3 shrink-0 font-serif">:</span>
                    <span className="flex-1 font-serif leading-snug">
                      <strong className="font-bold">{formData.supplierName}</strong>{' '}
                      {formData.supplierAddress}
                    </span>
                  </div>

                  <p className="text-justify leading-relaxed font-serif indent-0 mt-2">
                    {formData.narasiPengantar}
                  </p>
                </div>

                {/* 4. TABEL 8 KOLOM BARANG PESANAN DENGAN SUB-HEADER ANGKA 1-8 */}
                <div className="mb-4">
                  <table className="w-full border-collapse border border-black text-[11px]">
                    <thead>
                      {/* Baris 1: Judul Kolom */}
                      <tr className="bg-transparent font-serif">
                        <th className="border border-black px-1.5 py-1.5 text-center w-8 font-bold">
                          No
                        </th>
                        <th className="border border-black px-2 py-1.5 text-center font-bold">
                          Nama Barang
                        </th>
                        <th className="border border-black px-2 py-1.5 text-center w-24 font-bold">
                          Merk
                        </th>
                        <th className="border border-black px-2 py-1.5 text-center w-20 font-bold">
                          Volume
                        </th>
                        <th className="border border-black px-2 py-1.5 text-center w-20 font-bold">
                          Banyaknya
                        </th>
                        <th className="border border-black px-2 py-1.5 text-center w-16 font-bold">
                          Satuan
                        </th>
                        <th className="border border-black px-2 py-1.5 text-center w-24 font-bold">
                          Harga Satuan
                        </th>
                        <th className="border border-black px-2 py-1.5 text-center w-26 font-bold">
                          Jumlah Harga
                        </th>
                      </tr>

                      {/* Baris 2: Nomor Kolom Sesuai Format Kedinasan (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) */}
                      <tr className="bg-[#d9e1f2]/70 text-center font-serif italic text-[10.5px]">
                        <th className="border border-black py-0.5">1</th>
                        <th className="border border-black py-0.5">2</th>
                        <th className="border border-black py-0.5">3</th>
                        <th className="border border-black py-0.5">4</th>
                        <th className="border border-black py-0.5">5</th>
                        <th className="border border-black py-0.5">6</th>
                        <th className="border border-black py-0.5">7</th>
                        <th className="border border-black py-0.5">8</th>
                      </tr>
                    </thead>

                    <tbody>
                      {/* Render baris barang yang diisi */}
                      {formData.items.map((row, idx) => (
                        <tr key={row.id || idx} className="font-serif">
                          <td className="border border-black px-1.5 py-2.5 text-center">
                            {idx + 1}
                          </td>
                          <td className="border border-black px-2 py-2.5 font-medium">
                            {row.namaBarang || ''}
                          </td>
                          <td className="border border-black px-2 py-2.5 text-center">
                            {row.merk || ''}
                          </td>
                          <td className="border border-black px-2 py-2.5 text-center">
                            {row.volume || ''}
                          </td>
                          <td className="border border-black px-2 py-2.5 text-center font-semibold">
                            {row.banyaknya ? row.banyaknya : ''}
                          </td>
                          <td className="border border-black px-2 py-2.5 text-center">
                            {row.satuan || ''}
                          </td>
                          <td className="border border-black px-2 py-2.5 text-right font-serif">
                            {row.hargaSatuan
                              ? `Rp ${Number(row.hargaSatuan).toLocaleString('id-ID')}`
                              : ''}
                          </td>
                          <td className="border border-black px-2 py-2.5 text-right font-serif font-bold">
                            {row.jumlahHarga
                              ? `Rp ${Number(row.jumlahHarga).toLocaleString('id-ID')}`
                              : ''}
                          </td>
                        </tr>
                      ))}

                      {/* Baris Pelengkap Kosong (Minimal 5 Baris total seperti pada format template resmi) */}
                      {formData.items.length < 5 &&
                        Array.from({ length: 5 - formData.items.length }).map((_, emptyIdx) => (
                          <tr key={`empty-${emptyIdx}`} className="font-serif">
                            <td className="border border-black px-1.5 py-2.5 text-center">
                              {formData.items.length + emptyIdx + 1}
                            </td>
                            <td className="border border-black px-2 py-2.5"></td>
                            <td className="border border-black px-2 py-2.5"></td>
                            <td className="border border-black px-2 py-2.5"></td>
                            <td className="border border-black px-2 py-2.5"></td>
                            <td className="border border-black px-2 py-2.5"></td>
                            <td className="border border-black px-2 py-2.5"></td>
                            <td className="border border-black px-2 py-2.5"></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* 5. SYARAT-SYARAT (KIRI) & TANDA TANGAN KEPALA UPTD (KANAN) */}
                <div className="grid grid-cols-12 gap-4 mt-6 text-[11.5px] font-serif items-start">
                  {/* Kolom Kiri: Syarat-syarat Pengadaan */}
                  <div className="col-span-7 space-y-1">
                    <p className="font-bold underline">Syarat-syarat :</p>
                    <ol className="list-decimal pl-5 space-y-0.5 text-justify leading-snug">
                      {(
                        formData.syaratSyarat || [
                          formData.syarat1 || 'Harga barang sudah termasuk PPN',
                          formData.syarat2 || 'Barang harus sesuai dengan pesanan',
                          formData.syarat3 ||
                            'Pembayaran dilaksanakan setelah barang diterima dengan baik',
                          formData.syarat4 ||
                            `Batas waktu penyerahan selambat-lambatnya ${formData.batasWaktuPenyerahan || 'Tanggal 3 Maret 2026'}.`,
                        ]
                      ).map((syarat, sIdx) => (
                        <li key={sIdx}>{syarat}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Kolom Kanan: Tempat, Tanggal & Tanda Tangan Kepala UPTD */}
                  <div className="col-span-5 text-center space-y-1 ml-auto w-full">
                    <p className="font-serif">
                      {formData.tempat}, {formData.tanggalFormatted}
                    </p>
                    <div className="font-serif leading-tight">
                      <p>Kepala UPTD Labkesda Kabupaten</p>
                      <p>Tasikmalaya</p>
                    </div>

                    {/* Ruang Tanda Tangan & Cap Kedinasan */}
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-[10px] text-gray-300 italic font-sans no-print">
                        (Tanda Tangan & Stempel)
                      </span>
                    </div>

                    <p className="font-bold font-serif underline text-[12.5px] tracking-wide">
                      {formData.namaPenandatangan}
                    </p>
                    <p className="font-serif text-[11px]">
                      NIP. {formData.nipPenandatangan}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PICKER MASTER BARANG INVENTARIS
         ========================================================================= */}
      {isItemPickerOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Pilih Barang dari Master Inventaris Labkesda
                </h3>
              </div>
              <button
                onClick={() => setIsItemPickerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 bg-slate-50 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Cari kode barang, nama reagen, merk, atau kategori..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Items List */}
            <div className="overflow-y-auto p-3 divide-y divide-slate-100 flex-1">
              {masterItems
                .filter(
                  (item) =>
                    item.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                    item.code.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                    (item.category &&
                      item.category.toLowerCase().includes(pickerSearch.toLowerCase()))
                )
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-slate-50 flex items-center justify-between rounded-xl transition-colors gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {item.code}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                        <span>Kategori: {item.category}</span>
                        <span>Stok Saat Ini: {item.currentStock} {item.unit}</span>
                        {item.unitPrice && (
                          <span className="font-semibold text-emerald-700">
                            Harga Satuan: Rp {item.unitPrice.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectMasterItem(item)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Pilih
                    </button>
                  </div>
                ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsItemPickerOpen(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
