import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { StockOutTransaction } from '../../types/inventory';
import {
  ArrowUpRight,
  Plus,
  Search,
  Building2,
  User,
  FileText,
  Eye,
  X,
  Check,
  AlertTriangle,
  Trash2,
  PackageMinus,
  Printer,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const StockOutView: React.FC = () => {
  const { stockOuts, departments, items, locations, addStockOut, currentUser } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<StockOutTransaction | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const canInput = currentUser.role === 'admin' || currentUser.role === 'petugas';

  // Transaction form header
  const [headerData, setHeaderData] = useState({
    date: '2026-09-15',
    departmentId: departments[0]?.id || '',
    requesterName: 'Analis Laboratorium',
    requestNumber: `REQ-2026-${Math.floor(Math.random() * 900 + 100)}`,
    description: 'Pengambilan reagen dan BHP untuk pemeriksaan rutin',
  });

  // Detail rows
  const [detailRows, setDetailRows] = useState<
    Array<{
      itemId: string;
      quantity: number;
      batchNumber: string;
      locationId: string;
      notes: string;
    }>
  >([]);

  const filteredTransactions = stockOuts.filter(
    (tr) =>
      tr.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tr.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tr.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      departments.find((d) => d.id === tr.departmentId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setErrorMessage('');
    setHeaderData({
      date: '2026-09-15',
      departmentId: departments[0]?.id || '',
      requesterName: 'Analis Laboratorium',
      requestNumber: `REQ-2026-${Math.floor(Math.random() * 900 + 100)}`,
      description: 'Pengambilan reagen dan consumable untuk pemeriksaan rutin harian',
    });

    const availableItem = items.find((i) => i.currentStock > 0);
    if (availableItem) {
      setDetailRows([
        {
          itemId: availableItem.id,
          quantity: 1,
          batchNumber: availableItem.batchNumber || '',
          locationId: availableItem.locationId,
          notes: 'Penggunaan harian',
        },
      ]);
    } else {
      setDetailRows([]);
    }
    setIsModalOpen(true);
  };

  const addDetailRow = () => {
    const availableItem = items.find((i) => i.currentStock > 0);
    if (!availableItem) return;
    setDetailRows((prev) => [
      ...prev,
      {
        itemId: availableItem.id,
        quantity: 1,
        batchNumber: availableItem.batchNumber || '',
        locationId: availableItem.locationId,
        notes: '',
      },
    ]);
  };

  const removeDetailRow = (index: number) => {
    setDetailRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = (index: number, field: string, value: any) => {
    setDetailRows((prev) => {
      const updated = [...prev];
      if (field === 'itemId') {
        const itemObj = items.find((i) => i.id === value);
        updated[index] = {
          ...updated[index],
          itemId: value,
          batchNumber: itemObj ? itemObj.batchNumber || '' : '',
          locationId: itemObj ? itemObj.locationId : updated[index].locationId,
        };
      } else {
        (updated[index] as any)[field] = value;
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (detailRows.length === 0) {
      setErrorMessage('Pilih minimal 1 barang untuk dikeluarkan.');
      return;
    }

    // Client-side instant validation before calling context
    for (const row of detailRows) {
      const itm = items.find((i) => i.id === row.itemId);
      if (!itm) {
        setErrorMessage('Barang tidak valid.');
        return;
      }
      if (row.quantity <= 0) {
        setErrorMessage(`Jumlah pengeluaran untuk "${itm.name}" harus lebih dari 0.`);
        return;
      }
      if (row.quantity > itm.currentStock) {
        setErrorMessage(
          `Stok tidak mencukupi untuk "${itm.name}". Stok tersedia saat ini hanya ${itm.currentStock} ${itm.code}. Permintaan Anda: ${row.quantity}.`
        );
        return;
      }
    }

    const res = addStockOut({
      date: headerData.date,
      departmentId: headerData.departmentId,
      requesterName: headerData.requesterName,
      requestNumber: headerData.requestNumber,
      description: headerData.description,
      details: detailRows,
    });

    if (!res.success) {
      setErrorMessage(res.message || 'Gagal memproses transaksi barang keluar.');
      return;
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Transaksi Barang Keluar (Stock Out)</h2>
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">
              {stockOuts.length} Transaksi
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Pencatatan pengeluaran barang ke unit pemakai laboratorium dengan validasi ketat anti-stok negatif.
          </p>
        </div>

        {canInput && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <PackageMinus className="w-4 h-4" />
            Catat Barang Keluar Baru
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No. Transaksi, Unit, atau Nama Pemohon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">Data tersaring: {filteredTransactions.length}</span>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">No. Transaksi</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Unit / Bagian Pemakai</th>
              <th className="px-4 py-3">Nama Pemohon & No. Permintaan</th>
              <th className="px-4 py-3 text-center">Item Keluar</th>
              <th className="px-4 py-3">Petugas Pengeluaran</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                  <PackageMinus className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">Belum ada riwayat transaksi barang keluar</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {canInput
                      ? 'Klik tombol "Catat Barang Keluar" di atas untuk menambahkan pengeluaran barang ke unit pemakai.'
                      : 'Belum ada transaksi pengeluaran barang yang dicatat.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tr) => {
              const dep = departments.find((d) => d.id === tr.departmentId);
              const totalItemsCount = tr.details.reduce((sum, d) => sum + d.quantity, 0);

              return (
                <tr key={tr.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {tr.transactionNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{formatDate(tr.date)}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{dep?.name || 'Unit'}</td>
                  <td className="px-4 py-3 space-y-0.5 text-[11px]">
                    <p className="font-semibold text-slate-700">{tr.requesterName}</p>
                    <p className="text-slate-400 font-mono">Req: {tr.requestNumber || '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px]">
                      {tr.details.length} Jenis ({totalItemsCount} Unit)
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{tr.userName}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedTransaction(tr)}
                      className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-700 rounded-md transition-colors"
                      title="Lihat Bukti Pengeluaran Barang (Bon Gudang)"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>

      {/* Modal Input Transaksi Barang Keluar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-blue-50/70">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-slate-800 text-sm">Formulir Pengeluaran Barang (Stock Out)</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-700 rounded-xl flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Header Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Pengeluaran</label>
                  <input
                    type="date"
                    required
                    value={headerData.date}
                    onChange={(e) => setHeaderData({ ...headerData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit / Bagian Pemakai</label>
                  <select
                    value={headerData.departmentId}
                    onChange={(e) => setHeaderData({ ...headerData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Pemohon</label>
                  <input
                    type="text"
                    required
                    value={headerData.requesterName}
                    onChange={(e) => setHeaderData({ ...headerData, requesterName: e.target.value })}
                    placeholder="dr. Anita / Analis"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Surat Permintaan</label>
                  <input
                    type="text"
                    required
                    value={headerData.requestNumber}
                    onChange={(e) => setHeaderData({ ...headerData, requestNumber: e.target.value })}
                    placeholder="REQ-2026-09"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono bg-white"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block font-semibold text-slate-700 mb-1">Keterangan / Keperluan</label>
                  <input
                    type="text"
                    value={headerData.description}
                    onChange={(e) => setHeaderData({ ...headerData, description: e.target.value })}
                    placeholder="Tujuan pemakaian, nomor pasien / batch sampel jika ada"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Detail Items List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <PackageMinus className="w-4 h-4 text-blue-600" /> Rincian Barang yang Dikeluarkan
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Sistem memeriksa ketersediaan stok fisik secara real-time. Stok tidak boleh negatif.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addDetailRow}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold flex items-center gap-1 border border-blue-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Baris Barang
                  </button>
                </div>

                <div className="space-y-3">
                  {detailRows.map((row, idx) => {
                    const selectedItem = items.find((i) => i.id === row.itemId);
                    const stockAvailable = selectedItem ? selectedItem.currentStock : 0;
                    const isExceeded = row.quantity > stockAvailable;

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 bg-white rounded-xl border transition-all ${
                          isExceeded ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="font-bold text-slate-700">Baris #{idx + 1}</span>
                          {detailRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDetailRow(idx)}
                              className="text-rose-500 hover:text-rose-700 flex items-center gap-1 text-[11px]"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
                          {/* Item Select */}
                          <div className="md:col-span-2">
                            <label className="block font-medium text-slate-600 mb-1">Pilih Barang</label>
                            <select
                              value={row.itemId}
                              onChange={(e) => handleRowChange(idx, 'itemId', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                            >
                              {items.map((i) => (
                                <option key={i.id} value={i.id} disabled={i.currentStock <= 0}>
                                  [{i.code}] {i.name} (Tersedia: {i.currentStock} {i.currentStock <= 0 ? '- HABIS' : ''})
                                </option>
                              ))}
                            </select>
                            {selectedItem && (
                              <div className="flex items-center gap-2 mt-1 text-[11px]">
                                <span className="text-slate-500">Stok Gudang:</span>
                                <span className="font-bold text-blue-700">{selectedItem.currentStock} Unit</span>
                                {selectedItem.batchNumber && (
                                  <span className="text-slate-400">• Lot: {selectedItem.batchNumber}</span>
                                )}
                                {selectedItem.expiryDate && (
                                  <span className="text-amber-600 font-medium">• Exp: {selectedItem.expiryDate}</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Qty */}
                          <div>
                            <label className="block font-medium text-slate-600 mb-1">
                              Jumlah Keluar <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={stockAvailable}
                              required
                              value={row.quantity}
                              onChange={(e) => handleRowChange(idx, 'quantity', Number(e.target.value))}
                              className={`w-full px-2.5 py-1.5 border rounded-lg font-bold ${
                                isExceeded
                                  ? 'border-rose-500 bg-rose-50 text-rose-700'
                                  : 'border-slate-200 text-blue-700'
                              }`}
                            />
                            {isExceeded && (
                              <p className="text-rose-600 font-bold text-[10px] mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Melebihi stok ({stockAvailable})
                              </p>
                            )}
                          </div>

                          {/* Batch/Lot */}
                          <div>
                            <label className="block font-medium text-slate-600 mb-1">Nomor Batch / Lot</label>
                            <input
                              type="text"
                              value={row.batchNumber}
                              onChange={(e) => handleRowChange(idx, 'batchNumber', e.target.value)}
                              placeholder="Batch pengeluaran"
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                            />
                          </div>

                          {/* Lokasi Gudang */}
                          <div>
                            <label className="block font-medium text-slate-600 mb-1">Lokasi Pengambilan</label>
                            <select
                              value={row.locationId}
                              onChange={(e) => handleRowChange(idx, 'locationId', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                            >
                              {locations.map((l) => (
                                <option key={l.id} value={l.id}>
                                  {l.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Catatan Baris */}
                          <div className="md:col-span-3">
                            <label className="block font-medium text-slate-600 mb-1">Catatan Khusus</label>
                            <input
                              type="text"
                              value={row.notes}
                              onChange={(e) => handleRowChange(idx, 'notes', e.target.value)}
                              placeholder="Pemeriksaan spesimen pasien rawat inap / kontrol kualitas"
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Simpan Transaksi Keluar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Transaksi Keluar (Bon Pengeluaran Gudang) */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Bukti Pengeluaran Barang (Bon Gudang)</h3>
                <p className="text-[11px] text-slate-400 font-mono">{selectedTransaction.transactionNumber}</p>
              </div>
              <button onClick={() => setSelectedTransaction(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Tanggal Pengeluaran</span>
                  <span className="font-bold">{formatDate(selectedTransaction.date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Unit Pemakai</span>
                  <span className="font-bold">
                    {departments.find((d) => d.id === selectedTransaction.departmentId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Nama Pemohon</span>
                  <span className="font-semibold">{selectedTransaction.requesterName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">No. Permintaan</span>
                  <span className="font-mono font-semibold">{selectedTransaction.requestNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Petugas Gudang</span>
                  <span className="font-semibold">{selectedTransaction.userName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Keperluan</span>
                  <span>{selectedTransaction.description || '-'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Daftar Barang Diserahkan:</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Barang</th>
                        <th className="p-2.5 text-center">Batch / Lot</th>
                        <th className="p-2.5 text-center">Lokasi Simpan</th>
                        <th className="p-2.5 text-right">Jumlah Keluar</th>
                        <th className="p-2.5">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedTransaction.details.map((d, i) => {
                        const itm = items.find((x) => x.id === d.itemId);
                        const loc = locations.find((l) => l.id === d.locationId);
                        return (
                          <tr key={i}>
                            <td className="p-2.5">
                              <span className="font-bold text-slate-800">{itm?.name || 'Item'}</span>
                              <span className="block text-[10px] font-mono text-slate-400">{itm?.code}</span>
                            </td>
                            <td className="p-2.5 text-center font-mono">{d.batchNumber || '-'}</td>
                            <td className="p-2.5 text-center text-slate-600">{loc?.name || '-'}</td>
                            <td className="p-2.5 text-right font-bold text-blue-600">{d.quantity}</td>
                            <td className="p-2.5 text-slate-500">{d.notes || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 flex justify-between items-center border-t border-slate-100">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 font-medium"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Bon Penyerahan
                </button>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
