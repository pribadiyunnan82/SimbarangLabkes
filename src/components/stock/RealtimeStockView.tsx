import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Search, Filter, AlertTriangle, XCircle, CheckCircle2, Layers, BookOpen, ArrowUpDown } from 'lucide-react';
import { formatRupiah, getStockStatus } from '../../utils/helpers';

interface RealtimeStockViewProps {
  onOpenStockCard?: (itemId: string) => void;
}

export const RealtimeStockView: React.FC<RealtimeStockViewProps> = ({ onOpenStockCard }) => {
  const { items, categories, locations, units, stockIns, stockOuts, adjustments } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AMAN' | 'MINIMUM' | 'HABIS'>('ALL');

  // Compute live flow counts for each item
  const itemsWithFlow = useMemo(() => {
    return items.map((item) => {
      // Total in
      const totalIn = stockIns.reduce((sum, tr) => {
        const itemRows = tr.details.filter((d) => d.itemId === item.id);
        return sum + itemRows.reduce((dSum, d) => dSum + d.quantity, 0);
      }, 0);

      // Total out
      const totalOut = stockOuts.reduce((sum, tr) => {
        const itemRows = tr.details.filter((d) => d.itemId === item.id);
        return sum + itemRows.reduce((dSum, d) => dSum + d.quantity, 0);
      }, 0);

      // Adjustments
      const totalAdj = adjustments
        .filter((a) => a.itemId === item.id)
        .reduce((sum, a) => sum + a.difference, 0);

      const status = getStockStatus(item.currentStock, item.minimumStock);

      return {
        ...item,
        totalIn,
        totalOut,
        totalAdj,
        stockStatus: status,
      };
    });
  }, [items, stockIns, stockOuts, adjustments]);

  // Filtering
  const filtered = useMemo(() => {
    return itemsWithFlow.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
      const matchLoc = selectedLocation === 'ALL' || item.locationId === selectedLocation;
      const matchStatus = statusFilter === 'ALL' || item.stockStatus === statusFilter;
      return matchSearch && matchCat && matchLoc && matchStatus;
    });
  }, [itemsWithFlow, searchTerm, selectedCategory, selectedLocation, statusFilter]);

  const countAman = itemsWithFlow.filter((i) => i.stockStatus === 'AMAN').length;
  const countMin = itemsWithFlow.filter((i) => i.stockStatus === 'MINIMUM').length;
  const countHabis = itemsWithFlow.filter((i) => i.stockStatus === 'HABIS').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Monitoring Stok Real-Time</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Informasi ketersediaan stok fisik gudang yang diperbarui secara otomatis dari setiap transaksi.
          </p>
        </div>

        {/* Status badges summary */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua ({items.length})
          </button>
          <button
            onClick={() => setStatusFilter('AMAN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              statusFilter === 'AMAN'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Aman ({countAman})
          </button>
          <button
            onClick={() => setStatusFilter('MINIMUM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              statusFilter === 'MINIMUM'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Minimum ({countMin})
          </button>
          <button
            onClick={() => setStatusFilter('HABIS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              statusFilter === 'HABIS'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" /> Habis ({countHabis})
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode atau nama barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="ALL">Semua Lokasi</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Kode & Nama Barang</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Lokasi Simpan</th>
                <th className="px-4 py-3 text-center">Batas Min / Max</th>
                <th className="px-4 py-3 text-right">Mutasi Masuk</th>
                <th className="px-4 py-3 text-right">Mutasi Keluar</th>
                <th className="px-4 py-3 text-right font-bold text-slate-800">Sisa Stok Fisik</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Kartu Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const cat = categories.find((c) => c.id === item.categoryId);
                const loc = locations.find((l) => l.id === item.locationId);
                const unt = units.find((u) => u.id === item.unitId);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-800 block">{item.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.code} {item.batchNumber ? `• Lot: ${item.batchNumber}` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {cat?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{loc?.name}</td>
                    <td className="px-4 py-3 text-center text-slate-500 font-mono">
                      {item.minimumStock} / {item.maximumStock}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-semibold">
                      +{item.totalIn}
                    </td>
                    <td className="px-4 py-3 text-right text-orange-600 font-semibold">
                      -{item.totalOut}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-base font-black ${
                          item.stockStatus === 'HABIS'
                            ? 'text-rose-600'
                            : item.stockStatus === 'MINIMUM'
                            ? 'text-amber-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {item.currentStock}
                      </span>{' '}
                      <span className="text-[11px] text-slate-400 font-medium">{unt?.symbol}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.stockStatus === 'HABIS'
                            ? 'bg-rose-100 text-rose-700 border border-rose-300'
                            : item.stockStatus === 'MINIMUM'
                            ? 'bg-amber-100 text-amber-700 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {item.stockStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onOpenStockCard && onOpenStockCard(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        <BookOpen className="w-3 h-3" />
                        Kartu
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
