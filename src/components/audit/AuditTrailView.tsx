import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { History, Search, Download } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.newData && log.newData.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchModule = selectedModule === 'ALL' || log.module === selectedModule;
    return matchSearch && matchModule;
  });

  const exportLogs = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Waktu', 'User', 'Role', 'Modul', 'Aktivitas', 'IP Address'],
        ...filteredLogs.map((l) => [l.createdAt, l.userName, l.role, l.module, l.activity, l.ipAddress]),
      ]
        .map((e) => e.map((x) => `"${x}"`).join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Log Aktivitas & Jejak Audit (Audit Trail)</h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold border border-slate-200">
              {auditLogs.length} Rekaman Log
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Seluruh aktivitas pencatatan master data, mutasi stok barang masuk, pengeluaran, opname, dan penyesuaian
            tercatat permanen.
          </p>
        </div>

        <button
          onClick={exportLogs}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Ekspor Log Audit (CSV)
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari user, rincian aktivitas, atau modul..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="ALL">Semua Modul</option>
            <option value="Master Barang">Master Barang</option>
            <option value="Barang Masuk">Barang Masuk</option>
            <option value="Barang Keluar">Barang Keluar</option>
            <option value="Stock Opname">Stock Opname</option>
            <option value="Penyesuaian Stok">Penyesuaian Stok</option>
            <option value="User Management">User Management</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Waktu & Tanggal</th>
                <th className="px-4 py-3">Pengguna (User)</th>
                <th className="px-4 py-3 text-center">Peran (Role)</th>
                <th className="px-4 py-3">Modul</th>
                <th className="px-4 py-3">Aktivitas Transaksi</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-sans">
                    Tidak ada catatan audit yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800 font-sans block">{log.userName}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            log.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : log.role === 'petugas'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {log.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700 font-sans">{log.module}</td>
                      <td className="px-4 py-3 text-slate-700 font-sans">
                        <span>{log.activity}</span>
                        {log.newData && (
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-md">
                            {log.newData}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{log.ipAddress}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
