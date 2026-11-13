import { ExpiryStatus, StockStatus } from '../types/inventory';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateTimeString?: string): string {
  if (!dateTimeString) return '-';
  try {
    const d = new Date(dateTimeString);
    if (isNaN(d.getTime())) return dateTimeString;
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateTimeString;
  }
}

// Target baseline date: 2026-09-15
export function getDaysUntilExpiry(expiryDateStr?: string): number | null {
  if (!expiryDateStr) return null;
  const expiry = new Date(expiryDateStr);
  if (isNaN(expiry.getTime())) return null;
  // Use 2026-09-15 as system anchor date
  const baseDate = new Date('2026-09-15T00:00:00');
  const diffTime = expiry.getTime() - baseDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const calculateDaysUntilExpiry = getDaysUntilExpiry;

export function getExpiryStatus(expiryDateStr?: string): ExpiryStatus | null {
  const days = getDaysUntilExpiry(expiryDateStr);
  if (days === null) return null;
  if (days < 0) return 'EXPIRED';
  if (days < 30) return 'SEGERA DIGUNAKAN';
  if (days <= 90) return 'PERINGATAN';
  return 'AMAN';
}

export function getStockStatus(currentStock: number, minimumStock: number): StockStatus {
  if (currentStock <= 0) return 'HABIS';
  if (currentStock <= minimumStock) return 'MINIMUM';
  return 'AMAN';
}

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) => {
    return row
      .map((val) => {
        const text = String(val ?? '').replace(/"/g, '""');
        return `"${text}"`;
      })
      .join(';'); // Semicolon works standard with Excel in Indonesian locale
  };

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(processRow)].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
