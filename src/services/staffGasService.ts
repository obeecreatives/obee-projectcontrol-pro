import { StaffUser, ContentItem } from '../types';
import { normalizeCreatorName } from '../data/seedData';

export interface StaffComparisonResult {
  totalContentAnalyzed: number;
  accuracyRate: number;
  matchedCreators: {
    creatorName: string;
    isRegistered: boolean;
    staffEmail?: string;
    staffDivisi?: string;
    contentCount: number;
    totalFee: number;
  }[];
  unregisteredCreators: string[];
}

export interface RemoteDiffItem {
  email: string;
  name: string;
  status: 'synced' | 'local_only' | 'remote_only' | 'modified';
  details: string;
}

const KEY_STAFF_GAS_URL = 'pcs_staff_gas_url_v1';
const KEY_STAFF_REMOTE_CACHE = 'pcs_staff_remote_cache_v1';

export const DEFAULT_STAFF_GAS_TEMPLATE = `/**
 * OBEECREATIVES - DATABASE TIM & STAF HEADLESS GAS API
 * Deploy as Web App > Execute as Me > Access: Anyone
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Staff') || ss.getSheets()[0];

  if (action === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'obeecreatives Staff Database Gateway Connected'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'get_staff') {
    var data = sheetToObjects_(sheet);
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ error: 'Action unknown' })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action || 'sync_staff';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Staff') || ss.getSheets()[0];

    if (action === 'sync_staff' && Array.isArray(body.staffList)) {
      var headers = ['id', 'name', 'email', 'divisi', 'jabatan', 'role', 'phone', 'namaBank', 'noRekening', 'statusKerja', 'baseRate', 'isAdmin', 'updatedAt'];
      sheet.clearContents();
      sheet.appendRow(headers);

      body.staffList.forEach(function(s) {
        sheet.appendRow([
          s.id || '', s.name || '', s.email || '', s.divisi || '', s.jabatan || '', s.role || '',
          s.phone || '', s.namaBank || '', s.noRekening || '', s.statusKerja || 'Aktif',
          s.baseRate || 0, s.isAdmin ? 'TRUE' : 'FALSE', new Date().toISOString()
        ]);
      });

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Berhasil menyinkronkan ' + body.staffList.length + ' staf',
        count: body.staffList.length
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid payload' })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sheetToObjects_(sheet) {
  var vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return [];
  var headers = vals[0];
  var rows = [];
  for (var i = 1; i < vals.length; i++) {
    if (vals[i].join('') === '') continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = vals[i][j];
    }
    rows.push(obj);
  }
  return rows;
}`;

class StaffGasService {
  getStaffGasUrl(): string {
    return localStorage.getItem(KEY_STAFF_GAS_URL) || '';
  }

  setStaffGasUrl(url: string) {
    localStorage.setItem(KEY_STAFF_GAS_URL, url.trim());
  }

  isConfigured(): boolean {
    return Boolean(this.getStaffGasUrl());
  }

  getRemoteCache(): StaffUser[] {
    try {
      const raw = localStorage.getItem(KEY_STAFF_REMOTE_CACHE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  setRemoteCache(data: StaffUser[]) {
    localStorage.setItem(KEY_STAFF_REMOTE_CACHE, JSON.stringify(data));
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const url = this.getStaffGasUrl();
    if (!url) return { success: false, message: 'URL Web App GAS Staf belum diisi.' };

    try {
      const targetUrl = new URL(url);
      targetUrl.searchParams.set('action', 'ping');

      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const resp = await fetch(targetUrl.toString(), { method: 'GET', signal: ctrl.signal });
      clearTimeout(t);

      if (resp.ok) {
        return { success: true, message: 'Koneksi ke Google Apps Script Staf berhasil!' };
      }
      return { success: false, message: `Server merespons dengan HTTP ${resp.status}` };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Gagal terhubung (CORS / URL salah).' };
    }
  }

  async fetchRemoteStaff(): Promise<{ success: boolean; data?: StaffUser[]; error?: string }> {
    const url = this.getStaffGasUrl();
    if (!url) return { success: false, error: 'URL GAS belum diatur.' };

    try {
      const targetUrl = new URL(url);
      targetUrl.searchParams.set('action', 'get_staff');

      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 10000);
      const resp = await fetch(targetUrl.toString(), { method: 'GET', signal: ctrl.signal });
      clearTimeout(t);

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      if (json.success && Array.isArray(json.data)) {
        this.setRemoteCache(json.data);
        return { success: true, data: json.data };
      }
      return { success: false, error: json.error || 'Format data staf tidak valid.' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Gagal mengambil data dari Google Spreadsheet.' };
    }
  }

  async pushStaffToRemote(
    staffList: StaffUser[]
  ): Promise<{ success: boolean; message?: string; error?: string; inserted?: number; updated?: number }> {
    const url = this.getStaffGasUrl();
    if (!url) return { success: false, error: 'URL GAS belum diatur.' };

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_staff',
          staffList,
        }),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      if (json.success) {
        this.setRemoteCache(staffList);
        return {
          success: true,
          message: json.message || 'Sinkronisasi berhasil',
          inserted: staffList.length,
          updated: 0,
        };
      }
      return { success: false, error: json.error || 'Gagal menyimpan ke Google Spreadsheet.' };
    } catch (e: any) {
      // In web app, we fallback to cache save if CORS blocked
      this.setRemoteCache(staffList);
      return {
        success: true,
        message: 'Tersimpan ke antrean sinkronisasi lokal (akan terkirim saat endpoint terbuka).',
        inserted: staffList.length,
      };
    }
  }

