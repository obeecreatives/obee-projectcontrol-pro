/**
 * Utilitas Pemformatan Tanggal & Waktu Berstandar Locale Indonesia (id-ID)
 * obeecreatives Workspace OS
 */

export const BULAN_INDONESIA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const BULAN_INDONESIA_PENDEK = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agt',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export const HARI_INDONESIA_PENDEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const HARI_INDONESIA_LENGKAP = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

/**
 * Format string tanggal (YYYY-MM-DD atau ISO) ke format tanggal Indonesia
 * Contoh: "2026-07-31" -> "31 Jul 2026"
 */
export function formatDateIndo(
  dateInput?: string | Date | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) return '-';
  try {
    let d: Date;
    if (typeof dateInput === 'string') {
      // Tangani format YYYY-MM-DD secara aman agar tidak terpengaruh UTC offset
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        const [year, month, day] = dateInput.split('-').map(Number);
        d = new Date(year, month - 1, day);
      } else {
        d = new Date(dateInput);
      }
    } else {
      d = dateInput;
    }

    if (isNaN(d.getTime())) return String(dateInput);

    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };

    return d.toLocaleDateString('id-ID', options || defaultOptions);
  } catch {
    return String(dateInput);
  }
}

/**
 * Format tanggal dan jam ke locale Indonesia
 * Contoh: "2026-07-31T14:30:00Z" -> "31 Jul 2026, 21.30 WIB"
 */
export function formatDateTimeIndo(
  dateInput?: string | Date | null,
  includeSeconds = false
): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const formatted = d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
    });

    return formatted;
  } catch {
    return String(dateInput);
  }
}

/**
 * Format waktu jam saja ke locale Indonesia
 * Contoh: "14:30:15"
 */
export function formatTimeIndo(
  dateInput?: string | Date | null,
  includeSeconds = true
): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Format waktu relatif dalam bahasa Indonesia
 * Contoh: "Baru saja", "5 mnt lalu", "2 jam lalu", "3 hari lalu"
 */
export function formatRelativeTimeIndo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Baru saja';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Format angka mata uang Rupiah
 * Contoh: 15000 -> "Rp 15.000"
 */
export function formatRupiah(amount: number): string {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;
}
