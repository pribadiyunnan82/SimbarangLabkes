import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  Package,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  XCircle,
  CalendarClock,
  Clock,
  TrendingUp,
  Boxes,
  PlusCircle,
  MinusCircle,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  ShoppingCart,
} from 'lucide-react';
import { formatRupiah, getExpiryStatus, getStockStatus } from '../../utils/helpers';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (tabId: string) => void;
}

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#f97316'];

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { items, stockIns, stockOuts, categories, currentUser } = useInventory();

  // 1. Stat cards calculation
  const totalJenisBarang = items.length;
  const totalStokFisik = items.reduce((sum, i) => sum + i.currentStock, 0);

  // Current month transactions (September 2026)
  const currentMonthPrefix = '2026-09';
  const barangMasukBulanIni = stockIns
    .filter((s) => s.date.startsWith(currentMonthPrefix))
    .reduce((sum, s) => sum + s.details.reduce((dSum, d) => dSum + d.quantity, 0), 0);

  const barangKeluarBulanIni = stockOuts
    .filter((s) => s.date.startsWith(currentMonthPrefix))
    .reduce((sum, s) => sum + s.details.reduce((dSum, d) => dSum + d.quantity, 0), 0);

  const barangStokMinimum = items.filter((i) => {
    const s = getStockStatus(i.currentStock, i.minimumStock);
    return s === 'MINIMUM';
  }).length;

  const barangHabis = items.filter((i) => i.currentStock <= 0).length;

  const barangMendekatiExpired = items.filter((i) => {
    if (i.currentStock <= 0) return false;
    const s = getExpiryStatus(i.expiryDate);
    return s === 'PERINGATAN' || s === 'SEGERA DIGUNAKAN';
  }).length;

  const barangExpired = items.filter((i) => {
    if (i.currentStock <= 0) return false;
    const s = getExpiryStatus(i.expiryDate);
    return s === 'EXPIRED';
  }).length;

  const totalNilaiPersediaan = items.reduce((sum, i) => sum + i.currentStock * i.price, 0);

  // 2. Chart: Trend per Month (Last 5 months)
  const months = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
  const monthlyData = months.map((m) => {
    const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(`${m}-01`));
    const inQty = stockIns
      .filter((s) => s.date.startsWith(m))
      .reduce((sum, s) => sum + s.details.reduce((dSum, d) => dSum + d.quantity, 0), 0);
    const outQty = stockOuts
      .filter((s) => s.date.startsWith(m))
      .reduce((sum, s) => sum + s.details.reduce((dSum, d) => dSum + d.quantity, 0), 0);

    return {
      month: monthLabel,
      Masuk: inQty,
      Keluar: outQty,
    };
  });

  // 3. Chart: Distribusi Kategori
  const categoryDistribution = categories
    .map((cat) => {
      const count = items.filter((i) => i.categoryId === cat.id).length;
      return {
        name: cat.name,
        value: count,
      };
    })
    .filter((c) => c.value > 0);

  // 4. Top barang paling banyak digunakan (based on stock out)
  const itemUsageMap: { [itemId: string]: number } = {};
  stockOuts.forEach((tr) => {
    tr.details.forEach((d) => {
      itemUsageMap[d.itemId] = (itemUsageMap[d.itemId] || 0) + Number(d.quantity);
    });
  });

  const topItems = Object.entries(itemUsageMap)
    .map(([itemId, totalQty]) => {
      const item = items.find((i) => i.id === itemId);
      return {
        name: item ? item.name : 'Unknown',
        code: item ? item.code : '-',
        totalQty,
      };
    })
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, 5);

  // 5. Inventory value by category
  const inventoryValueByCategory = categories
    .map((cat) => {
      const value = items
        .filter((i) => i.categoryId === cat.id)
        .reduce((sum, i) => sum + i.currentStock * i.price, 0);
      return {
        kategori: cat.name.length > 12 ? cat.name.substring(0, 10) + '...' : cat.name,
        fullName: cat.name,
        nilai: value,
      };
    })
    .filter((c) => c.nilai > 0);

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard Ringkasan Inventaris</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Pantau pergerakan stok, nilai persediaan, dan peringatan batas minimum secara terpusat.
          </p>
        </div>

        {/* Action buttons (respect role: pimpinan cannot do transactions) */}
        {currentUser.role !== 'pimpinan' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('surat-pesanan')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Surat Pesanan (PO)
            </button>
            <button
              onClick={() => onNavigate('surat-pengajuan')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Surat Pengajuan Pesanan
            </button>
            <button
              onClick={() => onNavigate('barang-masuk')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Input Barang Masuk
            </button>
            <button
              onClick={() => onNavigate('barang-keluar')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <MinusCircle className="w-4 h-4" />
              Input Barang Keluar
            </button>
          </div>
        )}
      </div>

      {/* 8 PRD Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Total jenis barang */}
        <div
          onClick={() => onNavigate('master-barang')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Jenis Barang</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{totalJenisBarang}</p>
          <p className="text-[11px] text-slate-400 mt-1">Item aktif terdaftar</p>
        </div>

        {/* 2. Total stok fisik */}
        <div
          onClick={() => onNavigate('stok')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Stok Fisik</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{totalStokFisik}</p>
          <p className="text-[11px] text-slate-400 mt-1">Kuantitas di seluruh gudang</p>
        </div>

        {/* 3. Masuk Bulan Berjalan */}
        <div
          onClick={() => onNavigate('barang-masuk')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Barang Masuk (Bln Ini)</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">+{barangMasukBulanIni}</p>
          <p className="text-[11px] text-slate-400 mt-1">Transaksi September 2026</p>
        </div>

        {/* 4. Keluar Bulan Berjalan */}
        <div
          onClick={() => onNavigate('barang-keluar')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-orange-300 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Barang Keluar (Bln Ini)</span>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-orange-600 mt-2">-{barangKeluarBulanIni}</p>
          <p className="text-[11px] text-slate-400 mt-1">Digunakan unit & laboratorium</p>
        </div>

        {/* 5. Stok Minimum */}
        <div
          onClick={() => onNavigate('stok')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            barangStokMinimum > 0
              ? 'bg-amber-50/60 border-amber-300 text-amber-900'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700">Stok Minimum</span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{barangStokMinimum}</p>
          <p className="text-[11px] text-amber-600/80 mt-1">Perlu pemesanan ulang (Re-order)</p>
        </div>

        {/* 6. Stok Habis */}
        <div
          onClick={() => onNavigate('stok')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            barangHabis > 0 ? 'bg-rose-50/60 border-rose-300 text-rose-900' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-700">Stok Habis (0)</span>
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-2">{barangHabis}</p>
          <p className="text-[11px] text-rose-600/80 mt-1">Stok kosong tidak dapat dikeluarkan</p>
        </div>

        {/* 7. Mendekati Expired (<90 hari) */}
        <div
          onClick={() => onNavigate('monitoring-expired')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-yellow-300 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Mendekati Expired</span>
            <div className="p-2 rounded-lg bg-yellow-50 text-yellow-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{barangMendekatiExpired}</p>
          <p className="text-[11px] text-slate-400 mt-1">Prioritas FEFO / uji segera</p>
        </div>

        {/* 8. Sudah Expired */}
        <div
          onClick={() => onNavigate('monitoring-expired')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            barangExpired > 0 ? 'bg-red-50/60 border-red-300 text-red-900' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-700">Barang Telah Expired</span>
            <div className="p-2 rounded-lg bg-red-100 text-red-700">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-700 mt-2">{barangExpired}</p>
          <p className="text-[11px] text-red-600/80 mt-1">Wajib karantina / pemusnahan</p>
        </div>
      </div>

      {/* Nilai Persediaan Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 backdrop-blur-xs rounded-xl text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-300">
              Estimasi Nilai Total Persediaan Fisik Gudang
            </span>
            <p className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {formatRupiah(totalNilaiPersediaan)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('laporan')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Buka Laporan Nilai Persediaan
          </button>
        </div>
      </div>

      {/* Charts Row 1: Trend Masuk/Keluar & Nilai Persediaan per Kategori */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Transaksi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Grafik Barang Masuk vs Barang Keluar</h3>
              <p className="text-xs text-slate-500">Perbandingan volume mutasi 5 bulan terakhir</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">Bulanan</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Masuk" fill="#10b981" radius={[4, 4, 0, 0]} name="Barang Masuk" />
                <Bar dataKey="Keluar" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Barang Keluar" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nilai Persediaan per Kategori */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Grafik Nilai Persediaan Berdasarkan Kategori</h3>
              <p className="text-xs text-slate-500">Total nilai stok (Rp) pada setiap rumpun barang</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-medium">Rupiah</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryValueByCategory} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(1)}M`}
                />
                <YAxis type="category" dataKey="kategori" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [formatRupiah(Number(value)), 'Nilai Stok']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="nilai" fill="#6366f1" radius={[0, 4, 4, 0]} name="Nilai Persediaan" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Top Barang Digunakan & Distribusi Kategori */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Barang yang Paling Banyak Digunakan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Top Barang Paling Sering Digunakan</h3>
              <p className="text-xs text-slate-500">Item dengan akumulasi pengeluaran tertinggi</p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium">Pengeluaran</span>
          </div>

          <div className="space-y-3.5">
            {topItems.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Belum ada transaksi barang keluar / pemakaian barang.
              </div>
            ) : (
              topItems.map((item, index) => {
                const maxVal = topItems[0]?.totalQty || 1;
                const percent = Math.min(100, Math.round((item.totalQty / maxVal) * 100));
                return (
                  <div key={item.code} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-[10px] text-slate-600 flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        <span className="text-slate-400 font-mono text-[10px]">({item.code})</span>
                      </div>
                      <span className="font-bold text-slate-700">{item.totalQty} unit keluar</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Distribusi Kategori Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Distribusi Barang Berdasarkan Kategori</h3>
              <p className="text-xs text-slate-500">Proporsi jenis barang terdaftar</p>
            </div>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} Item`, 'Jumlah']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
