import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { StockOpname } from '../../types/inventory';
import {
  ClipboardCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Check,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const StockOpnameView: React.FC = () => {
  const { stockOpnames, items, locations, addStockOpname, approveStockOpname, currentUser } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOpname, setSelectedOpname] = useState<StockOpname | null>(null);

  const canExecute = currentUser.role === 'admin' || currentUser.role === 'petugas';

  // Opname session form
  const [selectedLocationId, setSelectedLocationId] = useState(locations[0]?.id || '');
  const [opnameDescription, setOpnameDescription] = useState('Stock Opname Rutin Bulanan Laboratorium');
  const [autoAdjust, setAutoAdjust] = useState(true);

  // Table of items with editable physical count
  const [itemCounts, setItemCounts] = useState<{ [itemId: string]: { physical: number; reason: string; notes: string } }>({});

  const openNewOpname = () => {
    const initialMap: { [itemId: string]: { physical: number; reason: string; notes: string } } = {};
    items.forEach((item) => {
      initialMap[item.id] = {
        physical: item.currentStock,
        reason: 'Sesuai fisik',
        notes: '',
      };
    });
    setItemCounts(initialMap);
    setSelectedLocationId(locations[0]?.id || '');
    setOpnameDescription(
      `Stock Opname Fisik Periode ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`
    );
    setAutoAdjust(true);
    setIsModalOpen(true);
  };

  const handlePhysicalChange = (itemId: string, val: number) => {
    setItemCounts((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        physical: Math.max(0, val),
      },
    }));
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setItemCounts((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes,
      },
    }));
  };

  const handleSaveOpname = (e: React.FormEvent) => {
    e.preventDefault();

    const details = items.map((item) => {
      const recorded = itemCounts[item.id] || { physical: item.currentStock, reason: 'Sesuai', notes: '' };
      const systemQuantity = item.currentStock;
      const physicalQuantity = Number(recorded.physical);
      const difference = physicalQuantity - systemQuantity;

      return {
        itemId: item.id,
        systemQuantity,
        physicalQuantity,
        reason: difference === 0 ? 'Sesuai fisik' : 'Selisih hitung fisik',
        notes: recorded.notes,
      };
    });

    const res = addStockOpname({
      date: new Date().toISOString().split('T')[0],
      locationId: selectedLocationId,
      description: opnameDescription,
      details,
      applyAdjustmentNow: autoAdjust,
    });

    if (!res.success) {
      alert(res.message);
      return;
    }

    setIsModalOpen(false);
  };

  const filteredOpnames = stockOpnames.filter(
    (op) =>
      op.opnameNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Stock Opname Fisik Gudang</h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-200">
              {stockOpnames.length} Sesi Opname
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Pencocokan kuantitas sistem dengan fisik gudang, verifikasi selisih, dan sinkronisasi stok otomatis.
          </p>
        </div>

        {canExecute && (
          <button
            onClick={openNewOpname}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Mulai Sesi Stock Opname Baru
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari no. transaksi opname atau keterangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">Total: {filteredOpnames.length} Rekaman</span>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">No. Transaksi</th>
              <th className="px-4 py-3">Tanggal Pelaksanaan</th>
              <th className="px-4 py-3">Keterangan / Berita Acara</th>
              <th className="px-4 py-3 text-center">Item Diperiksa</th>
              <th className="px-4 py-3 text-center">Status Sesi</th>
              <th className="px-4 py-3">Petugas Pelaksana</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOpnames.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                  <ClipboardCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">Belum ada riwayat pelaksanaan stock opname</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {canExecute
                      ? 'Klik tombol "Mulai Sesi Stock Opname Baru" untuk melakukan pencocokan stok fisik berkala.'
                      : 'Belum ada sesi stock opname yang tercatat.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredOpnames.map((op) => {
              const totalItems = op.details.length;
              const selisihCount = op.details.filter((d) => d.difference !== 0).length;

              return (
                <tr key={op.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-700">{op.opnameNumber}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{formatDate(op.date)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{op.description}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-slate-700">{totalItems} Barang</span>
                    {selisihCount > 0 ? (
                      <span className="block text-[10px] text-rose-600 font-semibold">({selisihCount} Selisih)</span>
                    ) : (
                      <span className="block text-[10px] text-emerald-600 font-semibold">(100% Cocok)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        op.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {op.status === 'approved' ? 'Selesai / Approved' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{op.userName}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedOpname(op)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg text-[11px] font-semibold"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      Detail
                    </button>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>

      {/* Modal Stock Opname Form (Live Sheet) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-indigo-50/70">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-indigo-700" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Lembar Hitung Fisik Stock Opname</h3>
                  <p className="text-[11px] text-slate-500">Masukkan hasil perhitungan fisik aktual di gudang</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOpname} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Keterangan / Berita Acara</label>
                  <input
                    type="text"
                    required
                    value={opnameDescription}
                    onChange={(e) => setOpnameDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Opsi Penyesuaian Otomatis</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAdjust}
                      onChange={(e) => setAutoAdjust(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-sm"
                    />
                    <span className="font-medium text-slate-700">Update stok sistem jika ada selisih</span>
                  </label>
                </div>
              </div>

              {/* Items physical entry table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Barang & Kode</th>
                      <th className="p-3">Lokasi Simpan</th>
                      <th className="p-3 text-center">Stok Sistem</th>
                      <th className="p-3 text-center">Stok Fisik (Input)</th>
                      <th className="p-3 text-center">Selisih</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3">Catatan Temuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => {
                      const loc = locations.find((l) => l.id === item.locationId);
                      const current = itemCounts[item.id] || { physical: item.currentStock, notes: '', reason: '' };
                      const diff = current.physical - item.currentStock;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <span className="font-bold text-slate-800 block">{item.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{item.code}</span>
                          </td>
                          <td className="p-3 text-slate-600">{loc?.name || '-'}</td>
                          <td className="p-3 text-center font-bold text-slate-700">{item.currentStock}</td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={current.physical}
                              onChange={(e) => handlePhysicalChange(item.id, Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-slate-300 rounded-lg text-center font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`font-bold ${
                                diff === 0 ? 'text-slate-400' : diff > 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {diff > 0 ? `+${diff}` : diff}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                diff === 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {diff === 0 ? 'Cocok' : 'Selisih'}
                            </span>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              placeholder="Keterangan jika ada selisih..."
                              value={current.notes}
                              onChange={(e) => handleNotesChange(item.id, e.target.value)}
                              className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Selesaikan & Simpan Stock Opname
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Hasil Stock Opname */}
      {selectedOpname && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Berita Acara Stock Opname Fisik</h3>
                <p className="text-[11px] text-slate-400 font-mono">{selectedOpname.opnameNumber}</p>
              </div>
              <button onClick={() => setSelectedOpname(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Tanggal Pelaksanaan</span>
                  <span className="font-bold text-slate-800">{formatDate(selectedOpname.date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Petugas Pelaksana</span>
                  <span className="font-bold text-slate-800">{selectedOpname.userName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 text-[10px] block uppercase">Keterangan / Catatan</span>
                  <span className="font-medium text-slate-700">{selectedOpname.description}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Barang</th>
                      <th className="p-2.5 text-center">Stok Sistem</th>
                      <th className="p-2.5 text-center">Stok Fisik</th>
                      <th className="p-2.5 text-center">Selisih</th>
                      <th className="p-2.5 text-center">Status</th>
                      <th className="p-2.5">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOpname.details.map((d, i) => {
                      const itm = items.find((x) => x.id === d.itemId);
                      return (
                        <tr key={i}>
                          <td className="p-2.5">
                            <span className="font-bold text-slate-800">{itm?.name || 'Item'}</span>
                            <span className="block text-[10px] font-mono text-slate-400">{itm?.code}</span>
                          </td>
                          <td className="p-2.5 text-center">{d.systemQuantity}</td>
                          <td className="p-2.5 text-center font-bold">{d.physicalQuantity}</td>
                          <td className="p-2.5 text-center font-bold">
                            <span className={d.difference === 0 ? 'text-slate-400' : d.difference > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                              {d.difference > 0 ? `+${d.difference}` : d.difference}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                d.difference === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {d.difference === 0 ? 'Cocok' : 'Selisih'}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-500">{d.notes || d.reason || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 flex justify-between items-center border-t border-slate-100">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 font-medium"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Berita Acara Opname
                </button>
                <button
                  onClick={() => setSelectedOpname(null)}
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
