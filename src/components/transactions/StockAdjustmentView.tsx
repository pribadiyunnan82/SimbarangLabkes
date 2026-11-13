import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { AdjustmentReason } from '../../types/inventory';
import {
  Sliders,
  Search,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const REASONS: AdjustmentReason[] = [
  'Barang rusak',
  'Barang hilang',
  'Kesalahan pencatatan',
  'Barang kadaluarsa',
  'Penggunaan belum tercatat',
  'Lainnya',
];

export const StockAdjustmentView: React.FC = () => {
  const { adjustments, items, addAdjustment, currentUser } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const canAdjust = currentUser.role === 'admin';

  // Form state
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');
  const [newStock, setNewStock] = useState(items[0]?.currentStock || 0);
  const [reason, setReason] = useState<AdjustmentReason>('Kesalahan pencatatan');
  const [notes, setNotes] = useState('Koreksi hasil verifikasi fisik gudang');

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const currentStock = selectedItem ? selectedItem.currentStock : 0;
  const difference = newStock - currentStock;

  const openAddModal = () => {
    setErrorMessage('');
    if (items.length > 0) {
      setSelectedItemId(items[0].id);
      setNewStock(items[0].currentStock);
    }
    setReason('Kesalahan pencatatan');
    setNotes('Penyesuaian fisik berkala');
    setIsModalOpen(true);
  };

  const handleItemChange = (itemId: string) => {
    setSelectedItemId(itemId);
    const itm = items.find((i) => i.id === itemId);
    if (itm) {
      setNewStock(itm.currentStock);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newStock < 0) {
      setErrorMessage('Stok setelah penyesuaian tidak boleh bernilai negatif (< 0).');
      return;
    }

    if (difference === 0) {
      setErrorMessage('Stok baru sama dengan stok saat ini. Tidak ada perubahan yang dilakukan.');
      return;
    }

    const res = addAdjustment({
      date: new Date().toISOString().split('T')[0],
      itemId: selectedItemId,
      quantityAfter: newStock,
      reason,
      description: notes,
    });

    if (!res.success) {
      setErrorMessage(res.message || 'Gagal menyimpan penyesuaian stok.');
      return;
    }

    setIsModalOpen(false);
  };

  const filtered = adjustments.filter((adj) => {
    const itm = items.find((i) => i.id === adj.itemId);
    return (
      adj.adjustmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adj.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adj.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (itm && itm.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (itm && itm.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Penyesuaian Stok (Stock Adjustment)</h2>
            <span className="text-xs bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-semibold border border-amber-200">
              {adjustments.length} Rekaman
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Koreksi manual stok akibat barang rusak, hilang, expired, atau kesalahan hitung dengan jejak audit ketat.
          </p>
        </div>

        {canAdjust ? (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Sliders className="w-4 h-4" />
            Lakukan Penyesuaian Stok
          </button>
        ) : (
          <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg font-medium border border-slate-200 self-start">
            Hanya Administrator yang memiliki wewenang adjustment
          </span>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari transaksi, alasan, atau nama barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">Total: {filtered.length} Penyesuaian</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">No. Penyesuaian</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Barang</th>
              <th className="px-4 py-3 text-center">Stok Sebelum</th>
              <th className="px-4 py-3 text-center">Stok Setelah</th>
              <th className="px-4 py-3 text-center">Selisih</th>
              <th className="px-4 py-3">Alasan</th>
              <th className="px-4 py-3">Keterangan</th>
              <th className="px-4 py-3">Otorisator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                  <Sliders className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">Belum ada riwayat penyesuaian stok</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {canAdjust
                      ? 'Klik tombol "Buat Penyesuaian Stok" untuk menyesuaikan stok barang jika terjadi selisih fisik.'
                      : 'Belum ada riwayat penyesuaian stok manual yang dicatat.'}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((adj) => {
              const itm = items.find((i) => i.id === adj.itemId);
              return (
                <tr key={adj.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-bold text-amber-700">{adj.adjustmentNumber}</td>
                  <td className="px-4 py-3">{formatDate(adj.date)}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-800">{itm?.name || 'Item'}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">{itm?.code}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{adj.quantityBefore}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-800">{adj.quantityAfter}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        adj.difference > 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {adj.difference > 0 ? `+${adj.difference}` : adj.difference}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{adj.reason}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{adj.description || '-'}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{adj.userName}</td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>

      {/* Modal Penyesuaian Stok */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-slate-800 text-sm">Formulir Penyesuaian Stok Manual</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Pilih Barang */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Barang yang Disesuaikan</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => handleItemChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      [{i.code}] {i.name} (Stok Saat Ini: {i.currentStock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Perbandingan Stok */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Stok Sistem Saat Ini</span>
                  <span className="text-lg font-bold text-slate-700">{currentStock}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Stok Fisik Sebenarnya</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-20 text-center font-bold text-lg border border-slate-300 rounded-lg py-0.5 bg-white text-blue-700"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Selisih Penyesuaian</span>
                  <span
                    className={`text-lg font-bold ${
                      difference > 0 ? 'text-emerald-600' : difference < 0 ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  >
                    {difference > 0 ? `+${difference}` : difference}
                  </span>
                </div>
              </div>

              {/* Alasan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Penyesuaian</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as AdjustmentReason)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan / Berita Acara</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Jelaskan kronologi atau nomor BA pemeriksaan fisik..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Konfirmasi Penyesuaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
