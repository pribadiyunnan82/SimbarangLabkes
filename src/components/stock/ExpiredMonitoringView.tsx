import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  CalendarClock,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Search,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { calculateDaysUntilExpiry, getExpiryStatus, formatDate } from '../../utils/helpers';

export const ExpiredMonitoringView: React.FC = () => {
  const { items, categories, locations, updateItem, currentUser } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'EXPIRED' | 'SEGERA DIGUNAKAN' | 'PERINGATAN' | 'AMAN'>(
    'ALL'
  );

  const canQuarantine = currentUser.role === 'admin' || currentUser.role === 'petugas';

  // Items with expiration calculation, sorted FEFO (earliest expiry first)
  const itemsWithExpiry = useMemo(() => {
    return items
      .filter((i) => i.expiryDate && i.currentStock > 0)
      .map((item) => {
        const days = calculateDaysUntilExpiry(item.expiryDate);
        const status = getExpiryStatus(item.expiryDate);
        return {
          ...item,
          daysUntilExpiry: days,
          expiryStatus: status,
        };
      })
      .sort((a, b) => {
        if (a.daysUntilExpiry === null) return 1;
        if (b.daysUntilExpiry === null) return -1;
        return a.daysUntilExpiry - b.daysUntilExpiry; // FEFO
      });
  }, [items]);

  const filtered = useMemo(() => {
    return itemsWithExpiry.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.batchNumber && item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = selectedStatus === 'ALL' || item.expiryStatus === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [itemsWithExpiry, searchTerm, selectedStatus]);

  const expiredCount = itemsWithExpiry.filter((i) => i.expiryStatus === 'EXPIRED').length;
  const urgentCount = itemsWithExpiry.filter((i) => i.expiryStatus === 'SEGERA DIGUNAKAN').length;
  const warningCount = itemsWithExpiry.filter((i) => i.expiryStatus === 'PERINGATAN').length;
  const safeCount = itemsWithExpiry.filter((i) => i.expiryStatus === 'AMAN').length;

  const handleQuarantine = (itemId: string, name: string) => {
    if (confirm(`Pindahkan barang "${name}" ke status Karantina (Quarantine) agar tidak dapat dikeluarkan?`)) {
      updateItem(itemId, { status: 'Quarantine' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Monitoring Tanggal Kedaluwarsa & FEFO</h2>
            <span className="text-xs bg-yellow-50 text-yellow-800 px-2.5 py-0.5 rounded-full font-semibold border border-yellow-200">
              Prinsip FEFO (First Expired First Out)
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Pemantauan reagen laboratorium, standar kimia, dan consumable berdasarkan usia pakai dan tanggal kedaluwarsa.
          </p>
        </div>

        {/* Status badges summary */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              selectedStatus === 'ALL'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua ({itemsWithExpiry.length})
          </button>
          <button
            onClick={() => setSelectedStatus('EXPIRED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              selectedStatus === 'EXPIRED'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Expired ({expiredCount})
          </button>
          <button
            onClick={() => setSelectedStatus('SEGERA DIGUNAKAN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              selectedStatus === 'SEGERA DIGUNAKAN'
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> &lt;30 Hari ({urgentCount})
          </button>
          <button
            onClick={() => setSelectedStatus('PERINGATAN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              selectedStatus === 'PERINGATAN'
                ? 'bg-yellow-500 text-slate-900 border-yellow-500'
                : 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> 30-90 Hari ({warningCount})
          </button>
        </div>
      </div>

      {/* Legend guideline banner PRD 17 */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <span className="font-bold text-slate-700">Indikator Tingkat Peringatan Kadaluarsa:</span>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-600" />
            <span className="text-slate-700 font-medium">Merah: Sudah Expired (Dilarang Digunakan)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-slate-700 font-medium">Oranye: &lt; 30 Hari (Prioritas FEFO Utama)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-slate-700 font-medium">Kuning: 30 - 90 Hari (Peringatan Awal)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-700 font-medium">Hijau: &gt; 90 Hari (Kondisi Aman)</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama barang atau nomor batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">Data tersaring: {filtered.length} Barang</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Prioritas FEFO & Barang</th>
                <th className="px-4 py-3">Batch / Lot</th>
                <th className="px-4 py-3">Lokasi & Suhu Simpan</th>
                <th className="px-4 py-3 text-center">Tgl Kedaluwarsa</th>
                <th className="px-4 py-3 text-center">Sisa Masa Simpan</th>
                <th className="px-4 py-3 text-right">Stok Fisik</th>
                <th className="px-4 py-3 text-center">Status FEFO</th>
                <th className="px-4 py-3 text-center">Status Barang</th>
                {canQuarantine && <th className="px-4 py-3 text-center">Tindakan</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={canQuarantine ? 9 : 8} className="px-4 py-12 text-center text-slate-400">
                    <CalendarClock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada data persediaan barang kedaluwarsa</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Belum ada stok fisik barang di gudang dengan masa kedaluwarsa.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                const loc = locations.find((l) => l.id === item.locationId);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* FEFO index & Item name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800 block">{item.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.code} {item.manufacturer ? `• ${item.manufacturer}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Batch */}
                    <td className="px-4 py-3 font-mono font-semibold text-slate-700">{item.batchNumber || '-'}</td>

                    {/* Lokasi & Kondisi Simpan */}
                    <td className="px-4 py-3 space-y-0.5">
                      <span className="font-medium text-slate-700 block">{loc?.name || '-'}</span>
                      <span className="text-[10px] text-blue-600">{item.storageCondition || '-'}</span>
                    </td>

                    {/* Tgl Kedaluwarsa */}
                    <td className="px-4 py-3 text-center font-semibold text-slate-800">
                      {formatDate(item.expiryDate)}
                    </td>

                    {/* Sisa Masa Simpan */}
                    <td className="px-4 py-3 text-center">
                      {item.daysUntilExpiry !== null ? (
                        item.daysUntilExpiry <= 0 ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            Expired ({Math.abs(item.daysUntilExpiry)} hari lalu)
                          </span>
                        ) : (
                          <span className="font-bold text-slate-800">{item.daysUntilExpiry} Hari Lagi</span>
                        )
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Stok Fisik */}
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{item.currentStock}</td>

                    {/* Status FEFO Badge */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.expiryStatus === 'EXPIRED'
                            ? 'bg-rose-600 text-white'
                            : item.expiryStatus === 'SEGERA DIGUNAKAN'
                            ? 'bg-orange-500 text-white'
                            : item.expiryStatus === 'PERINGATAN'
                            ? 'bg-yellow-400 text-slate-900 font-extrabold'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.expiryStatus}
                      </span>
                    </td>

                    {/* Status Master Barang */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          item.status === 'Quarantine'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : item.status === 'Aktif'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Karantina Action */}
                    {canQuarantine && (
                      <td className="px-4 py-3 text-center">
                        {item.status !== 'Quarantine' ? (
                          <button
                            onClick={() => handleQuarantine(item.id, item.name)}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[10px] font-semibold transition-colors"
                            title="Karantina barang agar tidak dapat dikeluarkan"
                          >
                            Karantina
                          </button>
                        ) : (
                          <span className="text-[10px] text-purple-600 font-semibold">Terkarantina</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
