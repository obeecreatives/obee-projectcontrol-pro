/**
 * Utilitas Pemformatan Tanggal & Waktu Berstandar Locale Indonesia (id-ID) & WIB (Asia/Jakarta)
 * obeecreatives Workspace OS
 */

export const INDONESIA_LOCALE = 'id-ID';
export const INDONESIA_TIMEZONE = 'Asia/Jakarta';

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
 * Parsing tanggal secara aman dan kebal timezone shift (WIB - Asia/Jakarta).
 * Mencegah pergeseran tanggal (off-by-one day) akibat konversi UTC browser / Google Spreadsheet.
 */
export function parseDateSafe(
  dateInput?: string | Date | null
): { year: number; month: number; day: number; date: Date } | null {
  if (!dateInput) return null;

  try {
    if (typeof dateInput === 'string') {
      const clean = dateInput.trim();
      if (!clean) return null;

      // 1. Format Standar YYYY-MM-DD
      const ymdMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
      if (ymdMatch) {
        const year = parseInt(ymdMatch[1], 10);
        const month = parseInt(ymdMatch[2], 10) - 1; // 0-indexed
        const day = parseInt(ymdMatch[3], 10);
        return { year, month, day, date: new Date(year, month, day, 12, 0, 0) };
      }

      // 2. Format Indonesia DD/MM/YYYY atau DD-MM-YYYY
      const dmyMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
      if (dmyMatch) {
        const day = parseInt(dmyMatch[1], 10);
        const month = parseInt(dmyMatch[2], 10) - 1;
        const year = parseInt(dmyMatch[3], 10);
        return { year, month, day, date: new Date(year, month, day, 12, 0, 0) };
      }

      // 3. ISO String atau string lainnya
      const d = new Date(clean);
      if (isNaN(d.getTime())) return null;

      // Gunakan formatter Asia/Jakarta untuk mengekstrak bagian tanggal lokal yang tepat
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: INDONESIA_TIMEZONE,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }).formatToParts(d);

      let year = d.getFullYear();
      let month = d.getMonth();
      let day = d.getDate();

      parts.forEach((p) => {
        if (p.type === 'year') year = parseInt(p.value, 10);
        if (p.type === 'month') month = parseInt(p.value, 10) - 1;
        if (p.type === 'day') day = parseInt(p.value, 10);
      });

      return { year, month, day, date: new Date(year, month, day, 12, 0, 0) };
    }

    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) return null;
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: INDONESIA_TIMEZONE,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }).formatToParts(dateInput);

      let year = dateInput.getFullYear();
      let month = dateInput.getMonth();
      let day = dateInput.getDate();

      parts.forEach((p) => {
        if (p.type === 'year') year = parseInt(p.value, 10);
        if (p.type === 'month') month = parseInt(p.value, 10) - 1;
        if (p.type === 'day') day = parseInt(p.value, 10);
      });

      return { year, month, day, date: new Date(year, month, day, 12, 0, 0) };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Mengambil tanggal hari ini dalam format YYYY-MM-DD berbasis zona waktu Indonesia (Asia/Jakarta, WIB)
 * Selalu akurat tanpa terpengaruh perbedaan zona waktu mesin browser.
 */
