import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Item, ItemStatus } from '../../types/inventory';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertCircle,
  Eye,
  Check,
  X,
  QrCode,
  Thermometer,
  FileCheck,
  Calendar,
} from 'lucide-react';
import { formatRupiah, formatDate, getStockStatus, getExpiryStatus } from '../../utils/helpers';

export const MasterItemsView: React.FC = () => {
  const { items, categories, units, locations, suppliers, addItem, updateItem, deleteItem, currentUser } =
    useInventory();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    unitId: '',
    locationId: '',
    supplierId: '',
    minimumStock: 5,
    maximumStock: 50,
    price: 0,
    currentStock: 0,
    status: 'Aktif' as ItemStatus,
    description: '',
    // Lab fields
    batchNumber: '',
    manufacturer: '',
    productionDate: '',
    expiryDate: '',
    storageCondition: '',
    storageTemp: '',
    certificateNumber: '',
  });

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'petugas';
  const canDelete = currentUser?.role === 'admin';

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.batchNumber && item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
      const matchLoc = selectedLocation === 'ALL' || item.locationId === selectedLocation;
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      return matchSearch && matchCat && matchLoc && matchStatus;
    });
  }, [items, searchTerm, selectedCategory, selectedLocation, selectedStatus]);

  const openAddModal = () => {
    setEditingItem(null);
    setErrorMessage('');
    setFormData({
      code: `BRG-${String(items.length + 1).padStart(3, '0')}`,
      name: '',
      categoryId: categories[0]?.id || '',
      unitId: units[0]?.id || '',
      locationId: locations[0]?.id || '',
      supplierId: suppliers[0]?.id || '',
      minimumStock: 5,
      maximumStock: 50,
      price: 100000,
      currentStock: 10,
      status: 'Aktif',
      description: '',
      batchNumber: '',
      manufacturer: '',
      productionDate: '',
      expiryDate: '',
      storageCondition: 'Suhu Ruang (15°C - 25°C)',
      storageTemp: '15°C - 25°C',
      certificateNumber: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setErrorMessage('');
    setFormData({
      code: item.code,
      name: item.name,
      categoryId: item.categoryId,
      unitId: item.unitId,
      locationId: item.locationId,
      supplierId: item.supplierId,
      minimumStock: item.minimumStock,
      maximumStock: item.maximumStock,
      price: item.price,
      currentStock: item.currentStock,
      status: item.status,
      description: item.description,
      batchNumber: item.batchNumber || '',
      manufacturer: item.manufacturer || '',
      productionDate: item.productionDate || '',
      expiryDate: item.expiryDate || '',
      storageCondition: item.storageCondition || '',
      storageTemp: item.storageTemp || '',
      certificateNumber: item.certificateNumber || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.code.trim() || !formData.name.trim()) {
      setErrorMessage('Kode dan Nama Barang wajib diisi!');
      return;
    }

    if (editingItem) {
      const res = updateItem(editingItem.id, formData);
      if (!res.success) {
        setErrorMessage(res.message || 'Gagal menyimpan perubahan');
        return;
      }
    } else {
      const res = addItem(formData);
      if (!res.success) {
        setErrorMessage(res.message || 'Gagal menambah barang baru');
        return;
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data barang "${name}"?`)) {
      const res = deleteItem(id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Master Data Barang</h2>
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">
              {filteredItems.length} dari {items.length} Barang
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola katalog barang, reagen laboratorium, batas stok, harga, dan parameter penyimpanan.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Tambah Data Barang
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, kode, atau batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Kategori Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Lokasi Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Semua Lokasi</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Habis">Habis</option>
            <option value="Quarantine">Quarantine</option>
            <option value="Expired">Expired</option>
            <option value="Rusak">Rusak</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Kode & Nama Barang</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Lokasi Simpan</th>
                <th className="px-4 py-3 text-right">Stok Fisik</th>
                <th className="px-4 py-3 text-center">Min / Max</th>
                <th className="px-4 py-3 text-right">Harga Satuan</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Expired / Batch</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada data barang yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const cat = categories.find((c) => c.id === item.categoryId);
                  const unt = units.find((u) => u.id === item.unitId);
                  const loc = locations.find((l) => l.id === item.locationId);
                  const stockStatus = getStockStatus(item.currentStock, item.minimumStock);
                  const expiryStatus = getExpiryStatus(item.expiryDate);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Kode & Nama */}
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                            {item.code.substring(0, 3)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 text-xs hover:text-blue-600 cursor-pointer" onClick={() => setDetailItem(item)}>
                              {item.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                              <span>{item.code}</span>
                              {item.batchNumber && <span>• Lot: {item.batchNumber}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {cat?.name || '-'}
                        </span>
                      </td>

                      {/* Lokasi */}
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        <span className="truncate block max-w-[140px]" title={loc?.name}>
                          {loc?.name || '-'}
                        </span>
                      </td>

                      {/* Stok Fisik */}
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-bold text-sm ${
                            item.currentStock <= 0
                              ? 'text-rose-600'
                              : item.currentStock <= item.minimumStock
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {item.currentStock}
                        </span>{' '}
                        <span className="text-[11px] text-slate-500">{unt?.symbol || 'Unit'}</span>
                      </td>

                      {/* Min / Max */}
                      <td className="px-4 py-3 text-center text-[11px] text-slate-500">
                        {item.minimumStock} / {item.maximumStock}
                      </td>

                      {/* Harga Satuan */}
                      <td className="px-4 py-3 text-right font-medium text-slate-700">
                        {formatRupiah(item.price)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            stockStatus === 'HABIS'
                              ? 'bg-rose-100 text-rose-700 border border-rose-300'
                              : stockStatus === 'MINIMUM'
                              ? 'bg-amber-100 text-amber-700 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {stockStatus}
                        </span>
                      </td>

                      {/* Expired / Batch */}
                      <td className="px-4 py-3 text-center text-[11px]">
                        {item.expiryDate ? (
                          <div className="space-y-0.5">
                            <span
                              className={`inline-block font-semibold px-1.5 py-0.2 rounded-sm text-[10px] ${
                                expiryStatus === 'EXPIRED'
                                  ? 'bg-rose-600 text-white'
                                  : expiryStatus === 'SEGERA DIGUNAKAN'
                                  ? 'bg-orange-500 text-white'
                                  : expiryStatus === 'PERINGATAN'
                                  ? 'bg-yellow-400 text-slate-900'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {item.expiryDate}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setDetailItem(item)}
                            className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-md transition-colors"
                            title="Lihat Detail Lengkap Lab"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-md transition-colors"
                              title="Edit Data Barang"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item.id, item.name)}
                              className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-md transition-colors"
                              title="Hapus Barang"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Barang */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-base">
                  {editingItem ? 'Edit Data Barang' : 'Tambah Master Barang Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Section 1: Informasi Dasar */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-600" /> Informasi Dasar Barang
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kode Barang <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="REA-001"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg uppercase font-mono font-bold focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Barang <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Reagen Glukosa GOD-PAP"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Satuan</label>
                    <select
                      value={formData.unitId}
                      onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Lokasi Penyimpanan</label>
                    <select
                      value={formData.locationId}
                      onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Supplier Utama</label>
                    <select
                      value={formData.supplierId}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Harga Satuan (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Status Barang</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ItemStatus })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Tidak Aktif">Tidak Aktif</option>
                      <option value="Rusak">Rusak</option>
                      <option value="Expired">Expired</option>
                      <option value="Quarantine">Quarantine</option>
                      <option value="Habis">Habis</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Parameter Stok */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-indigo-600" /> Parameter Batas Stok
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Stok Minimum (Peringatan Re-order)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minimumStock}
                      onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-amber-700"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Stok Maksimum (Kapasitas Rak)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maximumStock}
                      onChange={(e) => setFormData({ ...formData, maximumStock: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Stok Awal Fisik {editingItem && '(Hanya lihat)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      disabled={!!editingItem}
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Fitur Khusus Laboratorium (PRD 23) */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-3 pb-1 border-b border-blue-200 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-blue-700" /> Spesifikasi Khusus Laboratorium / Reagen
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nomor Batch / Lot</label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                      placeholder="LOT-2026GLK-88"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Produsen / Manufaktur</label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      placeholder="DiaSys / Merck / BD"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nomor Sertifikat / COA</label>
                    <input
                      type="text"
                      value={formData.certificateNumber}
                      onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                      placeholder="COA-DIA-9941"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tanggal Produksi</label>
                    <input
                      type="date"
                      value={formData.productionDate}
                      onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tanggal Kedaluwarsa (Expired)</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-rose-700"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kondisi / Suhu Simpan</label>
                    <input
                      type="text"
                      value={formData.storageCondition}
                      onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
                      placeholder="2°C - 8°C (Chiller)"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan Tambahan</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi fungsi atau petunjuk khusus penyimpanan..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Modal Footer */}
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Barang Khusus Laboratorium */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">Spesifikasi Kartu Barang Lab</h3>
                  <p className="text-[11px] text-slate-400">{detailItem.code}</p>
                </div>
              </div>
              <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Barcode visual preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center">
                <div className="font-mono text-center tracking-[0.3em] text-slate-800 text-lg font-black select-none">
                  ||||| | |||| ||| ||||| || |
                </div>
                <span className="font-mono text-[11px] text-slate-600 mt-1 font-bold tracking-wider">
                  *{detailItem.code}*
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Nama Barang:</span>
                  <span className="font-bold text-slate-800 text-right">{detailItem.name}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Kategori:</span>
                  <span className="font-semibold text-slate-800">
                    {categories.find((c) => c.id === detailItem.categoryId)?.name}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Stok Saat Ini:</span>
                  <span className="font-bold text-blue-600">
                    {detailItem.currentStock} {units.find((u) => u.id === detailItem.unitId)?.symbol}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Batas Min / Max:</span>
                  <span className="font-semibold text-slate-800">
                    {detailItem.minimumStock} / {detailItem.maximumStock}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Harga Satuan:</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(detailItem.price)}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Lokasi Simpan:</span>
                  <span className="font-semibold text-slate-800">
                    {locations.find((l) => l.id === detailItem.locationId)?.name}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Batch / Lot:</span>
                  <span className="font-mono font-bold text-slate-800">{detailItem.batchNumber || '-'}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Produsen:</span>
                  <span className="font-semibold text-slate-800">{detailItem.manufacturer || '-'}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Tanggal Expired:</span>
                  <span className="font-semibold text-rose-600">{detailItem.expiryDate || '-'}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Suhu / Kondisi Simpan:</span>
                  <span className="font-semibold text-slate-800">{detailItem.storageCondition || '-'}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Nomor Sertifikat / COA:</span>
                  <span className="font-mono font-semibold text-slate-800">{detailItem.certificateNumber || '-'}</span>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setDetailItem(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900"
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
