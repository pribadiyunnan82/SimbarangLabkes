import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  Package,
  Bell,
  LogOut,
  ChevronDown,
  Cloud,
  AlertTriangle,
  Clock,
  User,
  Shield,
  RefreshCw,
  X,
  ExternalLink,
  ArrowLeftRight,
} from 'lucide-react';
import { getDaysUntilExpiry, getExpiryStatus, getStockStatus } from '../../utils/helpers';
import { CloudSyncModal } from '../common/CloudSyncModal';

interface NavbarProps {
  onNavigate: (tabId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const {
    currentUser,
    logout,
    items,
    isGoogleConnected,
    googleUser,
    cloudSyncStatus,
  } = useInventory();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showCloudSyncModal, setShowCloudSyncModal] = useState(false);

  // Compute stock alerts
  const expiredItems = items.filter(
    (i) => i.currentStock > 0 && getExpiryStatus(i.expiryDate) === 'EXPIRED'
  );
  const warningExpiryItems = items.filter(
    (i) =>
      i.currentStock > 0 &&
      (getExpiryStatus(i.expiryDate) === 'PERINGATAN' ||
        getExpiryStatus(i.expiryDate) === 'SEGERA DIGUNAKAN')
  );
  const lowStockItems = items.filter(
    (i) => getStockStatus(i.currentStock, i.minimumStock) !== 'AMAN'
  );

  const totalAlerts = expiredItems.length + warningExpiryItems.length + lowStockItems.length;

  const roleLabelMap: Record<string, { label: string; bg: string; text: string }> = {
    admin: { label: 'Administrator', bg: 'bg-purple-100 text-purple-700 border-purple-200', text: 'text-purple-700' },
    petugas: { label: 'Petugas Gudang', bg: 'bg-blue-100 text-blue-700 border-blue-200', text: 'text-blue-700' },
    pimpinan: { label: 'Pimpinan / Ka. Lab', bg: 'bg-amber-100 text-amber-700 border-amber-200', text: 'text-amber-700' },
  };

  const currentRole = currentUser ? roleLabelMap[currentUser.role] || { label: currentUser.role, bg: 'bg-slate-100 text-slate-700 border-slate-200', text: 'text-slate-700' } : null;

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs select-none">
        <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold text-slate-800 tracking-tight">
                    SIM-Inventaris
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    v2.5
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden md:block">
                  Sistem Manajemen Stok, Transaksi & Laporan
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google Drive Multi-Device Cloud Sync Button */}
            <button
              id="navbar-cloud-sync-btn"
              onClick={() => {
                setShowCloudSyncModal(true);
                setShowUserDropdown(false);
                setShowNotificationDropdown(false);
              }}
              title={
                isGoogleConnected
                  ? `Tersambung Google Drive: ${googleUser?.email || ''}`
                  : 'Hubungkan Google Drive untuk sinkronisasi antar perangkat'
              }
              className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                isGoogleConnected
                  ? 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-300 text-emerald-800 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              <div className="relative">
                <Cloud
                  className={`w-4 h-4 ${
                    isGoogleConnected ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                />
                {cloudSyncStatus === 'syncing' && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
                {isGoogleConnected && cloudSyncStatus !== 'syncing' && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                )}
              </div>
              <span className="hidden md:inline">
                {cloudSyncStatus === 'syncing'
                  ? 'Menyinkronkan...'
                  : isGoogleConnected
                  ? 'Cloud Drive Aktif'
                  : 'Cloud Sync'}
              </span>
            </button>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationDropdown(!showNotificationDropdown);
                  setShowUserDropdown(false);
                }}
                className={`p-2 rounded-xl border transition-all relative ${
                  totalAlerts > 0
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
                title="Pemberitahuan Peringatan Stok & Kadaluarsa"
              >
                <Bell className="w-4 h-4" />
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-bold rounded-full border-2 border-white shadow-xs">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-slate-700" />
                      <h4 className="text-xs font-bold text-slate-800">
                        Pemberitahuan Sistem ({totalAlerts})
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowNotificationDropdown(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2">
                    {totalAlerts === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        Tidak ada peringatan stok saat ini. Semua kondisi aman!
                      </div>
                    ) : (
                      <>
                        {expiredItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              onNavigate('monitoring-expired');
                              setShowNotificationDropdown(false);
                            }}
                            className="py-2.5 px-2 hover:bg-red-50/50 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <span className="p-1 rounded bg-red-100 text-red-700 mt-0.5 shrink-0">
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </span>
                              <div className="text-xs">
                                <p className="font-semibold text-slate-800">{item.name}</p>
                                <p className="text-red-600 text-[11px] font-medium">
                                  Sudah Expired ({item.expiryDate}) • Stok: {item.currentStock}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {warningExpiryItems.map((item) => {
                          const days = getDaysUntilExpiry(item.expiryDate);
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                onNavigate('monitoring-expired');
                                setShowNotificationDropdown(false);
                              }}
                              className="py-2.5 px-2 hover:bg-amber-50/50 rounded-lg cursor-pointer transition-colors"
                            >
                              <div className="flex items-start gap-2">
                                <span className="p-1 rounded bg-amber-100 text-amber-700 mt-0.5 shrink-0">
                                  <Clock className="w-3.5 h-3.5" />
                                </span>
                                <div className="text-xs">
                                  <p className="font-semibold text-slate-800">{item.name}</p>
                                  <p className="text-amber-700 text-[11px]">
                                    Mendekati Expired ({days} hari lagi) • Sisa: {item.currentStock}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {lowStockItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              onNavigate('stok');
                              setShowNotificationDropdown(false);
                            }}
                            className="py-2.5 px-2 hover:bg-orange-50/50 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <span className="p-1 rounded bg-orange-100 text-orange-700 mt-0.5 shrink-0">
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </span>
                              <div className="text-xs">
                                <p className="font-semibold text-slate-800">{item.name}</p>
                                <p className="text-orange-700 text-[11px]">
                                  Stok Minimum! Sisa: {item.currentStock} (Batas Min: {item.minimumStock})
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill & Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserDropdown(!showUserDropdown);
                    setShowNotificationDropdown(false);
                  }}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {currentRole?.label || currentUser.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 rounded-xl mb-1">
                      <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">@{currentUser.username}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${currentRole?.bg}`}
                        >
                          {currentRole?.label}
                        </span>
                        {currentUser.department && (
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[120px]">
                            {currentUser.department}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowCloudSyncModal(true);
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                    >
                      <Cloud className="w-4 h-4 text-blue-600" />
                      <span>Sinkronisasi Google Drive</span>
                    </button>

                    {isGoogleConnected && (
                      <button
                        onClick={() => {
                          setShowCloudSyncModal(true);
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors text-left"
                      >
                        <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                        <span>Ganti Akun Google Drive</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Cloud Drive Sync Modal */}
      <CloudSyncModal
        isOpen={showCloudSyncModal}
        onClose={() => setShowCloudSyncModal(false)}
      />
    </>
  );
};
