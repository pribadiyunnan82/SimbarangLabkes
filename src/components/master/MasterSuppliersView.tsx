import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Supplier } from '../../types/inventory';
import { Truck, Plus, Edit, Trash2, Search, X, Check, AlertCircle, Phone, Mail, User } from 'lucide-react';

export const MasterSuppliersView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, currentUser } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSup, setEditingSup] = useState<Supplier | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    contactPerson: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  });

  const canEdit = currentUser?.role === 'admin';

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingSup(null);
    setErrorMessage('');
    setFormData({
      code: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`,
      name: '',
      address: '',
      phone: '',
      email: '',
      contactPerson: '',
      description: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sup: Supplier) => {
    setEditingSup(sup);
    setErrorMessage('');
    setFormData({
      code: sup.code,
      name: sup.name,
      address: sup.address,
      phone: sup.phone,
      email: sup.email,
      contactPerson: sup.contactPerson,
      description: sup.description,
      status: sup.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      setErrorMessage('Kode dan Nama Supplier wajib diisi.');
      return;
    }

    if (editingSup) {
      updateSupplier(editingSup.id, formData);
    } else {
      addSupplier(formData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Hapus supplier "${name}"?`)) {
      const res = deleteSupplier(id);
      if (!res.success) alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Master Data Supplier / Pemasok</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Daftar distributor reagen, bahan kimia, perlengkapan medis, dan manufaktur bersertifikasi.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Tambah Supplier
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama supplier, kode, kontak..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">Total: {suppliers.length} Supplier</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Kode</th>
              <th className="px-4 py-3">Nama Perusahaan</th>
              <th className="px-4 py-3">Kontak Person</th>
              <th className="px-4 py-3">No. Telepon & Email</th>
              <th className="px-4 py-3">Alamat</th>
              <th className="px-4 py-3 text-center">Status</th>
              {canEdit && <th className="px-4 py-3 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSuppliers.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono font-bold text-blue-600">{s.code}</td>
                <td className="px-4 py-3">
                  <span className="font-bold text-slate-800">{s.name}</span>
                  {s.description && <p className="text-[11px] text-slate-400 mt-0.5">{s.description}</p>}
                </td>
                <td className="px-4 py-3 font-medium text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.contactPerson || '-'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 space-y-0.5 text-[11px]">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{s.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{s.email || '-'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate" title={s.address}>
                  {s.address || '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {s.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                {canEdit && (
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-md"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  {editingSup ? 'Edit Supplier' : 'Tambah Supplier Baru'}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Supplier</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="SUP-001"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person (PIC)</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Nama PIC Sales"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Supplier / PT</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="PT Kimia Farma Trading & Distribution"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="021-3847709"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alamat Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sales@perusahaan.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Kantor / Gudang</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan Produk</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Distributor reagen diagnostik kimia klinik"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
