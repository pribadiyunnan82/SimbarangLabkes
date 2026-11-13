import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  Printer,
  Download,
  Filter,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  AlertTriangle,
  Clock,
  Coins,
} from 'lucide-react';
import { formatDate, formatRupiah, getExpiryStatus, getStockStatus } from '../../utils/helpers';
import { exportToExcel } from '../../utils/excelExport';

type ReportType =
  | 'STOK_BARANG'
  | 'BARANG_MASUK'
  | 'BARANG_KELUAR'
  | 'KARTU_STOK'
  | 'STOK_MINIMUM'
  | 'BARANG_EXPIRED'
  | 'NILAI_PERSEDIAAN';

export const ReportsView: React.FC = () => {
  const { items, categories, units, locations, suppliers, departments, stockIns, stockOuts, getItemStockCard, currentUser } =
    useInventory();

  // Selected report type
  const [selectedReport, setSelectedReport] = useState<ReportType>('STOK_BARANG');

  // Filters
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');


  // Helper titles
  const getReportTitle = (type: ReportType) => {
    switch (type) {
      case 'STOK_BARANG':
        return 'LAPORAN DATA STOK BARANG GUDANG';
      case 'BARANG_MASUK':
        return 'LAPORAN TRANSAKSI BARANG MASUK (PENERIMAAN)';
      case 'BARANG_KELUAR':
        return 'LAPORAN TRANSAKSI BARANG KELUAR (PENYERAHAN)';
      case 'KARTU_STOK':
        return 'LAPORAN BUKU KARTU STOK MUTASI PERSEDIAAN';
      case 'STOK_MINIMUM':
        return 'LAPORAN PERINGATAN STOK MINIMUM & REORDER';
      case 'BARANG_EXPIRED':
        return 'LAPORAN MONITORING KEDALUWARSA (EXPIRED DATE)';
      case 'NILAI_PERSEDIAAN':
        return 'LAPORAN REKAPITULASI NILAI ASET PERSEDIAAN';
      default:
        return 'LAPORAN INVENTARIS GUDANG';
    }
  };

  // 1. Report: Stok Barang
  const reportStokBarang = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
      const matchLoc = selectedLocation === 'ALL' || item.locationId === selectedLocation;
      return matchCat && matchLoc;
    });
  }, [items, selectedCategory, selectedLocation]);

  // 2. Report: Barang Masuk
  const reportBarangMasuk = useMemo(() => {
    const filteredTx = stockIns.filter((tx) => {
      return tx.date >= startDate && tx.date <= endDate;
    });

    const flatRows: Array<{
      txId: string;
      date: string;
      txNumber: string;
      docNumber: string;
      deliveryNote: string;
      supplierName: string;
      itemName: string;
      itemCode: string;
      batchNumber: string;
      expiryDate: string;
      quantity: number;
      price: number;
      officer: string;
    }> = [];

    filteredTx.forEach((tx) => {
      const sup = suppliers.find((s) => s.id === tx.supplierId)?.name || '-';
      tx.details.forEach((d) => {
        const itm = items.find((x) => x.id === d.itemId);
        if (!itm) return;
        if (selectedCategory !== 'ALL' && itm.categoryId !== selectedCategory) return;
        if (selectedLocation !== 'ALL' && itm.locationId !== selectedLocation) return;

        flatRows.push({
          txId: tx.id,
          date: tx.date,
          txNumber: tx.transactionNumber,
          docNumber: tx.documentNumber,
          deliveryNote: tx.deliveryNote,
          supplierName: sup,
          itemName: itm.name,
          itemCode: itm.code,
          batchNumber: d.batchNumber || '-',
          expiryDate: d.expiryDate || '-',
          quantity: d.quantity,
          price: d.price,
          officer: tx.userName,
        });
      });
    });

    return flatRows;
  }, [stockIns, startDate, endDate, items, suppliers, selectedCategory, selectedLocation]);

  // 3. Report: Barang Keluar
  const reportBarangKeluar = useMemo(() => {
    const filteredTx = stockOuts.filter((tx) => {
      return tx.date >= startDate && tx.date <= endDate;
    });

    const flatRows: Array<{
      txId: string;
      date: string;
      txNumber: string;
      reqNumber: string;
      deptName: string;
      requester: string;
      itemName: string;
      itemCode: string;
      batchNumber: string;
      quantity: number;
      officer: string;
    }> = [];

    filteredTx.forEach((tx) => {
      const dept = departments.find((d) => d.id === tx.departmentId)?.name || '-';
      tx.details.forEach((d) => {
        const itm = items.find((x) => x.id === d.itemId);
        if (!itm) return;
        if (selectedCategory !== 'ALL' && itm.categoryId !== selectedCategory) return;
        if (selectedLocation !== 'ALL' && itm.locationId !== selectedLocation) return;

        flatRows.push({
          txId: tx.id,
          date: tx.date,
          txNumber: tx.transactionNumber,
          reqNumber: tx.requestNumber,
          deptName: dept,
          requester: tx.requesterName,
          itemName: itm.name,
          itemCode: itm.code,
          batchNumber: d.batchNumber || '-',
          quantity: d.quantity,
          officer: tx.userName,
        });
      });
    });

    return flatRows;
  }, [stockOuts, startDate, endDate, items, departments, selectedCategory, selectedLocation]);

  // 4. Report: Kartu Stok (Aggregated)
  const reportKartuStok = useMemo(() => {
    const activeItems = items.filter((item) => {
      const matchCat = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
      const matchLoc = selectedLocation === 'ALL' || item.locationId === selectedLocation;
      return matchCat && matchLoc;
    });

    const rows: Array<{
      id: string;
      itemCode: string;
      itemName: string;
      date: string;
      transactionNumber: string;
      type: string;
      inQty: number;
      outQty: number;
      balance: number;
      officer: string;
    }> = [];

    activeItems.forEach((itm) => {
      const ledger = getItemStockCard(itm.id, startDate, endDate);
      ledger.forEach((r) => {
        rows.push({
          id: `${itm.id}-${r.id}`,
          itemCode: itm.code,
          itemName: itm.name,
          date: r.date,
          transactionNumber: r.transactionNumber,
          type: r.type,
          inQty: r.inQty,
          outQty: r.outQty,
          balance: r.balance,
          officer: r.officer,
        });
      });
    });

    return rows;
  }, [items, selectedCategory, selectedLocation, startDate, endDate, getItemStockCard]);

  // 5. Report: Stok Minimum
  const reportStokMinimum = useMemo(() => {
    return items.filter((i) => {
      const matchCat = selectedCategory === 'ALL' || i.categoryId === selectedCategory;
      const matchLoc = selectedLocation === 'ALL' || i.locationId === selectedLocation;
      const isLow = i.currentStock <= i.minimumStock;
      return matchCat && matchLoc && isLow;
    });
  }, [items, selectedCategory, selectedLocation]);

  // 6. Report: Barang Expired
  const reportBarangExpired = useMemo(() => {
    return items.filter((i) => {
      if (!i.expiryDate) return false;
      const matchCat = selectedCategory === 'ALL' || i.categoryId === selectedCategory;
      const matchLoc = selectedLocation === 'ALL' || i.locationId === selectedLocation;
      const st = getExpiryStatus(i.expiryDate);
      return matchCat && matchLoc && (st === 'EXPIRED' || st === 'SEGERA DIGUNAKAN');
    });
  }, [items, selectedCategory, selectedLocation]);

  // 7. Report: Nilai Persediaan
  const reportNilaiPersediaan = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
      const matchLoc = selectedLocation === 'ALL' || item.locationId === selectedLocation;
      return matchCat && matchLoc;
    });
  }, [items, selectedCategory, selectedLocation]);

  const grandTotalNilai = useMemo(() => {
    return reportNilaiPersediaan.reduce((sum, item) => sum + item.currentStock * item.price, 0);
  }, [reportNilaiPersediaan]);

  // Get active item count for print summary
  const getActiveDataCount = () => {
    switch (selectedReport) {
      case 'STOK_BARANG':
        return reportStokBarang.length;
      case 'BARANG_MASUK':
        return reportBarangMasuk.length;
      case 'BARANG_KELUAR':
        return reportBarangKeluar.length;
      case 'KARTU_STOK':
        return reportKartuStok.length;
      case 'STOK_MINIMUM':
        return reportStokMinimum.length;
      case 'BARANG_EXPIRED':
        return reportBarangExpired.length;
      case 'NILAI_PERSEDIAAN':
        return reportNilaiPersediaan.length;
      default:
        return 0;
    }
  };

  // Handle Export Excel (.xlsx) with proper formatted tables
  const handleExport = () => {
    const reportTitle = getReportTitle(selectedReport);
    const subtitle = `Periode: ${startDate} s/d ${endDate} • Dicetak oleh: ${currentUser?.name || 'Administrator'} pada ${new Date().toLocaleDateString('id-ID')}`;

    if (selectedReport === 'STOK_BARANG') {
      const headers = ['No', 'Kode Barang', 'Nama Barang', 'Kategori', 'Lokasi Gudang', 'Stok Saat Ini', 'Batas Min', 'Status Stok', 'Satuan'];
      const data = reportStokBarang.map((i, idx) => [
        idx + 1,
        i.code,
        i.name,
        categories.find((c) => c.id === i.categoryId)?.name || '-',
        locations.find((l) => l.id === i.locationId)?.name || '-',
        i.currentStock,
        i.minimumStock,
        getStockStatus(i.currentStock, i.minimumStock),
        units.find((u) => u.id === i.unitId)?.symbol || '-',
      ]);
      exportToExcel({
        fileName: `Laporan_Stok_Barang_${new Date().toISOString().split('T')[0]}`,
        sheetName: 'Stok Barang',
        reportTitle,
        subtitle,
        headers,
        data,
      });
    } else if (selectedReport === 'BARANG_MASUK') {
      const headers = ['No', 'Tanggal', 'No Transaksi', 'No Dokumen / Faktur', 'Surat Jalan', 'Supplier', 'Kode Barang', 'Nama Barang', 'Batch', 'Tgl Expired', 'Qty Masuk', 'Harga Satuan (Rp)', 'Total (Rp)', 'Petugas'];
      const data = reportBarangMasuk.map((r, idx) => [
        idx + 1,
        r.date,
        r.txNumber,
        r.docNumber,
        r.deliveryNote,
        r.supplierName,
        r.itemCode,
        r.itemName,
        r.batchNumber,
        r.expiryDate,
        r.quantity,
        r.price,
        r.quantity * r.price,
        r.officer,
      ]);
      exportToExcel({
        fileName: `Laporan_Barang_Masuk_${new Date().toISOString().split('T')[0]}`,
        sheetName: 'Barang Masuk',
        reportTitle,
        subtitle,
        headers,
        data,
      });
    } else if (selectedReport === 'BARANG_KELUAR') {
      const headers = ['No', 'Tanggal', 'No Transaksi', 'No Permintaan', 'Departemen Penerima', 'Nama Pemohon', 'Kode Barang', 'Nama Barang', 'Batch', 'Qty Keluar', 'Petugas Pengeluaran'];
      const data = reportBarangKeluar.map((r, idx) => [
        idx + 1,
        r.date,
        r.txNumber,
        r.reqNumber,
        r.deptName,
        r.requester,
        r.itemCode,
        r.itemName,
        r.batchNumber,
        r.quantity,
        r.officer,
      ]);
      exportToExcel({
        fileName: `Laporan_Barang_Keluar_${new Date().toISOString().split('T')[0]}`,
        sheetName: 'Barang Keluar',
        reportTitle,
        subtitle,
        headers,
        data,
      });
    } else if (selectedReport === 'KARTU_STOK') {
      const headers = ['No', 'Kode Barang', 'Nama Barang', 'Tanggal', 'No Transaksi / Referensi', 'Tipe Mutasi', 'Masuk (In)', 'Keluar (Out)', 'Sisa Stok (Saldo)', 'Petugas'];
      const data = reportKartuStok.map((r, idx) => [
        idx + 1,
        r.itemCode,
        r.itemName,
        r.date,
        r.transactionNumber,
        r.type,
        r.inQty,
        r.outQty,
        r.balance,
        r.officer,
      ]);
      exportToExcel({
        fileName: `Laporan_Kartu_Stok_${new Date().toISOString().split('T')[0]}`,
        sheetName: 'Kartu Stok Mutasi',
        reportTitle,
        subtitle,
        headers,
        data,
      });
    } else if (selectedReport === 'NILAI_PERSEDIAAN') {
      const headers = ['No', 'Kode Barang', 'Nama Barang', 'Kategori', 'Lokasi', 'Stok Tersedia', 'Harga Beli (Rp)', 'Total Nilai Aset (Rp)'];
      const data: (string | number)[][] = reportNilaiPersediaan.map((i, idx) => [
        idx + 1,
        i.code,
        i.name,
        categories.find((c) => c.id === i.categoryId)?.name || '-',
        locations.find((l) => l.id === i.locationId)?.name || '-',
        i.currentStock,
        i.price,
        i.currentStock * i.price,
      ]);
      data.push([
        '', '', '', '', '', '', 'TOTAL NILAI PERSEDIAAN', grandTotalNilai
      ]);
      exportToExcel({
        fileName: `Laporan_Nilai_Persediaan_${new Date().toISOString().split('T')[0]}`,
        sheetName: 'Nilai Persediaan',
        reportTitle,
        subtitle,
        headers,
        data,
      });
    } else if (selectedReport === 'STOK_MINIMUM') {
      const headers = ['No', 'Kode Barang', 'Nama Barang', 'Batas Min', 'Stok Saat Ini', 'Defisit Reorder', 'Status'];
      const data = reportStokMinimum.map((i, idx) => [
        idx + 1,
        i.code,
        i.name,
        i.minimumStock,
        i.currentStock,
        Math.max(0, i.minimumStock - i.currentStock),
        getStockStatus(i.currentStock, i.minimumStock),
      ]);
      exportToExcel({
        fileName: `Laporan_Stok_Minimum_${new Date().toISOString().split('T')[0]}`,
        sheetName: 'Stok Minimum',
        reportTitle,
        subtitle,
        headers,
        data,
      });
    } else if (selectedReport === 'BARANG_EXPIRED') {
      const headers = ['No', 'Kode Barang', 'Nama Barang', 'No Batch', 'Tanggal Kedaluwarsa', 'Sisa Stok', 'Status Kedaluwarsa'];
      const data = reportBarangExpired.map((i, idx) => [
        idx + 1,
        i.code,
        i.name,
        i.batchNumber || '-',
        i.expiryDate || '-',
        i.currentStock,
        getExpiryStatus(i.expiryDate),
      ]);
      exportToExcel({
        fileName: `Laporan_Barang_Expired_${new Date().toISOString().split('T')[0]}`,
        sheetName: 'Monitoring Expired',
        reportTitle,
        subtitle,
        headers,
        data,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* SCREEN-ONLY: Header & Navigation Tabs                     */}
      {/* ========================================================= */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pusat Laporan Inventaris</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Laporan lengkap untuk pimpinan, audit internal, evaluasi mutasi, dan rekapitulasi nilai persediaan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="print-report-btn"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak / PDF (Data Saja)
          </button>
          <button
            id="export-csv-btn"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Ekspor Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* 7 Tab buttons */}
      <div className="no-print flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedReport('STOK_BARANG')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
            selectedReport === 'STOK_BARANG'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" /> 1. Laporan Stok Barang
        </button>

        <button
          onClick={() => setSelectedReport('BARANG_MASUK')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
            selectedReport === 'BARANG_MASUK'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" /> 2. Laporan Barang Masuk
        </button>

        <button
          onClick={() => setSelectedReport('BARANG_KELUAR')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
            selectedReport === 'BARANG_KELUAR'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" /> 3. Laporan Barang Keluar
        </button>

        <button
          onClick={() => setSelectedReport('KARTU_STOK')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
            selectedReport === 'KARTU_STOK'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" /> 4. Laporan Kartu Stok
        </button>

        <button
          onClick={() => setSelectedReport('STOK_MINIMUM')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
            selectedReport === 'STOK_MINIMUM'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> 5. Laporan Stok Minimum
        </button>

        <button
          onClick={() => setSelectedReport('BARANG_EXPIRED')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
            selectedReport === 'BARANG_EXPIRED'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" /> 6. Laporan Expired
        </button>

        <button
          onClick={() => setSelectedReport('NILAI_PERSEDIAAN')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
            selectedReport === 'NILAI_PERSEDIAAN'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Coins className="w-4 h-4" /> 7. Laporan Nilai Persediaan
        </button>
      </div>

      {/* Filter Parameters Bar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
          <Filter className="w-4 h-4" /> Parameter Filter:
        </div>

        {(selectedReport === 'BARANG_MASUK' || selectedReport === 'BARANG_KELUAR' || selectedReport === 'KARTU_STOK') && (
          <div className="flex items-center gap-2">
            <span>Periode:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
            />
            <span>s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <span>Kategori:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span>Lokasi:</span>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="ALL">Semua Lokasi</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Screen-only Nilai Persediaan Total Banner */}
      {selectedReport === 'NILAI_PERSEDIAAN' && (
        <div className="no-print p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Akumulasi Nilai Aset Gudang</span>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">{formatRupiah(grandTotalNilai)}</p>
          </div>
          <span className="text-xs text-slate-400 bg-white/10 px-3 py-1.5 rounded-lg">
            {reportNilaiPersediaan.length} Macam Barang Dihitung
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* PRINT-ONLY: Clean Formal Header for PDF/Printout         */}
      {/* ========================================================= */}
      <div className="print-only mb-4 border-b-2 border-slate-900 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
              SISTEM MANAJEMEN INVENTARIS & LOGISTIK GUDANG
            </h1>
            <h2 className="text-sm font-bold text-slate-800 mt-0.5 uppercase">
              {getReportTitle(selectedReport)}
            </h2>
          </div>
          <div className="text-right text-[8.5pt] text-slate-600">
            <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            <p>Petugas: {currentUser?.name || 'Administrator'}</p>
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-slate-300 flex flex-wrap gap-x-6 text-[8pt] text-slate-700">
          {(selectedReport === 'BARANG_MASUK' || selectedReport === 'BARANG_KELUAR' || selectedReport === 'KARTU_STOK') && (
            <span><strong>Periode:</strong> {formatDate(startDate)} s/d {formatDate(endDate)}</span>
          )}
          {selectedCategory !== 'ALL' && (
            <span><strong>Kategori:</strong> {categories.find((c) => c.id === selectedCategory)?.name}</span>
          )}
          {selectedLocation !== 'ALL' && (
            <span><strong>Lokasi:</strong> {locations.find((l) => l.id === selectedLocation)?.name}</span>
          )}
          <span><strong>Total Baris Data:</strong> {getActiveDataCount()} data</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PURE DATA TABLES (Rendered Cleanly for Screen & Print)    */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          {/* 1. Laporan Stok Barang */}
          {selectedReport === 'STOK_BARANG' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Kode Barang</th>
                  <th className="px-4 py-3">Nama Barang</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Lokasi Simpan</th>
                  <th className="px-4 py-3 text-right font-bold">Stok Fisik</th>
                  <th className="px-4 py-3 text-center">Batas Min</th>
                  <th className="px-4 py-3 text-center">Status Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportStokBarang.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada data barang yang sesuai dengan filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  reportStokBarang.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">{i.code}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{i.name}</td>
                      <td className="px-4 py-3">{categories.find((c) => c.id === i.categoryId)?.name || '-'}</td>
                      <td className="px-4 py-3">{locations.find((l) => l.id === i.locationId)?.name || '-'}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-900">{i.currentStock}</td>
                      <td className="px-4 py-3 text-center font-mono text-slate-500">{i.minimumStock}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 print:bg-transparent print:p-0">
                          {getStockStatus(i.currentStock, i.minimumStock)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* 2. Laporan Barang Masuk */}
          {selectedReport === 'BARANG_MASUK' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-3">Tanggal</th>
                  <th className="px-3 py-3 font-mono">No Transaksi</th>
                  <th className="px-3 py-3">No Dokumen / SJ</th>
                  <th className="px-3 py-3">Supplier</th>
                  <th className="px-3 py-3">Barang</th>
                  <th className="px-3 py-3 text-center">Batch / Exp</th>
                  <th className="px-3 py-3 text-right font-bold">Qty Masuk</th>
                  <th className="px-3 py-3 text-right">Harga Satuan</th>
                  <th className="px-3 py-3">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportBarangMasuk.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada data transaksi barang masuk pada periode dan filter ini.
                    </td>
                  </tr>
                ) : (
                  reportBarangMasuk.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 whitespace-nowrap">{formatDate(r.date)}</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-blue-600">{r.txNumber}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-slate-500">
                        {r.docNumber} / {r.deliveryNote}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-700">{r.supplierName}</td>
                      <td className="px-3 py-2.5">
                        <span className="font-bold text-slate-800 block">{r.itemName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{r.itemCode}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-[11px]">
                        {r.batchNumber} / {r.expiryDate}
                      </td>
                      <td className="px-3 py-2.5 text-right font-black text-emerald-600">+{r.quantity}</td>
                      <td className="px-3 py-2.5 text-right font-medium">{formatRupiah(r.price)}</td>
                      <td className="px-3 py-2.5 text-slate-500">{r.officer}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* 3. Laporan Barang Keluar */}
          {selectedReport === 'BARANG_KELUAR' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-3">Tanggal</th>
                  <th className="px-3 py-3 font-mono">No Transaksi</th>
                  <th className="px-3 py-3">Unit Kerja Pemakai</th>
                  <th className="px-3 py-3">Pemohon</th>
                  <th className="px-3 py-3">Barang Diserahkan</th>
                  <th className="px-3 py-3 text-center">Batch / Lot</th>
                  <th className="px-3 py-3 text-right font-bold">Qty Keluar</th>
                  <th className="px-3 py-3">Petugas Gudang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportBarangKeluar.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada data transaksi barang keluar pada periode dan filter ini.
                    </td>
                  </tr>
                ) : (
                  reportBarangKeluar.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 whitespace-nowrap">{formatDate(r.date)}</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-blue-600">{r.txNumber}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-800">{r.deptName}</td>
                      <td className="px-3 py-2.5 text-slate-700">{r.requester}</td>
                      <td className="px-3 py-2.5">
                        <span className="font-bold text-slate-800 block">{r.itemName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{r.itemCode}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-[11px]">{r.batchNumber}</td>
                      <td className="px-3 py-2.5 text-right font-black text-rose-600">-{r.quantity}</td>
                      <td className="px-3 py-2.5 text-slate-500">{r.officer}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* 4. Laporan Kartu Stok */}
          {selectedReport === 'KARTU_STOK' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Barang</th>
                  <th className="px-4 py-3">No. Transaksi</th>
                  <th className="px-4 py-3">Jenis Mutasi</th>
                  <th className="px-4 py-3 text-right text-emerald-600">Masuk (+)</th>
                  <th className="px-4 py-3 text-right text-orange-600">Keluar (-)</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-800">Sisa Saldo</th>
                  <th className="px-4 py-3">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportKartuStok.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada mutasi buku kartu stok pada periode ini.
                    </td>
                  </tr>
                ) : (
                  reportKartuStok.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(c.date)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        <span>{c.itemName}</span>
                        <span className="block text-[10px] font-mono text-slate-400">{c.itemCode}</span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">{c.transactionNumber}</td>
                      <td className="px-4 py-3 font-semibold text-[11px]">{c.type}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-bold">{c.inQty || '-'}</td>
                      <td className="px-4 py-3 text-right text-orange-600 font-bold">{c.outQty || '-'}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-800">{c.balance}</td>
                      <td className="px-4 py-3 text-slate-500">{c.officer}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* 5. Laporan Stok Minimum */}
          {selectedReport === 'STOK_MINIMUM' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-amber-50 font-bold text-amber-900 border-b border-amber-200 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">Nama Barang</th>
                  <th className="px-4 py-3 text-center">Batas Minimum</th>
                  <th className="px-4 py-3 text-right font-bold">Stok Tersedia</th>
                  <th className="px-4 py-3 text-right">Defisit Reorder</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportStokMinimum.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      Semua stok barang berada di batas aman (tidak ada defisit stok minimum).
                    </td>
                  </tr>
                ) : (
                  reportStokMinimum.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">{i.code}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{i.name}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{i.minimumStock}</td>
                      <td className="px-4 py-3 text-right font-black text-amber-600">{i.currentStock}</td>
                      <td className="px-4 py-3 text-right font-bold text-rose-600">
                        {Math.max(0, i.minimumStock - i.currentStock)} Unit
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 print:bg-transparent">
                          {getStockStatus(i.currentStock, i.minimumStock)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* 6. Laporan Barang Expired */}
          {selectedReport === 'BARANG_EXPIRED' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-rose-50 font-bold text-rose-900 border-b border-rose-200 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Kode & Nama</th>
                  <th className="px-4 py-3">Batch / Lot</th>
                  <th className="px-4 py-3 text-center">Tgl Kedaluwarsa</th>
                  <th className="px-4 py-3 text-right">Stok Fisik</th>
                  <th className="px-4 py-3 text-center">Status Expired</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportBarangExpired.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada barang kedaluwarsa atau mendekati jatuh tempo pada filter ini.
                    </td>
                  </tr>
                ) : (
                  reportBarangExpired.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800 block">{i.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{i.code}</span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold">{i.batchNumber || '-'}</td>
                      <td className="px-4 py-3 text-center font-bold text-rose-700">{i.expiryDate}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{i.currentStock}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white print:text-rose-900 print:bg-transparent">
                          {getExpiryStatus(i.expiryDate)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* 7. Laporan Nilai Persediaan */}
          {selectedReport === 'NILAI_PERSEDIAAN' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">Nama Barang</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3 text-right font-bold">Stok Fisik</th>
                  <th className="px-4 py-3 text-right">Harga Satuan</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-800">Total Nilai Persediaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportNilaiPersediaan.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada data persediaan barang untuk dihitung nilainya.
                    </td>
                  </tr>
                ) : (
                  reportNilaiPersediaan.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">{i.code}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{i.name}</td>
                      <td className="px-4 py-3">{categories.find((c) => c.id === i.categoryId)?.name || '-'}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{i.currentStock}</td>
                      <td className="px-4 py-3 text-right">{formatRupiah(i.price)}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">
                        {formatRupiah(i.currentStock * i.price)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="border-t-2 border-slate-300 font-bold bg-slate-50 text-slate-900">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right uppercase text-[11px] tracking-wider">
                    Total Nilai Akumulasi Persediaan:
                  </td>
                  <td className="px-4 py-3 text-right font-black text-sm text-emerald-800">
                    {formatRupiah(grandTotalNilai)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* PRINT-ONLY: Official Signatures Section                   */}
      {/* ========================================================= */}
      <div className="print-only mt-10 pt-4">
        <div className="grid grid-cols-2 gap-12 text-center text-[9pt]">
          <div>
            <p className="font-semibold text-slate-800">Mengetahui,</p>
            <p className="text-slate-600 mb-16">Pimpinan / Kepala Bagian</p>
            <p className="font-bold text-slate-900 underline">( .................................................... )</p>
            <p className="text-[8pt] text-slate-500">NIP / ID: .......................................</p>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Penanggung Jawab,</p>
            <p className="text-slate-600 mb-16">Petugas Pengelola Logistik</p>
            <p className="font-bold text-slate-900 underline">( {currentUser?.name || 'Petugas Gudang'} )</p>
            <p className="text-[8pt] text-slate-500">NIP / ID: @{currentUser?.username || 'admin'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
