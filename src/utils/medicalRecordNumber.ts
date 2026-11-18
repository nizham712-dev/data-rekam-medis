/**
 * Format Nomor Rekam Medis: RM-YYYYMM-XXXX
 * Nomor final dibuat oleh database (function generate_no_rm()) agar tetap unik
 * dan aman saat beberapa resepsionis mendaftar bersamaan.
 */
export function formatMedicalRecordNumber(date: Date, sequence: number): string {
  const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  return `RM-${yearMonth}-${String(sequence).padStart(4, '0')}`;
}

export function medicalRecordNumberHint(): string {
  return formatMedicalRecordNumber(new Date(), 0).replace(/0000$/, 'XXXX');
}
