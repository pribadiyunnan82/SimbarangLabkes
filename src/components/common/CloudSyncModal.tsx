import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  Cloud,
  CloudCheck,
  RefreshCw,
  Laptop,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  X,
  UploadCloud,
  DownloadCloud,
  ShieldCheck,
  ExternalLink,
  LogOut,
  Info,
  ArrowLeftRight,
  UserCheck,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    isGoogleConnected,
    googleUser,
    cloudSyncStatus,
    lastCloudSyncTime,
    lastSyncedDevice,
    autoSyncEnabled,
    setAutoSyncEnabled,
    loginWithGoogleDrive,
    switchGoogleDriveAccount,
    syncToGoogleDrive,
    syncFromGoogleDrive,
    disconnectGoogleDrive,
    items,
    stockIns,
    stockOuts,
    users,
  } = useInventory();

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Confirmation dialogs per Workspace Integration security guidelines
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    actionType: 'upload' | 'download' | 'disconnect' | 'switch_account';
  } | null>(null);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await loginWithGoogleDrive();
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Gagal menghubungkan Google Drive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openUploadConfirm = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Unggah & Perbarui Data ke Google Drive?',
      description: `Tindakan ini akan mengunggah snapshot inventaris terkini (${items.length} master barang, ${stockIns.length} barang masuk, ${stockOuts.length} barang keluar) ke berkas "sim_inventory_cloud_sync.json" di Google Drive akun ${googleUser?.email || ''}. Perangkat lain akan menerima data ini saat melakukan sinkronisasi.`,
      actionLabel: 'Ya, Unggah ke Drive',
      actionType: 'upload',
    });
  };

  const openDownloadConfirm = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Tarik & Timpa Data dari Google Drive?',
      description: `Tindakan ini akan mengunduh dan menimpa database inventaris di perangkat lokal ini dengan salinan terbaru dari Google Drive akun ${googleUser?.email || ''}. Pastikan semua perubahan lokal sudah tersimpan jika tidak ingin ditimpa.`,
      actionLabel: 'Ya, Tarik Data Terbaru',
      actionType: 'download',
    });
  };

  const openDisconnectConfirm = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Putuskan Koneksi Google Drive?',
      description: `Akun Google Drive (${googleUser?.email || ''}) akan diputus dari perangkat ini. Data inventaris yang ada di perangkat ini tetap tersimpan secara lokal dan berkas di Google Drive Anda tetap aman.`,
      actionLabel: 'Ya, Putuskan Koneksi',
      actionType: 'disconnect',
    });
  };

  const openSwitchAccountConfirm = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Ganti Akun Google Drive?',
      description: `Anda saat ini terhubung dengan akun Google (${googleUser?.email || ''}). Jendela pemilihan akun Google akan terbuka sehingga Anda dapat beralih ke akun Google lain untuk sinkronisasi database inventaris multi-perangkat.`,
      actionLabel: 'Pilih Akun Lain',
      actionType: 'switch_account',
    });
  };

  const executeConfirmedAction = async () => {
    if (!confirmDialog) return;
    const { actionType } = confirmDialog;
    setConfirmDialog(null);
    setIsLoading(true);
    setFeedback(null);

    try {
      if (actionType === 'upload') {
        const res = await syncToGoogleDrive(true);
        if (res.success) {
          setFeedback({ type: 'success', message: res.message });
        } else {
          setFeedback({ type: 'error', message: res.message });
        }
      } else if (actionType === 'download') {
        const res = await syncFromGoogleDrive(true);
        if (res.success) {
          setFeedback({ type: 'success', message: res.message });
        } else {
          setFeedback({ type: 'error', message: res.message });
        }
      } else if (actionType === 'disconnect') {
        await disconnectGoogleDrive();
        setFeedback({ type: 'success', message: 'Koneksi Google Drive berhasil diputuskan.' });
      } else if (actionType === 'switch_account') {
        const res = await switchGoogleDriveAccount();
        if (res.success) {
          setFeedback({ type: 'success', message: res.message });
        } else {
          setFeedback({ type: 'error', message: res.message });
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operasi gagal dijalankan.' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatSyncTime = (isoString: string | null) => {
    if (!isoString) return 'Belum pernah disinkronkan';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString('id-ID')} pukul ${d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Sinkronisasi Cloud Drive Multi-Device</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Akses database inventaris dari berbagai perangkat (laptop, tablet, HP)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Notification Feedback */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">{feedback.message}</div>
            </div>
          )}

          {/* Connection Status Card */}
          {isGoogleConnected && googleUser ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt={googleUser.displayName}
                      className="w-11 h-11 rounded-full border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {googleUser.displayName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-800">{googleUser.displayName}</p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Terhubung
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">{googleUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={openSwitchAccountConfirm}
                    disabled={isLoading}
                    className="px-2.5 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-medium disabled:opacity-50"
                    title="Beralih ke akun Google Drive lain"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                    Ganti Akun
                  </button>
                  <button
                    onClick={openDisconnectConfirm}
                    disabled={isLoading}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-medium disabled:opacity-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Putuskan
                  </button>
                </div>
              </div>

              {/* Sync Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                  <p className="text-[11px] text-slate-400 font-medium">Sinkronisasi Terakhir</p>
                  <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${cloudSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                    {formatSyncTime(lastCloudSyncTime)}
                  </p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                  <p className="text-[11px] text-slate-400 font-medium">Perangkat Terakhir Mengubah</p>
                  <p className="font-semibold text-slate-800 mt-0.5 truncate flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                    {lastSyncedDevice || 'Perangkat Ini'}
                  </p>
                </div>
              </div>

              {/* Auto Sync Toggle */}
              <div className="pt-2 flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/70">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Mode Auto-Sync Otomatis</p>
                  <p className="text-[11px] text-slate-500">
                    Otomatis menyimpan perubahan data ke Google Drive saat ada transaksi
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSyncEnabled}
                    onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs mx-auto flex items-center justify-center text-blue-600">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Belum Terhubung ke Google Drive</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Hubungkan akun Google Drive Anda untuk mulai menyimpan cadangan awan dan menyinkronkan data antar laptop, komputer kantor, tablet, dan smartphone secara real-time.
                </p>
              </div>
              <button
                type="button"
                onClick={handleConnect}
                disabled={isLoading}
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Menghubungkan...
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    Hubungkan ke Google Drive Sekarang
                  </>
                )}
              </button>
            </div>
          )}

          {/* Sync Actions (Upload / Download) */}
          {isGoogleConnected && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Upload Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 mb-1.5">
                    <UploadCloud className="w-5 h-5" />
                    <h5 className="font-bold text-xs text-slate-800">Unggah ke Drive (Upload)</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Kirim data inventaris dari perangkat ini ke file cadangan Google Drive Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openUploadConfirm}
                  disabled={isLoading}
                  className="mt-3 w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  <UploadCloud className="w-4 h-4" />
                  Simpan ke Cloud
                </button>
              </div>

              {/* Download Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
                    <DownloadCloud className="w-5 h-5" />
                    <h5 className="font-bold text-xs text-slate-800">Tarik dari Drive (Download)</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Perbarui perangkat ini dengan data terbaru yang baru diinput di laptop atau HP lain.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openDownloadConfirm}
                  disabled={isLoading}
                  className="mt-3 w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  <DownloadCloud className="w-4 h-4" />
                  Perbarui dari Cloud
                </button>
              </div>
            </div>
          )}

          {/* Multi-Device Guide Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700">
            <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
              <Info className="w-4 h-4" />
              <span>Cara Mengakses di Berbagai Perangkat (Multi-Device)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
              <li>
                Buka tautan website aplikasi inventaris ini di browser perangkat lain (contoh: HP, tablet, atau laptop kantor).
              </li>
              <li>
                Di halaman login perangkat baru, klik tombol <strong>"Masuk dengan Google Drive"</strong>.
              </li>
              <li>
                Pilih akun Google Drive yang sama ({googleUser?.email || 'akun Google Anda'}).
              </li>
              <li>
                Sistem akan secara instan mengunduh seluruh data inventaris dan menyinkronkan perubahan secara otomatis!
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Confirmation Modal Dialog for Destructive / Overwrite Operations */}
      {confirmDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  confirmDialog.actionType === 'disconnect'
                    ? 'bg-rose-100 text-rose-700'
                    : confirmDialog.actionType === 'switch_account'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {confirmDialog.actionType === 'switch_account' ? (
                  <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-800">{confirmDialog.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {confirmDialog.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors cursor-pointer ${
                  confirmDialog.actionType === 'disconnect'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {confirmDialog.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
