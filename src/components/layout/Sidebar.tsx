import React, { useState, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  MapPin,
  Truck,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  Archive,
  BookOpen,
  ClipboardCheck,
  Clock,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  Boxes,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  ShoppingCart,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse,
}) => {
  const { currentUser, items } = useInventory();

  // Internal collapse state with localStorage persistence if not controlled externally
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sim_sidebar_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const isCollapsed =
    controlledIsCollapsed !== undefined ? controlledIsCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('sim_sidebar_collapsed', String(next));
        } catch {}
        return next;
      });
    }
  };

  // Badges for quick alerts
  const expiredCount = items.filter(
    (i) => i.currentStock > 0 && new Date(i.expiryDate || '').getTime() <= Date.now()
  ).length;

  const lowStockCount = items.filter((i) => i.currentStock <= i.minimumStock).length;

  const userRole = currentUser?.role || 'petugas';

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none overflow-y-auto transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-18 p-2.5' : 'w-64 lg:w-72 p-4'
      }`}
    >
      <div className="space-y-5">
        {/* Minimize / Expand Toggle Header */}
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } pb-3 border-b border-slate-100`}
        >
          {!isCollapsed && (
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Menu Navigasi
            </span>
          )}
          <button
            onClick={toggleCollapse}
            title={isCollapsed ? 'Perluas Sidebar (Expand)' : 'Perkecil Sidebar (Minimize)'}
            aria-label={isCollapsed ? 'Perluas Sidebar' : 'Perkecil Sidebar'}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-blue-600" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Main Section */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Utama
            </p>
          )}
          <button
            onClick={() => onSelectTab('dashboard')}
            title="Dashboard Ringkasan"
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
            } rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Dashboard Ringkasan</span>}
          </button>
        </div>

        {/* Master Data */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Master Data
            </p>
          )}
          <div className="space-y-1">
            <button
              onClick={() => onSelectTab('master-barang')}
              title={`Master Barang (${items.length} item)`}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'justify-between px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'master-barang'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-slate-500 shrink-0" />
                {!isCollapsed && <span>Master Barang</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                  {items.length}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('master-kategori')}
              title="Kategori Barang"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'master-kategori'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-500 shrink-0" />
              {!isCollapsed && <span>Kategori Barang</span>}
            </button>

            <button
              onClick={() => onSelectTab('master-satuan')}
              title="Satuan Ukur"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'master-satuan'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Boxes className="w-4 h-4 text-slate-500 shrink-0" />
              {!isCollapsed && <span>Satuan Ukur</span>}
            </button>

            <button
              onClick={() => onSelectTab('master-lokasi')}
              title="Lokasi & Rak Gudang"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'master-lokasi'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              {!isCollapsed && <span>Lokasi & Rak Gudang</span>}
            </button>

            <button
              onClick={() => onSelectTab('master-supplier')}
              title="Data Supplier (Pemasok)"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'master-supplier'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4 text-slate-500 shrink-0" />
              {!isCollapsed && <span>Data Supplier (Pemasok)</span>}
            </button>

            <button
              onClick={() => onSelectTab('master-departemen')}
              title="Departemen & Pemohon"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'master-departemen'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              {!isCollapsed && <span>Departemen & Pemohon</span>}
            </button>
          </div>
        </div>

        {/* Transaksi Stok */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Transaksi Stok
            </p>
          )}
          <div className="space-y-1">
            <button
              onClick={() => onSelectTab('barang-masuk')}
              title="Barang Masuk (Inbound)"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'barang-masuk'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-600 shrink-0" />
              {!isCollapsed && <span>Barang Masuk (Inbound)</span>}
            </button>

            <button
              onClick={() => onSelectTab('barang-keluar')}
              title="Barang Keluar (Outbound)"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'barang-keluar'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-orange-600 shrink-0" />
              {!isCollapsed && <span>Barang Keluar (Outbound)</span>}
            </button>

            <button
              onClick={() => onSelectTab('penyesuaian-stok')}
              title="Penyesuaian Stok (Adj)"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'penyesuaian-stok'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4 text-indigo-600 shrink-0" />
              {!isCollapsed && <span>Penyesuaian Stok (Adj)</span>}
            </button>

            <button
              onClick={() => onSelectTab('surat-pengajuan')}
              title="Surat Pengajuan Pesanan (Permohonan Alat Habis Pakai)"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'surat-pengajuan'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              {!isCollapsed && <span>Surat Pengajuan Pesanan</span>}
            </button>

            <button
              onClick={() => onSelectTab('surat-pesanan')}
              title="Surat Pesanan (PO ke Rekanan Supplier)"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'surat-pesanan'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-emerald-600 shrink-0" />
              {!isCollapsed && <span>Surat Pesanan (PO)</span>}
            </button>
          </div>
        </div>

        {/* Manajemen Stok */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Kontrol & Monitoring
            </p>
          )}
          <div className="space-y-1">
            <button
              onClick={() => onSelectTab('stok')}
              title={`Stok Real-Time ${lowStockCount > 0 ? `(${lowStockCount} batas minimum)` : ''}`}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2 relative' : 'justify-between px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'stok'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Archive className="w-4 h-4 text-slate-500 shrink-0" />
                {!isCollapsed && <span>Stok Real-Time</span>}
              </div>
              {lowStockCount > 0 && (
                <span
                  className={`${
                    isCollapsed
                      ? 'absolute top-1 right-1.5 w-2 h-2 rounded-full bg-amber-500'
                      : 'text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700'
                  }`}
                >
                  {!isCollapsed && lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('kartu-stok')}
              title="Buku Kartu Stok"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'kartu-stok'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
              {!isCollapsed && <span>Buku Kartu Stok</span>}
            </button>

            <button
              onClick={() => onSelectTab('stock-opname')}
              title="Stock Opname Fisik"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'stock-opname'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-slate-500 shrink-0" />
              {!isCollapsed && <span>Stock Opname Fisik</span>}
            </button>

            <button
              onClick={() => onSelectTab('monitoring-expired')}
              title={`Monitoring Kadaluarsa ${expiredCount > 0 ? `(${expiredCount} kadaluarsa)` : ''}`}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2 relative' : 'justify-between px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'monitoring-expired'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                {!isCollapsed && <span>Monitoring Kadaluarsa</span>}
              </div>
              {expiredCount > 0 && (
                <span
                  className={`${
                    isCollapsed
                      ? 'absolute top-1 right-1.5 w-2 h-2 rounded-full bg-red-500'
                      : 'text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-100 text-red-700'
                  }`}
                >
                  {!isCollapsed && expiredCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Laporan */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Laporan
            </p>
          )}
          <button
            onClick={() => onSelectTab('laporan')}
            title="Laporan & Ekspor (.xlsx)"
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
            } rounded-xl text-xs font-medium transition-all ${
              activeTab === 'laporan'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            {!isCollapsed && <span>Laporan & Ekspor (.xlsx)</span>}
          </button>
        </div>

        {/* Pengaturan & Akses */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Administrasi
            </p>
          )}
          <div className="space-y-1">
            {userRole === 'admin' && (
              <button
                onClick={() => onSelectTab('users')}
                title="Manajemen Pengguna"
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
                } rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'users'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-purple-600 shrink-0" />
                {!isCollapsed && <span>Manajemen Pengguna</span>}
              </button>
            )}

            <button
              onClick={() => onSelectTab('audit')}
              title="Audit Trail (Log Aktivitas)"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
              } rounded-xl text-xs font-medium transition-all ${
                activeTab === 'audit'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
              {!isCollapsed && <span>Audit Trail (Log Aktivitas)</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        {isCollapsed ? 'SIM' : 'SIM-Inventaris \u00a9 2026'}
      </div>
    </aside>
  );
};
