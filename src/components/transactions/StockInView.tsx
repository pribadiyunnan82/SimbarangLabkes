import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { StockInTransaction } from '../../types/inventory';
import {
  ArrowDownLeft,
  Plus,
  Search,
  Calendar,
  Truck,
  FileText,
  Eye,
  X,
  Check,
  AlertCircle,
  Trash2,
  PackagePlus,
  Printer,
} from 'lucide-react';
import { formatDate, formatRupiah } from '../../utils/helpers';

export const StockInView: React.FC = () => {
  const { stockIns, suppliers, items, locations, addStockIn, currentUser } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<StockInTransaction | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Can input? Admin & Petugas (Pimpinan cannot input)
  const canInput = currentUser.role === 'admin' || currentUser.role === 'petugas';

  // Transaction form state
  const [headerData, setHeaderData] = useState({
    date: '2026-09-15',
    supplierId: suppliers[0]?.id || '',
    documentNumber: '',
    deliveryNote: '',
    description: 'Penerimaan barang masuk gudang',
  });

  const [detailRows, setDetailRows] = useState<
    Array<{
      itemId: string;
      quantity: number;
      price: number;
      batchNumber: string;
      productionDate: string;
      expiryDate: string;
      locationId: string;
      condition: 'Baik' | 'Rusak' | 'Segel Terbuka';
      notes: string;
    }>
  >([]);

  const filteredTransactions = stockIns.filter(
    (tr) =>
      tr.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tr.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tr.deliveryNote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tr.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suppliers.find((s) => s.id === tr.supplierId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setErrorMessage('');
    setHeaderData({
      date: '2026-09-15',
      supplierId: suppliers[0]?.id || '',
      documentNumber: `PO-2026-${Math.floor(Math.random() * 900 + 100)}`,
      deliveryNote: `SJ-${Math.floor(Math.random() * 9000 + 1000)}`,
      description: 'Penerimaan barang dan reagen baru',
    });

    // Start with 1 row
    if (items.length > 0) {
      const firstItem = items[0];
      setDetailRows([
        {
          itemId: firstItem.id,
          quantity: 10,
          price: firstItem.price,
          batchNumber: `LOT-2026-${Math.floor(Math.random() * 800 + 100)}`,
          productionDate: '2026-06-01',
          expiryDate: '2028-06-01',
          locationId: firstItem.locationId,
          condition: 'Baik',
          notes: 'Segel pabrik utuh',
        },
      ]);
    }
    setIsModalOpen(true);
  };

  const addDetailRow = () => {
    if (items.length === 0) return;
    const firstItem = items[0];
    setDetailRows((prev) => [
      ...prev,
      {
        itemId: firstItem.id,
        quantity: 5,
        price: firstItem.price,
        batchNumber: `LOT-2026-${Math.floor(Math.random() * 800 + 100)}`,
        productionDate: '2026-06-01',
        expiryDate: '2028-06-01',
        locationId: firstItem.locationId,
        condition: 'Baik',
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
          price: itemObj ? itemObj.price : updated[index].price,
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
    if (detailRows.length === 0) {
      setErrorMessage('Tambahkan minimal 1 item barang masuk.');
      return;
    }

    const res = addStockIn({
      date: headerData.date,
      supplierId: headerData.supplierId,
      documentNumber: headerData.documentNumber,
      deliveryNote: headerData.deliveryNote,
      description: headerData.description,
      details: detailRows,
    });

    if (!res.success) {
      setErrorMessage(res.message || 'Gagal menyimpan transaksi');
      return;
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs ${selectedTransaction ? 'print:hidden' : 'no-print'}`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Transaksi Barang Masuk (Stock In)</h2>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
              {stockIns.length} Transaksi
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Pencatatan penerimaan barang dari supplier, surat jalan, nomor batch/lot, dan tanggal kedaluwarsa.
          </p>
        </div>

        {canInput && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <PackagePlus className="w-4 h-4" />
            Catat Barang Masuk Baru
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className={`bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between ${selectedTransaction ? 'print:hidden' : 'no-print'}`}>
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No. Transaksi, PO, Surat Jalan, atau Supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">Data tersaring: {filteredTransactions.length}</span>
      </div>

      {/* Transactions Table */}
      <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden ${selectedTransaction ? 'print:hidden' : ''}`}>
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">No. Transaksi</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Pemasok / Supplier</th>
              <th className="px-4 py-3">Dokumen & Surat Jalan</th>
              <th className="px-4 py-3 text-center">Item Masuk</th>
              <th className="px-4 py-3">Petugas Penerima</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                  <PackagePlus className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">Belum ada riwayat transaksi barang masuk</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {canInput
                      ? 'Klik tombol "Catat Barang Masuk" di atas untuk menambahkan transaksi baru.'
                      : 'Belum ada transaksi penerimaan barang yang dicatat oleh petugas.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tr) => {
              const sup = suppliers.find((s) => s.id === tr.supplierId);
              const totalItemsCount = tr.details.reduce((sum, d) => sum + d.quantity, 0);

              return (
                <tr key={tr.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {tr.transactionNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{formatDate(tr.date)}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{sup?.name || 'Supplier'}</td>
                  <td className="px-4 py-3 space-y-0.5 text-[11px]">
                    <p className="font-mono text-slate-700 font-semibold">{tr.documentNumber || '-'}</p>
                    <p className="text-slate-400">SJ: {tr.deliveryNote || '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      {tr.details.length} Jenis ({totalItemsCount} Unit)
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{tr.userName}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedTransaction(tr)}
                      className="p-1.5 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-md transition-colors"
                      title="Lihat Rincian Faktur Penerimaan"
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

      {/* Modal Input Transaksi Barang Masuk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50/70">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-800 text-sm">Formulir Penerimaan Barang Masuk (Stock In)</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Header Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Penerimaan</label>
                  <input
                    type="date"
                    required
                    value={headerData.date}
                    onChange={(e) => setHeaderData({ ...headerData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier / Pemasok</label>
                  <select
                    value={headerData.supplierId}
                    onChange={(e) => setHeaderData({ ...headerData, supplierId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Dokumen / PO</label>
                  <input
                    type="text"
                    required
                    value={headerData.documentNumber}
                    onChange={(e) => setHeaderData({ ...headerData, documentNumber: e.target.value })}
                    placeholder="PO-2026-091"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Surat Jalan</label>
                  <input
                    type="text"
                    required
                    value={headerData.deliveryNote}
                    onChange={(e) => setHeaderData({ ...headerData, deliveryNote: e.target.value })}
                    placeholder="SJ-9941"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono bg-white"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block font-semibold text-slate-700 mb-1">Keterangan Penerimaan</label>
                  <input
                    type="text"
                    value={headerData.description}
                    onChange={(e) => setHeaderData({ ...headerData, description: e.target.value })}
                    placeholder="Catatan kondisi pengiriman atau kurir"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Detail Items List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <PackagePlus className="w-4 h-4 text-emerald-600" /> Rincian Barang yang Diterima
                  </h4>
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
                    return (
                      <div
                        key={idx}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
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

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          {/* Item Select */}
                          <div className="md:col-span-2">
                            <label className="block font-medium text-slate-600 mb-1">Pilih Barang</label>
                            <select
                              value={row.itemId}
                              onChange={(e) => handleRowChange(idx, 'itemId', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                            >
                              {items.map((i) => (
                                <option key={i.id} value={i.id}>
                                  [{i.code}] {i.name} (Stok: {i.currentStock})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Qty */}
                          <div>
                            <label className="block font-medium text-slate-600 mb-1">Jumlah Masuk</label>
                            <input
                              type="number"
                              min="1"
                              required
                              value={row.quantity}
                              onChange={(e) => handleRowChange(idx, 'quantity', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold text-emerald-700"
                            />
                          </div>

                          {/* Harga */}
                          <div>
                            <label className="block font-medium text-slate-600 mb-1">Harga Satuan (Rp)</label>
                            <input
                              type="number"
                              min="0"
                              value={row.price}
                              onChange={(e) => handleRowChange(idx, 'price', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                            />
                          </div>

                          {/* Batch/Lot */}
                          <div>
                            <label className="block font-medium text-slate-600 mb-1">Nomor Batch / Lot</label>
                            <input
                              type="text"
                              required
                              value={row.batchNumber}
                              onChange={(e) => handleRowChange(idx, 'batchNumber', e.target.value)}
                              placeholder="LOT-2026-X"
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono"
                            />
                          </div>

                          {/* Expired Date */}
                          <div>
                            <label className="block font-medium text-slate-600 mb-1">Tgl Kedaluwarsa (Expired)</label>
                            <input
                              type="date"
                              value={row.expiryDate}
                              onChange={(e) => handleRowChange(idx, 'expiryDate', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-rose-700 font-semibold"
                            />
                          </div>

                          {/* Lokasi Simpan */}
                          <div>
                            <label className="block font-medium text-slate-600 mb-1">Lokasi Penyimpanan</label>
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

                          {/* Kondisi */}
                          <div>
                            <label className="block font-medium text-slate-600 mb-1">Kondisi Fisik</label>
                            <select
                              value={row.condition}
                              onChange={(e) => handleRowChange(idx, 'condition', e.target.value as any)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                            >
                              <option value="Baik">Baik & Utuh</option>
                              <option value="Rusak">Rusak / Cacat</option>
                              <option value="Segel Terbuka">Segel Terbuka</option>
                            </select>
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Simpan Transaksi Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Transaksi Masuk */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Faktur Penerimaan Barang Masuk</h3>
                <p className="text-[11px] text-slate-400 font-mono">{selectedTransaction.transactionNumber}</p>
              </div>
              <button onClick={() => setSelectedTransaction(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Tanggal Masuk</span>
                  <span className="font-bold">{formatDate(selectedTransaction.date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Supplier</span>
                  <span className="font-bold">
                    {suppliers.find((s) => s.id === selectedTransaction.supplierId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">No. Dokumen / PO</span>
                  <span className="font-mono font-semibold">{selectedTransaction.documentNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">No. Surat Jalan</span>
                  <span className="font-mono font-semibold">{selectedTransaction.deliveryNote}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Petugas Penerima</span>
                  <span className="font-semibold">{selectedTransaction.userName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Keterangan</span>
                  <span>{selectedTransaction.description || '-'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Daftar Barang Diterima:</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Barang</th>
                        <th className="p-2.5 text-center">Batch / Lot</th>
                        <th className="p-2.5 text-center">Expired</th>
                        <th className="p-2.5 text-right">Jumlah</th>
                        <th className="p-2.5 text-right">Harga</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedTransaction.details.map((d, i) => {
                        const itm = items.find((x) => x.id === d.itemId);
                        return (
                          <tr key={i}>
                            <td className="p-2.5">
                              <span className="font-bold text-slate-800">{itm?.name || 'Item'}</span>
                              <span className="block text-[10px] font-mono text-slate-400">{itm?.code}</span>
                            </td>
                            <td className="p-2.5 text-center font-mono">{d.batchNumber || '-'}</td>
                            <td className="p-2.5 text-center text-slate-600">{d.expiryDate || '-'}</td>
                            <td className="p-2.5 text-right font-bold text-emerald-600">{d.quantity}</td>
                            <td className="p-2.5 text-right font-medium">{formatRupiah(d.price)}</td>
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
                  <Printer className="w-3.5 h-3.5" /> Cetak Bukti Masuk
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