export function getTodayIndoDateString(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: INDONESIA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Normalisasi string tanggal apa pun ke format YYYY-MM-DD standar Google Spreadsheet
 */
export function normalizeDateToYMD(dateInput?: string | Date | null): string {
  const parsed = parseDateSafe(dateInput);
  if (!parsed) return typeof dateInput === 'string' ? dateInput.trim() : '';
  const mm = String(parsed.month + 1).padStart(2, '0');
  const dd = String(parsed.day).padStart(2, '0');
  return `${parsed.year}-${mm}-${dd}`;
}

/**
 * Kamus Pemetaan Bulan Bahasa Inggris & Variasi Singkatan ke Standar Bahasa Indonesia
 */
export const MONTH_TRANSLATION_MAP: Record<string, string> = {
  // English full
  january: 'Januari',
  february: 'Februari',
  march: 'Maret',
  april: 'April',
  may: 'Mei',
  june: 'Juni',
  july: 'Juli',
  august: 'Agustus',
  september: 'September',
  october: 'Oktober',
  november: 'November',
  december: 'Desember',

  // English / Indonesian short abbreviations
  jan: 'Januari',
  feb: 'Februari',
  mar: 'Maret',
  apr: 'April',
  jun: 'Juni',
  jul: 'Juli',
  aug: 'Agustus',
  agt: 'Agustus',
  sep: 'September',
  sept: 'September',
  oct: 'Oktober',
  okt: 'Oktober',
  nov: 'November',
  dec: 'Desember',
  des: 'Desember',

  // Indonesian full (variasi huruf kecil)
  januari: 'Januari',
  februari: 'Februari',
  maret: 'Maret',
  mei: 'Mei',
  juni: 'Juni',
  juli: 'Juli',
  agustus: 'Agustus',
  oktober: 'Oktober',
  desember: 'Desember',
};

/**
 * Normalisasi nama bulan ke standar resmi Bahasa Indonesia (contoh: "July" -> "Juli", "August" -> "Agustus").
 * Jika parameter tanggal tersedia, tanggal digunakan sebagai sumber kebenaran (source of truth) utama.
 */
export function normalizeBulanIndo(
  bulanInput?: string | null,
  dateInput?: string | Date | null
): string {
  // 1. Jika tanggal tersedia dan valid, derivasi langsung dari tanggal agar 100% konsisten dengan TanggalProduksi
  if (dateInput) {
    const fromDate = getBulanIndoFromDate(dateInput);
    if (fromDate) return fromDate;
  }

  // 2. Jika input teks bulan diberikan, cocokkan dengan kamus
  if (!bulanInput) return '';
  const clean = String(bulanInput).trim().toLowerCase();
  if (MONTH_TRANSLATION_MAP[clean]) {
    return MONTH_TRANSLATION_MAP[clean];
  }

  // 3. Jika berbentuk angka string atau nomor (1-12)
  const num = parseInt(clean, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) {
    return BULAN_INDONESIA[num - 1];
  }

  // 4. Default: kembalikan teks dengan huruf kapital di awal kata
  return bulanInput.trim().charAt(0).toUpperCase() + bulanInput.trim().slice(1);
}

/**
 * Ekstrak Nama Bulan Indonesia (contoh: "September") dari tanggal
 */
export function getBulanIndoFromDate(dateInput?: string | Date | null): string {
  const parsed = parseDateSafe(dateInput);
  if (!parsed) return '';
  return BULAN_INDONESIA[parsed.month] || '';
}

/**
 * Ekstrak Tahun dari tanggal
 */
export function getTahunFromDate(dateInput?: string | Date | null): number {
  const parsed = parseDateSafe(dateInput);
  if (!parsed) return new Date().getFullYear();
  return parsed.year;
}

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
    const parsed = parseDateSafe(dateInput);
    if (!parsed) return String(dateInput);

    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: INDONESIA_TIMEZONE,
    };

    return parsed.date.toLocaleDateString(INDONESIA_LOCALE, options || defaultOptions);
  } catch {
    return String(dateInput);
  }
}

/**
 * Format tanggal dan jam ke locale Indonesia dengan indikator WIB
 * Contoh: "2026-07-31T14:30:00Z" -> "31 Jul 2026, 21.30 WIB"
 */
export function formatDateTimeIndo(
  dateInput?: string | Date | null,
  includeSeconds = false,
  includeTzLabel = true
): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const formatted = d.toLocaleString(INDONESIA_LOCALE, {
      timeZone: INDONESIA_TIMEZONE,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
    });

    return includeTzLabel ? `${formatted} WIB` : formatted;
  } catch {
    return String(dateInput);
  }
}

/**
 * Format waktu jam saja ke locale Indonesia (WIB)
 * Contoh: "14.30 WIB"
 */
export function formatTimeIndo(
  dateInput?: string | Date | null,
  includeSeconds = false,
  includeTzLabel = true
): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const formatted = d.toLocaleTimeString(INDONESIA_LOCALE, {
      timeZone: INDONESIA_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
    });

    return includeTzLabel ? `${formatted} WIB` : formatted;
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
    return new Date(isoString).toLocaleDateString(INDONESIA_LOCALE, {
      timeZone: INDONESIA_TIMEZONE,
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';
  } catch {
    return isoString;
  }
}

/**
 * Format angka mata uang Rupiah
 * Contoh: 15000 -> "Rp 15.000"
 */
export function formatRupiah(amount: number): string {
  return `Rp ${Number(amount || 0).toLocaleString(INDONESIA_LOCALE)}`;
}

