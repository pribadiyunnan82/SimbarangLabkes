import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  Printer,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { formatDate, formatRupiah } from '../../utils/helpers';

interface StockCardViewProps {
  initialItemId?: string;
}

export const StockCardView: React.FC<StockCardViewProps> = ({ initialItemId }) => {
  const { items, categories, locations, units, getItemStockCard, currentUser } = useInventory();

  const [selectedItemId, setSelectedItemId] = useState(initialItemId || items[0]?.id || '');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-09-30');

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const category = categories.find((c) => c.id === selectedItem?.categoryId);
  const location = locations.find((l) => l.id === selectedItem?.locationId);
  const unit = units.find((u) => u.id === selectedItem?.unitId);

  // Use the reactive stock card calculation from context
  const itemLedger = useMemo(() => {
    if (!selectedItemId) return [];
    return getItemStockCard(selectedItemId, startDate, endDate);
  }, [getItemStockCard, selectedItemId, startDate, endDate]);

  const totalIn = itemLedger.reduce((sum, c) => sum + c.inQty, 0);
  const totalOut = itemLedger.reduce((sum, c) => sum + c.outQty, 0);

  return (
    <div className="space-y-6">
      {/* Header (Screen only) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Buku Kartu Stok Barang (Stock Card)</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Buku mutasi lengkap yang merekam seluruh riwayat saldo awal, penerimaan, pengeluaran, dan penyesuaian.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Cetak Kartu Stok (PDF)
        </button>
      </div>

      {/* Selectors Bar (Screen only) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
        <div className="w-full md:w-96">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pilih Barang</label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold text-slate-800"
          >
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                [{i.code}] {i.name} (Sisa: {i.currentStock})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Periode Dari</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sampai Dengan</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
            />
          </div>
        </div>
      </div>

      {/* Item Summary Card (Screen only) */}
      {selectedItem && (
        <div className="no-print bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-2xl shadow-sm grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Kode & Nama Barang</span>
            <span className="font-mono text-blue-400 font-bold block">{selectedItem.code}</span>
            <span className="font-bold text-sm text-white">{selectedItem.name}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Kategori & Lokasi</span>
            <span className="font-medium text-slate-200 block">{category?.name || '-'}</span>
            <span className="text-xs text-slate-400">{location?.name || '-'}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Batas Min / Max</span>
            <span className="font-semibold text-slate-200">
              {selectedItem.minimumStock} / {selectedItem.maximumStock} {unit?.symbol}
            </span>
            <span className="block text-[11px] text-slate-400">Harga: {formatRupiah(selectedItem.price)}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Periode Ini</span>
            <span className="text-xs text-emerald-400 font-semibold block">Masuk (+): {totalIn}</span>
            <span className="text-xs text-rose-400 font-semibold block">Keluar (-): {totalOut}</span>
          </div>

          <div className="bg-white/10 p-3 rounded-xl flex flex-col justify-center items-center text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">Stok Akhir Saat Ini</span>
            <span className="text-3xl font-black text-white">{selectedItem.currentStock}</span>
            <span className="text-[11px] text-emerald-400 font-semibold">{unit?.symbol} Tersedia</span>
          </div>
        </div>
      )}

      {/* PRINT-ONLY: Clean Document Header */}
      {selectedItem && (
        <div className="print-only mb-4 border-b-2 border-slate-900 pb-3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
                SISTEM MANAJEMEN INVENTARIS GUDANG
              </h1>
              <h2 className="text-sm font-bold text-slate-800 mt-0.5 uppercase">
                BUKU KARTU STOK PERSEDIAAN BARANG (STOCK CARD)
              </h2>
            </div>
            <div className="text-right text-[8.5pt] text-slate-600">
              <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p>Petugas: {currentUser?.name || 'Administrator'}</p>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-300 grid grid-cols-2 gap-2 text-[8.5pt] text-slate-800">
            <div>
              <p><strong>Kode Barang:</strong> {selectedItem.code}</p>
              <p><strong>Nama Barang:</strong> {selectedItem.name}</p>
              <p><strong>Kategori:</strong> {category?.name || '-'}</p>
            </div>
            <div>
              <p><strong>Lokasi Simpan:</strong> {location?.name || '-'}</p>
              <p><strong>Satuan:</strong> {unit?.name} ({unit?.symbol})</p>
              <p><strong>Periode Mutasi:</strong> {formatDate(startDate)} s/d {formatDate(endDate)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pure Ledger Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">No. Transaksi / Referensi</th>
                <th className="px-4 py-3">Jenis Mutasi</th>
                <th className="px-4 py-3">Keterangan / Rekanan</th>
                <th className="px-4 py-3 text-right">Masuk (+)</th>
                <th className="px-4 py-3 text-right">Keluar (-)</th>
                <th className="px-4 py-3 text-right font-bold text-slate-800">Sisa Saldo</th>
                <th className="px-4 py-3">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itemLedger.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Belum ada riwayat mutasi untuk barang dan periode ini.
                  </td>
                </tr>
              ) : (
                itemLedger.map((row) => {
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-700">{formatDate(row.date)}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800">{row.transactionNumber}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] print:bg-transparent print:p-0 ${
                            row.type === 'Barang Masuk'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.type === 'Barang Keluar'
                              ? 'bg-blue-100 text-blue-800'
                              : row.type === 'Penyesuaian'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {row.type === 'Barang Masuk' && <ArrowDownLeft className="w-3 h-3 no-print" />}
                          {row.type === 'Barang Keluar' && <ArrowUpRight className="w-3 h-3 no-print" />}
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{row.notes}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        {row.inQty > 0 ? `+${row.inQty}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-orange-600">
                        {row.outQty > 0 ? `-${row.outQty}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-slate-800 text-sm">{row.balance}</td>
                      <td className="px-4 py-3 text-slate-500 font-medium">{row.officer}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {selectedItem && (
              <tfoot className="border-t-2 border-slate-300 font-bold bg-slate-50 text-slate-900">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right uppercase text-[11px] tracking-wider">
                    Saldo Akhir Saat Ini:
                  </td>
                  <td className="px-4 py-3 text-right font-black text-emerald-700">+{totalIn}</td>
                  <td className="px-4 py-3 text-right font-black text-rose-700">-{totalOut}</td>
                  <td className="px-4 py-3 text-right font-black text-sm text-slate-900">
                    {selectedItem.currentStock} {unit?.symbol}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* PRINT-ONLY: Signature Section */}
      <div className="print-only mt-8 pt-4">
        <div className="grid grid-cols-2 gap-12 text-center text-[9pt]">
          <div>
            <p className="font-semibold text-slate-800">Mengetahui,</p>
            <p className="text-slate-600 mb-16">Pimpinan / Kepala Unit</p>
            <p className="font-bold text-slate-900 underline">( .................................................... )</p>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Penanggung Jawab,</p>
            <p className="text-slate-600 mb-16">Petugas Pengelola Logistik</p>
            <p className="font-bold text-slate-900 underline">( {currentUser?.name || 'Petugas Gudang'} )</p>
          </div>
        </div>
      </div>
    </div>
  );
};
