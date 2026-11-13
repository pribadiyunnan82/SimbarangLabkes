import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { OrderRequestLetter, OrderRequestItem, OrderRequestStatus } from '../../types/inventory';
import {
  FileText,
  Printer,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  Send,
  Check,
  ChevronDown,
  Search,
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
} from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';

const DEFAULT_FORM: Omit<OrderRequestLetter, 'id' | 'createdAt' | 'updatedAt'> = {
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
  paragrafPembuka:
    'Untuk memenuhi kebutuhan pelayanan pada pasien, bersama ini kami sampaikan Usulan Kebutuhan bahan habis pakai Laboratorium. Adapun yang kami usulkan sebagai berikut',
  items: [
    {
      id: 'item-1',
      namaBahan: 'Reagen Hematologi Diluent 3-Diff',
      merkReagen: 'Mindray',
      kemasanReagen: '20 Liter / Dus',
      jumlah: '2 Dus',
    },
    {
      id: 'item-2',
      namaBahan: 'Reagen Glukosa Darah GOD-PAP',
      merkReagen: 'Human Diagnostics',
      kemasanReagen: 'Kit 4 x 100 mL',
      jumlah: '3 Kit',
    },
    {
      id: 'item-3',
      namaBahan: 'Tabung Vacutainer K3 EDTA 3 mL',
      merkReagen: 'Vaculab',
      kemasanReagen: '100 Pcs / Pack',
      jumlah: '5 Pack',
    },
    {
      id: 'item-4',
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

export const OrderRequestLetterView: React.FC = () => {
  const {
    orderRequests,
    addOrderRequest,
    updateOrderRequest,
    deleteOrderRequest,
    items: masterItems,
    currentUser,
  } = useInventory();

  // Active sub-tab: 'editor' | 'list'
  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'list'>('editor');

  // Form State
  const [currentId, setCurrentId] = useState<string | null>(
    orderRequests.length > 0 ? orderRequests[0].id : null
  );
  const [formData, setFormData] = useState<Omit<OrderRequestLetter, 'id' | 'createdAt' | 'updatedAt'>>(
    () => {
      if (orderRequests.length > 0) {
        const { id, createdAt, updatedAt, ...rest } = orderRequests[0];
        return rest;
      }
      return DEFAULT_FORM;
    }
  );

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Modal for selecting from Master Inventory
  const [isItemPickerOpen, setIsItemPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Helper to format ISO date to Indonesian string (e.g., 2026-02-24 -> 24 Februari 2026)
  const formatIndonesianDate = (isoDate: string): string => {
    try {
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthIdx = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
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

  // Add Item Row
  const handleAddItemRow = () => {
    const newRow: OrderRequestItem = {
      id: 'row-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      namaBahan: '',
      merkReagen: '',
      kemasanReagen: '',
      jumlah: '1',
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newRow],
    }));
  };

  // Remove Item Row
  const handleRemoveItemRow = (id: string) => {
    if (formData.items.length <= 1) {
      alert('Minimal harus ada 1 baris bahan dalam surat pengajuan.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  // Update Item Row
  const handleItemRowChange = (id: string, field: keyof OrderRequestItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  // Select item from master inventory
  const handleSelectMasterItem = (masterItem: any) => {
    const newRow: OrderRequestItem = {
      id: 'row-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      itemId: masterItem.id,
      namaBahan: masterItem.name,
      merkReagen: masterItem.manufacturer || 'Standar Lab',
      kemasanReagen: masterItem.storageCondition || `${masterItem.unitId || 'Pcs'}`,
      jumlah: `${masterItem.minimumStock || 1}`,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newRow],
    }));
    setIsItemPickerOpen(false);
    setPickerSearch('');
  };

  // Save / Submit letter
  const handleSaveLetter = () => {
    if (!formData.nomor.trim()) {
      alert('Nomor surat wajib diisi.');
      return;
    }
    if (!formData.namaPemohon.trim()) {
      alert('Nama pemohon wajib diisi.');
      return;
    }

    if (currentId) {
      updateOrderRequest(currentId, formData);
      setNotification({
        type: 'success',
        message: `Surat Pengajuan No. ${formData.nomor} berhasil diperbarui!`,
      });
    } else {
      const res = addOrderRequest(formData);
      if (res.success) {
        setCurrentId(res.id);
        setNotification({
          type: 'success',
          message: `Surat Pengajuan No. ${formData.nomor} berhasil disimpan dan dicatat!`,
        });
      }
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // Create new blank letter
  const handleCreateNew = () => {
    setCurrentId(null);
    setFormData({
      ...DEFAULT_FORM,
      nomor: `0${orderRequests.length + 25}/SP/Labkesda/2026`,
      tanggal: new Date().toISOString().split('T')[0],
      tanggalFormatted: formatIndonesianDate(new Date().toISOString().split('T')[0]),
      items: [
        {
          id: 'item-' + Date.now(),
          namaBahan: '',
          merkReagen: '',
          kemasanReagen: '',
          jumlah: '',
        },
      ],
    });
    setActiveSubTab('editor');
    setNotification({
      type: 'success',
      message: 'Formulir surat baru siap diisi.',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load existing letter into editor
  const handleLoadLetter = (letter: OrderRequestLetter) => {
    setCurrentId(letter.id);
    const { id, createdAt, updatedAt, ...rest } = letter;
    setFormData(rest);
    setActiveSubTab('editor');
  };

  // Delete letter
  const handleDeleteLetter = (id: string, nomor: string) => {
    if (confirm(`Hapus surat pengajuan No. "${nomor}"?`)) {
      deleteOrderRequest(id);
      if (currentId === id) {
        handleCreateNew();
      }
    }
  };

  // Print function (opens browser print dialog for #print-letter-document)
  const handlePrint = () => {
    window.print();
  };

  // Export items table to Excel
  const handleExportExcel = () => {
    const headers = ['No', 'Nama Bahan', 'Merk Reagen', 'Kemasan Reagen', 'Jumlah'];
    const rows = formData.items.map((item, index) => [
      index + 1,
      item.namaBahan,
      item.merkReagen,
      item.kemasanReagen,
      item.jumlah,
    ]);

    exportToExcel({
      fileName: `Surat_Pengajuan_${formData.nomor.replace(/[^a-zA-Z0-9]/g, '_')}`,
      sheetName: 'Usulan Bahan',
      reportTitle: 'SURAT USULAN PERMOHONAN ALAT & BAHAN HABIS PAKAI',
      subtitle: `Nomor: ${formData.nomor} • Tanggal: ${formData.tanggalFormatted} • Pemohon: ${formData.namaPemohon} (NIP. ${formData.nipPemohon})`,
      headers,
      data: rows,
      columnWidths: [6, 35, 20, 20, 15],
    });
  };

  // Filtered master items for picker
  const filteredMasterItems = masterItems.filter((i) =>
    i.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    i.code.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switches (Screen only) */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                Surat Pengajuan Pesanan (Permohonan Alat Habis Pakai)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                UPTD Labkesda Kabupaten Tasikmalaya • Format Cetak Kedinasan Resmi
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Print button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Cetak dokumen resmi (Ctrl+P)"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Cetak / Cetak PDF</span>
          </button>

          {/* Export Excel button */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Ekspor daftar bahan usulan ke Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Ekspor Excel</span>
          </button>

          {/* Save button */}
          <button
            onClick={handleSaveLetter}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Surat</span>
          </button>

          {/* Create new button */}
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Surat Baru</span>
          </button>
        </div>
      </div>

      {/* Tabs: Editor & Pratinjau vs Riwayat Surat (Screen only) */}
      <div className="no-print flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('editor')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'editor'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Formulir & Pratinjau Surat Langsung</span>
        </button>

        <button
          onClick={() => setActiveSubTab('list')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'list'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Daftar Riwayat Surat Pengajuan</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
            {orderRequests.length}
          </span>
        </button>
      </div>

      {/* Alert Notification */}
      {notification && (
        <div
          className={`no-print p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* SUB-TAB 1: EDITOR & PRATINJAU BERSANDINGAN */}
      {activeSubTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: FORMULIR PENGISIAN PARAMETER SURAT (Screen only) */}
          <div className="no-print lg:col-span-5 space-y-5">
            {/* Card 1: Data Pokok Surat (Nomor, Lampiran, Perihal, Tempat & Tanggal) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  1. Informasi Surat & Tanggal
                </h3>
                <span className="text-[10px] font-medium text-slate-400">Wajib diisi</span>
              </div>

              <div className="space-y-3">
                {/* Nomor Surat */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nomor Surat:
                  </label>
                  <input
                    type="text"
                    value={formData.nomor}
                    onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
                    placeholder="/SP...... /Labkesda/2026"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Contoh format: 024/SP/Labkesda/2026
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Lampiran */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Lampiran:
                    </label>
                    <input
                      type="text"
                      value={formData.lampiran}
                      onChange={(e) => setFormData({ ...formData, lampiran: e.target.value })}
                      placeholder="-"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Hal / Perihal */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Hal / Perihal:
                    </label>
                    <input
                      type="text"
                      value={formData.perihal}
                      onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                      placeholder="Permohonan Alat Habis Pakai"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Tempat & Tanggal Permintaan */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tempat Permintaan:
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

                {/* Tampilan Tanggal Masehi & Tanggal Hijriah */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Teks Tanggal Masehi:
                    </label>
                    <input
                      type="text"
                      value={formData.tanggalFormatted}
                      onChange={(e) =>
                        setFormData({ ...formData, tanggalFormatted: e.target.value })
                      }
                      placeholder="24 Februari 2026"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Teks Tanggal Hijriah:
                    </label>
                    <input
                      type="text"
                      value={formData.tanggalHijriah || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, tanggalHijriah: e.target.value })
                      }
                      placeholder="06 Ramadhan 1447 H"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden italic"
                    />
                  </div>
                </div>

                {/* Tujuan Surat */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <p className="text-[11px] font-bold text-slate-700">Tujuan Surat:</p>
                  <div>
                    <input
                      type="text"
                      value={formData.tujuanJabatan}
                      onChange={(e) => setFormData({ ...formData, tujuanJabatan: e.target.value })}
                      placeholder="Yth. Bendahara Barang UPTD Labkesda"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.tujuanInstansi}
                      onChange={(e) =>
                        setFormData({ ...formData, tujuanInstansi: e.target.value })
                      }
                      placeholder="Kabupaten Tasikmalaya"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Identitas Pemohon & NIP */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  2. Nama & NIP Pemohon
                </h3>
                <span className="text-[10px] font-medium text-slate-400">Tanda Tangan</span>
              </div>

              <div className="space-y-3">
                {/* Nama Pemohon */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nama Pemohon (beserta gelar):
                  </label>
                  <input
                    type="text"
                    value={formData.namaPemohon}
                    onChange={(e) => setFormData({ ...formData, namaPemohon: e.target.value })}
                    placeholder="Nurjanah, A.Md. AK"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-slate-800"
                  />
                </div>

                {/* NIP Pemohon */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    NIP Pemohon:
                  </label>
                  <input
                    type="text"
                    value={formData.nipPemohon}
                    onChange={(e) => setFormData({ ...formData, nipPemohon: e.target.value })}
                    placeholder="198810202024212022"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Otomatis tercetak di surat: NIP. {formData.nipPemohon}
                  </p>
                </div>

                {/* Jabatan TTD */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Jabatan TTD:
                    </label>
                    <input
                      type="text"
                      value={formData.jabatanPemohon || 'Pemohon'}
                      onChange={(e) =>
                        setFormData({ ...formData, jabatanPemohon: e.target.value })
                      }
                      placeholder="Pemohon"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Status Pengajuan:
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as OrderRequestStatus,
                        })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                    >
                      <option value="Draf">Draf</option>
                      <option value="Diajukan">Diajukan</option>
                      <option value="Disetujui">Disetujui</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>
                </div>

                {/* Shortcut quick buttons */}
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        namaPemohon: currentUser.name,
                        nipPemohon: currentUser.username || prev.nipPemohon,
                      }));
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                  >
                    Gunakan Nama Akun Saya ({currentUser.name})
                  </button>
                )}
              </div>
            </div>

            {/* Card 3: Daftar Bahan & Reagen */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-600" />
                  3. Tabel Usulan Kebutuhan Bahan
                </h3>
                <span className="text-[10px] font-bold text-slate-500">
                  {formData.items.length} item
                </span>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <button
                        onClick={() => handleRemoveItemRow(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                        title="Hapus baris ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={item.namaBahan}
                        onChange={(e) => handleItemRowChange(item.id, 'namaBahan', e.target.value)}
                        placeholder="Nama Bahan / Reagen Laboratorium..."
                        className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <input
                          type="text"
                          value={item.merkReagen}
                          onChange={(e) =>
                            handleItemRowChange(item.id, 'merkReagen', e.target.value)
                          }
                          placeholder="Merk Reagen"
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={item.kemasanReagen}
                          onChange={(e) =>
                            handleItemRowChange(item.id, 'kemasanReagen', e.target.value)
                          }
                          placeholder="Kemasan Reagen"
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={item.jumlah}
                          onChange={(e) => handleItemRowChange(item.id, 'jumlah', e.target.value)}
                          placeholder="Jumlah"
                          className="w-full px-2 py-1 text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Row Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex-1 py-2 px-3 border border-dashed border-blue-400 hover:border-blue-600 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Baris Baru
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsItemPickerOpen(true)}
                    className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Pilih item dari data master barang inventaris"
                  >
                    <PackagePlus className="w-3.5 h-3.5" />
                    Dari Master Barang
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE LETTER PREVIEW & PRINT DOCUMENT (What gets printed!) */}
          <div className="lg:col-span-7">
            <div className="bg-slate-200/80 p-2 md:p-6 rounded-2xl overflow-x-auto shadow-inner">
              <div className="no-print flex items-center justify-between pb-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Pratinjau Kertas Cetak Resmi (A4 Standar Kedinasan)
                </span>
                <span className="text-[11px] bg-white px-2.5 py-1 rounded-lg border border-slate-300 font-semibold text-slate-600 shadow-xs">
                  Sesuai Format Surat Pengajuan
                </span>
              </div>

              {/* THE OFFICIAL LETTER PAPER (Strictly styled according to user's uploaded image image_79001be8.png) */}
              <div
                id="print-letter-document"
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
                {/* 1. KOP SURAT RESMI PEMKAB TASIKMALAYA */}
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

                    {/* Teks Kop Surat */}
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
                      <p className="text-[11.5px] italic mt-1 font-serif">
                        {formData.kopAlamat}
                      </p>
                      <p className="text-[11px] font-serif">
                        {formData.kopKontak}
                      </p>
                    </div>

                    {/* Spacer for symmetry */}
                    <div className="w-24 shrink-0"></div>
                  </div>

                  {/* Garis Pembatas Kop Surat Tunggal Tebal sesuai Dokumen Asli */}
                  <div className="mt-3 border-t-[3px] border-black"></div>
                </div>

                {/* 2. BAGIAN NOMOR, LAMPIRAN, HAL & TANGGAL, TUJUAN */}
                <div className="grid grid-cols-2 gap-4 mt-3 mb-5 text-[12px] font-serif">
                  {/* Kiri: Nomor, Lampiran, Hal */}
                  <div className="space-y-0.5">
                    <div className="flex">
                      <span className="w-20 font-serif">Nomor</span>
                      <span className="w-4 font-serif">:</span>
                      <span className="flex-1 font-serif">{formData.nomor}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 font-serif">Lampiran</span>
                      <span className="w-4 font-serif">:</span>
                      <span className="flex-1 font-serif">{formData.lampiran}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 font-serif">Hal</span>
                      <span className="w-4 font-serif">:</span>
                      <span className="flex-1 font-serif">{formData.perihal}</span>
                    </div>
                  </div>

                  {/* Kanan: Tempat & Tanggal serta Tujuan */}
                  <div className="text-right space-y-0.5 font-serif">
                    <p>
                      {formData.tempat}, {formData.tanggalFormatted}
                    </p>
                    {formData.tanggalHijriah && (
                      <p className="italic text-[11.5px]">
                        {formData.tanggalHijriah}
                      </p>
                    )}
                    <div className="pt-2 text-left ml-auto max-w-[260px] font-serif">
                      <p>{formData.tujuanJabatan}</p>
                      <p>{formData.tujuanInstansi}</p>
                      <p>di</p>
                      <p className="pl-6 font-serif">{formData.tujuanTempat.replace(/^di\s+/i, '')}</p>
                    </div>
                  </div>
                </div>

                {/* 3. SALAM PEMBUKA ARAB & BASMALAH */}
                <div className="text-center my-5 space-y-1 font-serif">
                  <p className="text-[14.5px] font-serif tracking-wide" dir="rtl">
                    بسم الله الر حمنا الر حيم
                  </p>
                  <p className="text-[13.5px] font-serif tracking-wide" dir="rtl">
                    السلا م عليكم ور حمة الله و بر كا ته
                  </p>
                </div>

                {/* 4. DENGAN HORMAT & PARAGRAF PENGANTAR */}
                <div className="space-y-2 mb-4 font-serif text-[12px] leading-relaxed">
                  <p className="font-serif">Dengan Hormat,</p>
                  <p className="text-justify font-serif indent-8">
                    {formData.paragrafPembuka}
                  </p>
                </div>

                {/* 5. TABEL USULAN KEBUTUHAN BAHAN / REAGEN (5 KOLOM SESUAI FOTO) */}
                <div className="mb-5">
                  <table className="w-full border-collapse border border-black text-[11.5px]">
                    <thead>
                      <tr className="bg-gray-50/50 font-serif">
                        <th className="border border-black px-2 py-1.5 text-center w-10 font-bold">
                          No
                        </th>
                        <th className="border border-black px-3 py-1.5 text-center font-bold">
                          Nama Bahan
                        </th>
                        <th className="border border-black px-3 py-1.5 text-center w-36 font-bold">
                          Merk Reagen
                        </th>
                        <th className="border border-black px-3 py-1.5 text-center w-36 font-bold">
                          Kemasan Reagen
                        </th>
                        <th className="border border-black px-3 py-1.5 text-center w-20 font-bold">
                          Jumlah
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((row, idx) => (
                        <tr key={row.id} className="h-8 font-serif">
                          <td className="border border-black px-1.5 py-2 text-center font-serif">
                            {idx + 1}
                          </td>
                          <td className="border border-black px-3 py-2 font-serif font-medium">
                            {row.namaBahan || ''}
                          </td>
                          <td className="border border-black px-2 py-2 text-center font-serif">
                            {row.merkReagen || ''}
                          </td>
                          <td className="border border-black px-2 py-2 text-center font-serif">
                            {row.kemasanReagen || ''}
                          </td>
                          <td className="border border-black px-2 py-2 text-center font-serif">
                            {row.jumlah || ''}
                          </td>
                        </tr>
                      ))}

                      {/* Tampilkan baris kosong cadangan jika item kurang dari 4 agar proporsi surat persis foto */}
                      {formData.items.length < 4 &&
                        Array.from({ length: 4 - formData.items.length }).map((_, emptyIdx) => (
                          <tr key={'empty-' + emptyIdx} className="h-8 font-serif">
                            <td className="border border-black px-1.5 py-2 text-center font-serif">
                              {formData.items.length + emptyIdx + 1}
                            </td>
                            <td className="border border-black px-3 py-2"></td>
                            <td className="border border-black px-2 py-2"></td>
                            <td className="border border-black px-2 py-2"></td>
                            <td className="border border-black px-2 py-2"></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* 6. PARAGRAF PENUTUP & SALAM ARAB PENUTUP */}
                <div className="space-y-3 mt-4 mb-7 font-serif text-[12px] leading-relaxed">
                  <p className="text-left font-serif">
                    {formData.paragrafPenutup}
                  </p>
                  <p className="text-center text-[13.5px] font-serif" dir="rtl">
                    والسلام عليكم ور حمة الله وبر كا ته
                  </p>
                </div>

                {/* 7. BLOK TANDA TANGAN PEMOHON (SESUAI FOTO: TANPA GARIS BAWAH PADA NAMA, NIP BOLD) */}
                <div className="flex justify-end pt-2">
                  <div className="text-center min-w-[220px] font-serif space-y-1">
                    <p className="font-serif">{formData.jabatanPemohon || 'Pemohon'}</p>
                    
                    {/* Area tanda tangan basah */}
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-[10px] text-gray-300 italic font-sans no-print">
                        (Tanda Tangan)
                      </span>
                    </div>

                    {/* Nama Pemohon & NIP (Bold, tanpa underline sesuai foto asli) */}
                    <p className="font-bold font-serif text-[13px]">
                      {formData.namaPemohon}
                    </p>
                    <p className="font-bold font-serif text-[12px]">
                      NIP. {formData.nipPemohon}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DAFTAR RIWAYAT SURAT PENGAJUAN PESANAN (Screen only) */}
      {activeSubTab === 'list' && (
        <div className="no-print bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Arsip Surat Pengajuan Pesanan ({orderRequests.length})
              </h3>
              <p className="text-xs text-slate-500">
                Daftar permohonan bahan dan reagen habis pakai yang pernah dibuat
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Buat Surat Baru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                  <th className="py-3 px-3">No. Surat</th>
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Perihal</th>
                  <th className="py-3 px-3">Pemohon</th>
                  <th className="py-3 px-3 text-center">Jml Bahan</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orderRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {req.nomor}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{req.tanggalFormatted}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{req.perihal}</td>
                    <td className="py-3 px-3 text-slate-600">
                      <p className="font-semibold text-slate-800">{req.namaPemohon}</p>
                      <p className="text-[11px] text-slate-400">NIP. {req.nipPemohon}</p>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">
                      {req.items.length} item
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          req.status === 'Disetujui'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : req.status === 'Diajukan'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : req.status === 'Selesai'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      <button
                        onClick={() => handleLoadLetter(req)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
                        title="Buka dan sunting di editor"
                      >
                        Buka Surat
                      </button>
                      <button
                        onClick={() => {
                          handleLoadLetter(req);
                          setTimeout(() => window.print(), 100);
                        }}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
                        title="Langsung cetak surat ini"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLetter(req.id, req.nomor)}
                        className="px-2 py-1 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Hapus surat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ITEM PICKER FROM MASTER INVENTORY (Screen only) */}
      {isItemPickerOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800">
                  Pilih Bahan Dari Master Inventaris
                </h4>
              </div>
              <button
                onClick={() => setIsItemPickerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Cari nama bahan, reagen, atau kode..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  autoFocus
                />
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {filteredMasterItems.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Tidak ditemukan barang yang cocok.
                  </div>
                ) : (
                  filteredMasterItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectMasterItem(item)}
                      className="p-3 hover:bg-blue-50/60 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-xs text-slate-800">{item.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Kode: {item.code} • Produsen: {item.manufacturer || '-'} • Stok: {item.currentStock}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                        + Tambahkan
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsItemPickerOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY CSS RULES (Inject strictly for @media print) */}
      <style>{`
        @media print {
          /* Sembunyikan semua elemen aplikasi */
          body * {
            visibility: hidden;
          }
          /* Hanya tampilkan dokumen surat */
          #print-letter-document, #print-letter-document * {
            visibility: visible;
          }
          #print-letter-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10mm 15mm !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