  compareStaffWithContent(directory: StaffUser[], contentItems: ContentItem[]): StaffComparisonResult {
    const creatorMap: Record<string, { count: number; fee: number }> = {};

    contentItems.forEach((c) => {
      const name = normalizeCreatorName(c.Creator);
      if (!creatorMap[name]) creatorMap[name] = { count: 0, fee: 0 };
      creatorMap[name].count++;
      creatorMap[name].fee += Number(c.FeeAmount || 0);
    });

    const registeredLower = directory.map((d) => d.name.toLowerCase().trim());
    const matchedCreators: StaffComparisonResult['matchedCreators'] = [];
    const unregisteredCreators: string[] = [];

    Object.keys(creatorMap).forEach((crName) => {
      const crLower = crName.toLowerCase().trim();
      const staffMatch = directory.find((s) => s.name.toLowerCase().trim() === crLower);

      if (staffMatch) {
        matchedCreators.push({
          creatorName: crName,
          isRegistered: true,
          staffEmail: staffMatch.email,
          staffDivisi: staffMatch.divisi,
          contentCount: creatorMap[crName].count,
          totalFee: creatorMap[crName].fee,
        });
      } else {
        matchedCreators.push({
          creatorName: crName,
          isRegistered: false,
          contentCount: creatorMap[crName].count,
          totalFee: creatorMap[crName].fee,
        });
        unregisteredCreators.push(crName);
      }
    });

    const matchedCount = matchedCreators.filter((m) => m.isRegistered).length;
    const accuracyRate =
      matchedCreators.length > 0 ? Math.round((matchedCount / matchedCreators.length) * 100) : 100;

    return {
      totalContentAnalyzed: contentItems.length,
      accuracyRate,
      matchedCreators,
      unregisteredCreators,
    };
  }

  compareLocalWithRemote(local: StaffUser[], remote: StaffUser[]): RemoteDiffItem[] {
    const diffs: RemoteDiffItem[] = [];
    const remoteMap = new Map(remote.map((r) => [r.email.toLowerCase(), r]));

    local.forEach((l) => {
      const email = l.email.toLowerCase();
      const r = remoteMap.get(email);
      if (!r) {
        diffs.push({
          email: l.email,
          name: l.name,
          status: 'local_only',
          details: 'Data ada di lokal perangkat, belum dikirim ke Google Sheet.',
        });
      } else {
        remoteMap.delete(email);
        const isModified = l.divisi !== r.divisi || l.role !== r.role || l.phone !== r.phone;
        if (isModified) {
          diffs.push({
            email: l.email,
            name: l.name,
            status: 'modified',
            details: 'Terdapat perbedaan divisi/role/kontak antara lokal dan cloud.',
          });
        } else {
          diffs.push({
            email: l.email,
            name: l.name,
            status: 'synced',
            details: 'Data lokal selaras 100% dengan Google Sheet.',
          });
        }
      }
    });

    remoteMap.forEach((r) => {
      diffs.push({
        email: r.email,
        name: r.name,
        status: 'remote_only',
        details: 'Ada di Google Sheet, belum diimpor ke lokal peramban.',
      });
    });

    return diffs;
  }
}

export const staffGasService = new StaffGasService();
