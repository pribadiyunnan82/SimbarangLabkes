import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { User, UserRole } from '../../types/inventory';
import { Users, Plus, Edit, Trash2, Search, X, Check, ShieldCheck, AlertCircle, Phone, Mail } from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    role: 'petugas' as UserRole,
    email: '',
    phone: '',
    department: 'Gudang & Logistik',
    status: 'active' as 'active' | 'inactive',
  });

  const canManage = currentUser?.role === 'admin';

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingUser(null);
    setErrorMessage('');
    setFormData({
      username: '',
      name: '',
      password: '',
      role: 'petugas',
      email: '',
      phone: '',
      department: 'Gudang & Logistik',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setErrorMessage('');
    setFormData({
      username: u.username,
      name: u.name,
      password: '',
      role: u.role,
      email: u.email,
      phone: u.phone,
      department: u.department,
      status: u.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.name.trim()) {
      setErrorMessage('Username dan Nama Lengkap wajib diisi.');
      return;
    }

    if (!editingUser && !formData.password) {
      setErrorMessage('Password wajib diisi untuk pengguna baru.');
      return;
    }

    if (editingUser) {
      const updateData: Partial<User> = {
        username: formData.username.trim(),
        name: formData.name.trim(),
        role: formData.role,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        status: formData.status,
      };
      if (formData.password.trim()) {
        updateData.password = formData.password.trim();
      }
      updateUser(editingUser.id, updateData);
    } else {
      addUser({
        username: formData.username.trim(),
        name: formData.name.trim(),
        password: formData.password.trim(),
        role: formData.role,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        status: formData.status,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (currentUser && id === currentUser.id) {
      alert('Tidak dapat menghapus akun pengguna yang sedang aktif digunakan.');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${name}"?`)) {
      const res = deleteUser(id);
      if (!res.success) alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Manajemen Pengguna (User Management)</h2>
            <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-semibold border border-purple-200">
              Role-Based Access Control (RBAC)
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola hak akses untuk Administrator (Akses Penuh), Petugas Gudang (Operasional), dan Kepala/Pimpinan
            (Laporan).
          </p>
        </div>

        {canManage ? (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengguna Baru
          </button>
        ) : (
          <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg border">
            Hanya Administrator yang dapat mengelola akun pengguna
          </span>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, username, atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">Total: {users.length} Akun Terdaftar</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Nama & Username</th>
              <th className="px-4 py-3 text-center">Peran / Hak Akses (Role)</th>
              <th className="px-4 py-3">Unit / Bagian</th>
              <th className="px-4 py-3">Kontak Email & Telp</th>
              <th className="px-4 py-3 text-center">Status</th>
              {canManage && <th className="px-4 py-3 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((u) => {
              return (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">{u.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">@{u.username}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : u.role === 'petugas'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {u.role === 'admin'
                        ? 'Administrator'
                        : u.role === 'petugas'
                        ? 'Petugas Gudang'
                        : 'Kepala / Pimpinan'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-700 font-medium">{u.department}</td>

                  <td className="px-4 py-3 space-y-0.5 text-[11px]">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{u.email}</span>
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{u.phone}</span>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>

                  {canManage && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-md"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          disabled={u.id === currentUser.id}
                          className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-md disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal User Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-purple-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-700" />
                <h3 className="font-bold text-slate-800 text-sm">
                  {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username Login</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/\s+/g, '').toLowerCase() })}
                  placeholder="johndoe"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Password {editingUser ? '(Kosongkan jika tidak diubah)' : '*'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? 'Masukkan password baru jika ingin mengubah' : 'Password login akun...'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe, A.Md.AK"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Peran (Role RBAC)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="admin">Administrator (Hak Akses Penuh)</option>
                  <option value="petugas">Petugas Gudang (Input Transaksi & Opname)</option>
                  <option value="pimpinan">Kepala / Pimpinan (Monitoring & Laporan Saja)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit / Departemen</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Logistik Laboratorium"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@lab.rs.id"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08123456789"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Akun</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
