import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { UserRole } from '../../types/inventory';
import {
  Lock,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Package,
  ArrowRight,
  UserPlus,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  LogIn,
  BadgeCheck,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { users, login, registerInitialAdmin, registerUser, loginWithGoogleDrive } = useInventory();

  // Mode: 'login' | 'register'
  const isInitialSetup = users.length === 0;
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    isInitialSetup ? 'register' : 'login'
  );

  // Google Drive state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleFeedback, setGoogleFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleGoogleDriveLogin = async () => {
    setIsGoogleLoading(true);
    setGoogleFeedback(null);
    try {
      const res = await loginWithGoogleDrive();
      if (!res.success) {
        setGoogleFeedback({ type: 'error', message: res.message });
      } else {
        setGoogleFeedback({ type: 'success', message: res.message });
      }
    } catch (err: any) {
      setGoogleFeedback({
        type: 'error',
        message: err.message || 'Terjadi kesalahan saat masuk dengan Google Drive.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('petugas');
  const [regDepartment, setRegDepartment] = useState('Gudang Utama & Logistik');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername.trim()) {
      setLoginError('ID Username wajib diisi');
      return;
    }
    if (!loginPassword) {
      setLoginError('Password wajib diisi');
      return;
    }

    const result = login(loginUsername.trim(), loginPassword);
    if (!result.success) {
      setLoginError(result.message || 'ID Username atau Password tidak sesuai');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim()) {
      setRegError('Nama Lengkap wajib diisi');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('ID Username wajib diisi');
      return;
    }
    if (regUsername.trim().length < 3) {
      setRegError('ID Username minimal 3 karakter');
      return;
    }
    if (!regPassword) {
      setRegError('Password wajib diisi');
      return;
    }
    if (regPassword.length < 4) {
      setRegError('Password minimal 4 karakter');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi Password tidak sesuai');
      return;
    }

    // If first user, register as Initial Admin
    if (isInitialSetup) {
      const result = registerInitialAdmin({
        name: regName.trim(),
        username: regUsername.trim().toLowerCase(),
        password: regPassword,
        email: regEmail.trim() || `${regUsername.trim().toLowerCase()}@inventaris.local`,
        phone: regPhone.trim(),
        department: regDepartment.trim() || 'Logistik & Gudang',
      });

      if (!result.success) {
        setRegError(result.message || 'Gagal mendaftarkan akun administrator');
      }
      return;
    }

    // Subsequent user registration
    const result = registerUser({
      name: regName.trim(),
      username: regUsername.trim().toLowerCase(),
      password: regPassword,
      role: regRole,
      department: regDepartment.trim() || 'Logistik & Gudang',
      email: regEmail.trim(),
      phone: regPhone.trim(),
    });

    if (result.success) {
      setRegSuccess(`Akun "${regUsername.trim().toLowerCase()}" berhasil dibuat! Silakan masuk.`);
      setLoginUsername(regUsername.trim().toLowerCase());
      setLoginPassword('');
      // Reset form
      setRegName('');
      setRegUsername('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegEmail('');
      setRegPhone('');
      // Switch to Login Tab after short notice
      setTimeout(() => {
        setActiveTab('login');
      }, 1200);
    } else {
      setRegError(result.message || 'Gagal membuat akun baru');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-8 select-none">
      <div className="w-full max-w-md">
        {/* App Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-3">
            <Package className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sistem Manajemen Inventaris</h1>
          <p className="text-xs text-slate-400 mt-1">
            Portal Akses & Pengendalian Persediaan Barang
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Tab Navigation: Separating Login and Account Registration */}
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/80 p-1.5">
            <button
              id="tab-login-btn"
              type="button"
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
              }}
              disabled={isInitialSetup}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk (Log In)</span>
            </button>

            <button
              id="tab-register-btn"
              type="button"
              onClick={() => {
                setActiveTab('register');
                setRegError('');
                setRegSuccess('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Buat Akun Baru</span>
            </button>
          </div>

          <div className="p-6 md:p-7">
            {/* ========================================================= */}
            {/* VIEW 1: MASUK (LOG IN)                                    */}
            {/* ========================================================= */}
            {activeTab === 'login' && (
              <div>
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Masuk ke Akun Anda</h2>
                    <p className="text-xs text-slate-500">Masukkan ID Username dan Password</p>
                  </div>
                </div>

                {regSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                {/* Google Drive Multi-Device Login Button */}
                <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100 shadow-xs">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      ☁️ Cloud Sync Multi-Device
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    Masuk dengan Google Drive untuk otomatis menyinkronkan seluruh database inventaris di komputer, laptop, dan smartphone Anda.
                  </p>

                  <button
                    id="google-drive-login-btn"
                    type="button"
                    onClick={handleGoogleDriveLogin}
                    disabled={isGoogleLoading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:border-slate-400 active:scale-[0.99]"
                  >
                    {isGoogleLoading ? (
                      <div className="flex items-center gap-2 text-blue-600">
                        <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Menghubungkan ke Google Drive...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-4 h-4 shrink-0" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        </svg>
                        <span>Masuk dengan Google Drive</span>
                      </>
                    )}
                  </button>

                  {googleFeedback && (
                    <div
                      className={`mt-3 p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                        googleFeedback.type === 'success'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border border-rose-200 text-rose-700'
                      }`}
                    >
                      {googleFeedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <span>{googleFeedback.message}</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="relative flex py-1 items-center mb-4">
                  <div className="grow border-t border-slate-200"></div>
                  <span className="shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    atau masuk dengan username
                  </span>
                  <div className="grow border-t border-slate-200"></div>
                </div>

                {loginError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ID Username <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        id="login-username"
                        type="text"
                        placeholder="Contoh: admin atau nama_user"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        required
                        autoFocus
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="w-full pl-9 pr-10 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                        title={showLoginPassword ? 'Sembunyikan password' : 'Lihat password'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="login-submit-btn"
                    type="submit"
                    className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Masuk ke Sistem</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500">
                    Belum memiliki akun?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('register');
                        setRegError('');
                      }}
                      className="text-blue-600 hover:text-blue-800 font-bold underline decoration-blue-300 underline-offset-2 cursor-pointer"
                    >
                      Daftar Akun Baru
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 2: BUAT AKUN BARU (REGISTER)                         */}
            {/* ========================================================= */}
            {activeTab === 'register' && (
              <div>
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                    {isInitialSetup ? <ShieldCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">
                      {isInitialSetup ? 'Registrasi Admin Utama' : 'Pendaftaran Akun Baru'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isInitialSetup
                        ? 'Database bersih. Daftarkan akun administrator pertama.'
                        : 'Lengkapi identitas untuk membuat akun sistem inventaris'}
                    </p>
                  </div>
                </div>

                {isInitialSetup && (
                  <div className="mb-5 space-y-3">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-200/80 shadow-xs">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          ☁️ Masuk dari Perangkat Lain?
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                        Jika Anda sudah memiliki data inventaris di Google Drive dari laptop atau HP lain, Anda tidak perlu mendaftar ulang. Cukup masuk dengan Google Drive untuk memuat semua data secara otomatis.
                      </p>

                      <button
                        id="reg-google-drive-login-btn"
                        type="button"
                        onClick={handleGoogleDriveLogin}
                        disabled={isGoogleLoading}
                        className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:border-slate-400 active:scale-[0.99]"
                      >
                        {isGoogleLoading ? (
                          <div className="flex items-center gap-2 text-blue-600">
                            <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Menyinkronkan dari Google Drive...</span>
                          </div>
                        ) : (
                          <>
                            <svg className="w-4 h-4 shrink-0" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            </svg>
                            <span>Tarik Database dari Google Drive</span>
                          </>
                        )}
                      </button>

                      {googleFeedback && (
                        <div
                          className={`mt-3 p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                            googleFeedback.type === 'success'
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                              : 'bg-rose-50 border border-rose-200 text-rose-700'
                          }`}
                        >
                          {googleFeedback.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          )}
                          <span>{googleFeedback.message}</span>
                        </div>
                      )}
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="grow border-t border-slate-200"></div>
                      <span className="shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        atau daftar admin offline baru
                      </span>
                      <div className="grow border-t border-slate-200"></div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Akun pertama ini otomatis menjadi <strong>Administrator Utama</strong>.</span>
                    </div>
                  </div>
                )}

                {regError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        id="reg-name"
                        type="text"
                        placeholder="Contoh: Ahmad Rizky, S.T."
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ID Username <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="text-slate-400 font-mono text-xs absolute left-3.5 top-2.5">@</span>
                      <input
                        id="reg-username"
                        type="text"
                        placeholder="ahmadrizky"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                        required
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Huruf kecil tanpa spasi, digunakan untuk login.</p>
                  </div>

                  {/* Role Selection (Only shown when not initial setup) */}
                  {!isInitialSetup && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Hak Akses / Role <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="reg-role"
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="petugas">Petugas Gudang (Operasional & Transaksi)</option>
                        <option value="admin">Administrator (Akses Penuh & Master Data)</option>
                        <option value="pimpinan">Pimpinan (Monitoring & Laporan Eksekutif)</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Departemen / Unit Kerja
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        id="reg-dept"
                        type="text"
                        placeholder="Gudang Logistik / Unit Operasional"
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          id="reg-password"
                          type={showRegPassword ? 'text' : 'password'}
                          placeholder="Min. 4 karakter"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ulangi Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          id="reg-confirm-password"
                          type={showRegPassword ? 'text' : 'password'}
                          placeholder="Ulangi password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          required
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1.5 focus:outline-hidden cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showRegPassword ? 'Sembunyikan' : 'Tampilkan'} Password</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Opsional)</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          id="reg-email"
                          type="email"
                          placeholder="user@inventaris.id"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">No. HP / WA (Opsional)</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          id="reg-phone"
                          type="tel"
                          placeholder="08123456789"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    id="register-submit-btn"
                    type="submit"
                    className="w-full mt-3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isInitialSetup ? 'Daftarkan Admin & Masuk' : 'Daftarkan Akun Baru'}</span>
                  </button>
                </form>

                {!isInitialSetup && (
                  <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500">
                      Sudah memiliki akun terdaftar?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('login');
                          setLoginError('');
                        }}
                        className="text-blue-600 hover:text-blue-800 font-bold underline decoration-blue-300 underline-offset-2 cursor-pointer"
                      >
                        Masuk ke Akun
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>© 2026 Sistem Inventaris Gudang • Autentikasi Mandiri & Terpadu</p>
        </div>
      </div>
    </div>
  );
};
