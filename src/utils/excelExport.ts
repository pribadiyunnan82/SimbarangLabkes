import * as XLSX from 'xlsx';

export interface ExcelExportOptions {
  fileName: string;
  sheetName?: string;
  reportTitle?: string;
  subtitle?: string;
  headers: string[];
  data: (string | number | boolean | null | undefined)[][];
  columnWidths?: number[];
}

/**
 * Export data directly to formatted Microsoft Excel (.xlsx) file with proper table layout.
 */
export const exportToExcel = ({
  fileName,
  sheetName = 'Laporan',
  reportTitle,
  subtitle,
  headers,
  data,
  columnWidths,
}: ExcelExportOptions) => {
  // Build 2D array representation
  const worksheetRows: (string | number | boolean | null | undefined)[][] = [];

  if (reportTitle) {
    worksheetRows.push([reportTitle]);
  }
  if (subtitle) {
    worksheetRows.push([subtitle]);
  }
  if (reportTitle || subtitle) {
    worksheetRows.push([]); // Empty spacer row
  }

  // Add Table Headers
  worksheetRows.push(headers);

  // Add Data Rows
  data.forEach((row) => {
    worksheetRows.push(row);
  });

  // Create worksheet from AOA
  const ws = XLSX.utils.aoa_to_sheet(worksheetRows);

  // Compute column widths if not provided
  const computedColWidths = headers.map((header, colIdx) => {
    if (columnWidths && columnWidths[colIdx]) {
      return { wch: columnWidths[colIdx] };
    }
    // Calculate max content width in this column
    let maxLen = header ? header.toString().length : 10;
    data.forEach((row) => {
      const cellVal = row[colIdx];
      if (cellVal !== undefined && cellVal !== null) {
        const len = cellVal.toString().length;
        if (len > maxLen) maxLen = len;
      }
    });
    // Add padding
    return { wch: Math.min(Math.max(maxLen + 4, 12), 50) };
  });

  ws['!cols'] = computedColWidths;

  // Create workbook and append sheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31)); // Excel max sheet name 31 chars

  // Generate clean filename
  const cleanFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;

  // Trigger download as .xlsx
  XLSX.writeFile(wb, cleanFileName);
};
