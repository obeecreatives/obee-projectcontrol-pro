import { CrmClientItem, StaffUser } from '../types';
import { storageService } from './storageService';
import { authService } from './authService';

const KEY_CRM_GAS_URL = 'obee_crm_gas_url_v1';
const KEY_STAFF_GAS_URL = 'obee_staff_gas_url_v1';
const KEY_LAST_SYNC = 'obee_last_live_sync_v1';

export interface LiveSyncStats {
  crmAdded: number;
  crmUpdated: number;
  staffAdded: number;
  staffUpdated: number;
  timestamp: string;
  success: boolean;
  message: string;
}

export class LiveSyncService {
  getCrmGasUrl(): string {
    try {
      return localStorage.getItem(KEY_CRM_GAS_URL) || '';
    } catch {
      return '';
    }
  }

  setCrmGasUrl(url: string) {
    localStorage.setItem(KEY_CRM_GAS_URL, (url || '').trim());
  }

  getStaffGasUrl(): string {
    try {
      return localStorage.getItem(KEY_STAFF_GAS_URL) || '';
    } catch {
      return '';
    }
  }

  setStaffGasUrl(url: string) {
    localStorage.setItem(KEY_STAFF_GAS_URL, (url || '').trim());
  }

  getLastSyncTime(): string | null {
    try {
      return localStorage.getItem(KEY_LAST_SYNC);
    } catch {
      return null;
    }
  }

  setLastSyncTime(iso: string) {
    localStorage.setItem(KEY_LAST_SYNC, iso);
  }

  // Parse CSV text into array of objects
  parseCsv(csvText: string): Record<string, string>[] {
    const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = this.parseCsvLine(lines[0]);
    const results: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h.trim()] = (values[idx] || '').trim();
      });
      results.push(obj);
    }

    return results;
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    return values;
  }

  // Ingest raw CRM CSV data
  syncCrmFromCsv(csvText: string): { added: number; updated: number; clients: CrmClientItem[] } {
    const rows = this.parseCsv(csvText);
    const mapped: CrmClientItem[] = rows
      .map((r) => {
        const company = r.company || r.Company || r.perusahaan || r.Perusahaan || r.Klien || r.klien || '';
        const name = r.name || r.Name || r.PIC || r.pic || r.nama || r.Nama || '';
        if (!company.trim()) return null;

        return {
          id: r.id || r.ID || 'crm-' + Math.random().toString(36).substring(2, 9),
          name: name.trim(),
          company: company.trim(),
          phone: r.phone || r.Phone || r.telpon || r.NoTelpon || '',
          email: r.email || r.Email || '',
          division: r.division || r.Division || r.divisi || r.Divisi || '',
          notes: r.notes || r.Notes || r.catatan || '',
          createdAt: r.createdAt || r.CreatedAt || new Date().toISOString().split('T')[0],
          source: 'Spreadsheet CRM',
        };
      })
      .filter(Boolean) as CrmClientItem[];

    const res = storageService.mergeCrmClients(mapped);
    this.setLastSyncTime(new Date().toISOString());

    storageService.addActivityLog({
      ID: 'act-' + Math.random().toString(36).substring(2, 9),
      Timestamp: new Date().toISOString(),
      Action: 'Sinkronisasi CRM',
      ContentTema: `Tersinkron ${res.added} klien baru & ${res.updated} diperbarui`,
      Klien: 'CRM Master',
    });

    return { added: res.added, updated: res.updated, clients: res.list };
  }

  // Ingest raw Staff CSV data
  syncStaffFromCsv(csvText: string): { added: number; updated: number; total: number } {
    const rows = this.parseCsv(csvText);
    const directory = authService.getDirectory();
    let added = 0;
    let updated = 0;

    rows.forEach((r) => {
      const email = (r.Email || r.email || '').trim().toLowerCase();
      const name = (r.Nama || r.nama || r.Name || r.name || '').trim();
      if (!name) return;

      const cleanEmail = email || (name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@obeecreatives.com');
      const divisi = r.Divisi || r.divisi || 'Kreatif';
      const jabatan = r.Jabatan || r.jabatan || 'Staff';
      const statusKerja = r.Status || r.status || 'Aktif';
      const phone = r.NoTelpon || r.notelpon || r.Phone || '';
      const namaBank = r.NamaBank || r.bank || (r.Catatan?.includes('Bank Jago') ? 'Bank Jago' : r.Catatan?.includes('BNI') ? 'BNI' : r.Catatan?.includes('BCA') ? 'BCA' : '');
      const noRekening = r.NoRekening || r.rekening || '';
      const instagram = r.Instagram || r.instagram || '';
      const alamat = r.Alamat || r.alamat || '';
      const gradeSkill = r.GradeSkill || r.gradeskill || '';
      const gajiPokok = r.GajiPokok || '';
      const tunjJabatan = r.TunjJabatan || '';
      const catatan = r.Catatan || r.catatan || '';

      const existingIdx = directory.findIndex(
        (u) =>
          u.email.toLowerCase() === cleanEmail ||
          (cleanEmail === 'putrikriswardani@gmail.com' && u.email === 'febrina.putri@gmail.com') ||
          u.name.toLowerCase() === name.toLowerCase()
      );

      const isStaffAdmin =
        cleanEmail === 'loehendra@gmail.com' ||
        cleanEmail === 'obeetools@gmail.com' ||
        cleanEmail === 'obeecreatives@gmail.com' ||
        cleanEmail === 'admin@obeecreatives.com' ||
        jabatan.toLowerCase().includes('ceo') ||
        jabatan.toLowerCase().includes('manager');

      const role =
        cleanEmail === 'loehendra@gmail.com'
          ? 'project_manager'
          : cleanEmail === 'obeetools@gmail.com' || cleanEmail === 'obeecreatives@gmail.com'
          ? 'web_developer'
          : isStaffAdmin
          ? 'admin'
          : 'staff_creator';

      if (existingIdx > -1) {
        directory[existingIdx] = {
          ...directory[existingIdx],
          name,
          divisi,
          jabatan,
          statusKerja,
          phone: phone || directory[existingIdx].phone,
          namaBank: namaBank || directory[existingIdx].namaBank,
          noRekening: noRekening || directory[existingIdx].noRekening,
          instagram: instagram || directory[existingIdx].instagram,
          alamat: alamat || directory[existingIdx].alamat,
          gradeSkill: gradeSkill || directory[existingIdx].gradeSkill,
          gajiPokok: gajiPokok || directory[existingIdx].gajiPokok,
          tunjJabatan: tunjJabatan || directory[existingIdx].tunjJabatan,
          catatan: catatan || directory[existingIdx].catatan,
        };
        updated++;
      } else {
        const newStaffUser: StaffUser = {
          id: r.ID || r.id || 'STF-' + Date.now(),
          name,
          email: cleanEmail,
          divisi,
          jabatan,
          role,
          phone,
          statusKerja,
          baseRate: 30000,
          namaBank,
          noRekening,
          isAdmin: isStaffAdmin,
          createdAt: r.CreatedAt || r.TanggalMulai || new Date().toISOString().split('T')[0],
          instagram,
          alamat,
          gradeSkill,
          gajiPokok,
          tunjJabatan,
          catatan,
        };
        authService.registerWhitelistUser(newStaffUser, undefined, 'CRM Sync Gateway');
        added++;
      }
    });

    authService.setDirectory(directory);
    this.setLastSyncTime(new Date().toISOString());

    storageService.addActivityLog({
      ID: 'act-' + Math.random().toString(36).substring(2, 9),
      Timestamp: new Date().toISOString(),
      Action: 'Sinkronisasi Staf',
      ContentTema: `Tersinkron ${added} staf baru & ${updated} staf diperbarui`,
      Klien: 'Database Staff Master',
    });

    return { added, updated, total: directory.length };
  }

  // Pull live data from GAS Web App endpoint or Google Spreadsheet direct CSV export
  async fetchRemoteCrm(gasUrl?: string): Promise<{ success: boolean; added: number; updated: number; error?: string; notConfigured?: boolean }> {
    const rawUrl = (gasUrl?.trim() || this.getCrmGasUrl()).trim();
    if (!rawUrl) {
      return { success: false, added: 0, updated: 0, notConfigured: true, error: 'URL Google Spreadsheet / Web App GAS CRM belum diatur.' };
    }

    try {
      // Check if it's a direct Google Spreadsheet link
      const sheetMatch = rawUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (sheetMatch) {
        const sheetId = sheetMatch[1];
        const gidMatch = rawUrl.match(/[#?&]gid=([0-9]+)/);
        const gid = gidMatch ? gidMatch[1] : undefined;
        
        // Try gviz tq CSV export (CORS friendly)
        const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gid ? `&gid=${gid}` : ''}`;
        const res = await fetch(gvizUrl);
        if (!res.ok) {
          // Fallback to export?format=csv
          const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gid ? `&gid=${gid}` : ''}`;
          const res2 = await fetch(exportUrl);
          if (!res2.ok) {
            throw new Error(`Google Sheet tidak dapat diakses (Status ${res2.status}). Pastikan spreadsheet diset ke "Siapa saja yang memiliki link dapat melihat".`);
          }
          const csvText = await res2.text();
          const r = this.syncCrmFromCsv(csvText);
          return { success: true, added: r.added, updated: r.updated };
        }
        const csvText = await res.text();
        const r = this.syncCrmFromCsv(csvText);
        return { success: true, added: r.added, updated: r.updated };
      }

      // Check if it's a GAS Web App endpoint
      const urlObj = new URL(rawUrl);
      urlObj.searchParams.set('action', 'get_clients');

      const res = await fetch(urlObj.toString(), { method: 'GET' });
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      const text = await res.text();
      // Test if response is JSON or CSV
      try {
        const json = JSON.parse(text);
        if (json.success && Array.isArray(json.data)) {
          const mergeRes = storageService.mergeCrmClients(json.data);
          this.setLastSyncTime(new Date().toISOString());
          return { success: true, added: mergeRes.added, updated: mergeRes.updated };
        }
        if (json.error) {
          throw new Error(json.error);
        }
      } catch {
        // If not JSON, try parsing as CSV
        if (text.includes(',') || text.includes('\n')) {
          const r = this.syncCrmFromCsv(text);
          return { success: true, added: r.added, updated: r.updated };
        }
      }

      throw new Error('Format data dari URL CRM tidak dikenali.');
    } catch (err: any) {
      return { success: false, added: 0, updated: 0, error: err?.message || 'Gagal menghubungi server CRM.' };
    }
  }

  // Pull live data from GAS Staff Web App endpoint or Google Spreadsheet direct CSV export
  async fetchRemoteStaff(gasUrl?: string): Promise<{ success: boolean; added: number; updated: number; error?: string; notConfigured?: boolean }> {
    const rawUrl = (gasUrl?.trim() || this.getStaffGasUrl()).trim();
    if (!rawUrl) {
      return { success: false, added: 0, updated: 0, notConfigured: true, error: 'URL Google Spreadsheet / Web App GAS Database Staff belum diatur.' };
    }

    try {
      // Check if it's a direct Google Spreadsheet link
      const sheetMatch = rawUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (sheetMatch) {
        const sheetId = sheetMatch[1];
        const gidMatch = rawUrl.match(/[#?&]gid=([0-9]+)/);
        const gid = gidMatch ? gidMatch[1] : undefined;

        // Try gviz tq CSV export (CORS friendly)
        const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gid ? `&gid=${gid}` : ''}`;
        const res = await fetch(gvizUrl);
        if (!res.ok) {
          // Fallback to export?format=csv
          const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gid ? `&gid=${gid}` : ''}`;
          const res2 = await fetch(exportUrl);
          if (!res2.ok) {
            throw new Error(`Google Sheet tidak dapat diakses (Status ${res2.status}). Pastikan spreadsheet diset ke "Siapa saja yang memiliki link dapat melihat".`);
          }
          const csvText = await res2.text();
          const r = this.syncStaffFromCsv(csvText);
          return { success: true, added: r.added, updated: r.updated };
        }
        const csvText = await res.text();
        const r = this.syncStaffFromCsv(csvText);
        return { success: true, added: r.added, updated: r.updated };
      }

      // Check if it's a GAS Web App endpoint
      const urlObj = new URL(rawUrl);
      urlObj.searchParams.set('action', 'get_staff');

      const res = await fetch(urlObj.toString(), { method: 'GET' });
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (json.success && Array.isArray(json.data)) {
          let added = 0;
          let updated = 0;
          const dir = authService.getDirectory();

          json.data.forEach((item: any) => {
            const email = (item.Email || item.email || '').trim().toLowerCase();
            const name = (item.Nama || item.nama || item.name || '').trim();
            if (!name) return;

            const cleanEmail = email || (name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@obeecreatives.com');
            const found = dir.find((u) => u.email.toLowerCase() === cleanEmail || u.name.toLowerCase() === name.toLowerCase());

            if (found) {
              found.name = name;
              found.divisi = item.Divisi || found.divisi;
              found.jabatan = item.Jabatan || found.jabatan;
              found.statusKerja = item.Status || found.statusKerja;
              found.phone = item.NoTelpon || found.phone;
              found.namaBank = item.NamaBank || found.namaBank;
              found.noRekening = item.NoRekening || found.noRekening;
              found.instagram = item.Instagram || found.instagram;
              found.alamat = item.Alamat || found.alamat;
              found.gradeSkill = item.GradeSkill || found.gradeSkill;
              updated++;
            } else {
              const isStaffAdmin =
                cleanEmail === 'loehendra@gmail.com' ||
                cleanEmail === 'obeetools@gmail.com' ||
                cleanEmail === 'obeecreatives@gmail.com' ||
                cleanEmail === 'admin@obeecreatives.com';

              const newStaff: StaffUser = {
                id: item.ID || item.id || 'STF-' + Date.now(),
                name,
                email: cleanEmail,
                divisi: item.Divisi || 'Kreatif',
                jabatan: item.Jabatan || 'Staff',
                role: cleanEmail === 'loehendra@gmail.com' ? 'project_manager' : isStaffAdmin ? 'admin' : 'staff_creator',
                phone: item.NoTelpon || '',
                statusKerja: item.Status || 'Aktif',
                baseRate: 30000,
                namaBank: item.NamaBank || '',
                noRekening: item.NoRekening || '',
                isAdmin: isStaffAdmin,
                createdAt: item.CreatedAt || new Date().toISOString().split('T')[0],
                instagram: item.Instagram || '',
                alamat: item.Alamat || '',
                gradeSkill: item.GradeSkill || '',
              };
              authService.registerWhitelistUser(newStaff, undefined, 'Staff GAS Sync');
              added++;
            }
          });

          authService.setDirectory(dir);
          this.setLastSyncTime(new Date().toISOString());
          return { success: true, added, updated };
        }
      } catch {
        if (text.includes(',') || text.includes('\n')) {
          const r = this.syncStaffFromCsv(text);
          return { success: true, added: r.added, updated: r.updated };
        }
      }

      throw new Error('Format data dari URL Database Staff tidak dikenali.');
    } catch (err: any) {
      return { success: false, added: 0, updated: 0, error: err?.message || 'Gagal menghubungi server Database Staff.' };
    }
  }

  // Pull All Remote Data (CRM + Staff)
  async syncAll(): Promise<LiveSyncStats> {
    const crmRes = await this.fetchRemoteCrm();
    const staffRes = await this.fetchRemoteStaff();

    const timestamp = new Date().toISOString();
    this.setLastSyncTime(timestamp);

    const isSuccess = crmRes.success || staffRes.success;
    let message = '';
    if (crmRes.success && staffRes.success) {
      message = `Berhasil menarik data: ${crmRes.added + crmRes.updated} klien CRM & ${staffRes.added + staffRes.updated} data staf diperbarui!`;
    } else if (crmRes.success) {
      message = `Data CRM tersinkron (${crmRes.added + crmRes.updated} klien), namun GAS Staff: ${staffRes.error}`;
    } else if (staffRes.success) {
      message = `Data Staf tersinkron (${staffRes.added + staffRes.updated} staf), namun GAS CRM: ${crmRes.error}`;
    } else {
      message = `Gagal sinkronisasi remote: ${crmRes.error || ''} & ${staffRes.error || ''}. Anda juga dapat menggunakan fitur tempel CSV langsung.`;
    }

    return {
      crmAdded: crmRes.added,
      crmUpdated: crmRes.updated,
      staffAdded: staffRes.added,
      staffUpdated: staffRes.updated,
      timestamp,
      success: isSuccess,
      message,
    };
  }

  // Generate Google Apps Script code for CRM Spreadsheet
  generateCrmGasScript(): string {
    return `/**
 * OBEECREATIVES - CRM SPREADSHEET GATEWAY
 * Skrip ini dipasang di Spreadsheet CRM (Extensions > Apps Script)
 * Deploy as: Web App > Execute as: Me > Who has access: Anyone
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('CRM') || ss.getSheetByName('Clients') || ss.getSheets()[0];

  if (action === 'ping') {
    return createJsonResponse_({
      success: true,
      message: 'obeecreatives CRM Gateway Connected',
      totalRows: sheet.getLastRow()
    });
  }

  if (action === 'get_clients') {
    var data = sheetToObjects_(sheet);
    return createJsonResponse_({
      success: true,
      timestamp: new Date().toISOString(),
      total: data.length,
      data: data
    });
  }

  return createJsonResponse_({ error: 'Action unknown: ' + action });
}

function sheetToObjects_(sheet) {
  var range = sheet.getDataRange();
  var values = range.getValues();
  if (values.length < 2) return [];

  var headers = values[0];
  var list = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    var hasData = false;

    for (var j = 0; j < headers.length; j++) {
      var key = String(headers[j]).trim();
      var val = row[j];
      if (val !== '' && val !== null) hasData = true;
      obj[key] = val;
    }

    if (hasData) {
      list.push(obj);
    }
  }

  return list;
}

function createJsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
  }

  // Generate Google Apps Script code for Staff Database Spreadsheet
  generateStaffGasScript(): string {
    return `/**
 * OBEECREATIVES - DATABASE TIM & STAF GATEWAY
 * Skrip ini dipasang di Spreadsheet Database Staff (Extensions > Apps Script)
 * Deploy as: Web App > Execute as: Me > Who has access: Anyone
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Staff') || ss.getSheetByName('Database Staff') || ss.getSheets()[0];

  if (action === 'ping') {
    return createJsonResponse_({
      success: true,
      message: 'obeecreatives Staff Database Gateway Connected',
      totalRows: sheet.getLastRow()
    });
  }

  if (action === 'get_staff') {
    var data = sheetToObjects_(sheet);
    return createJsonResponse_({
      success: true,
      timestamp: new Date().toISOString(),
      total: data.length,
      data: data
    });
  }

  return createJsonResponse_({ error: 'Action unknown: ' + action });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action || 'sync_fees';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'sync_fees') {
      var feeSheet = ss.getSheetByName('Rekap Fee') || ss.insertSheet('Rekap Fee');
      if (feeSheet.getLastRow() === 0) {
        feeSheet.appendRow(['Timestamp', 'ContentID', 'Klien', 'Tema', 'Creator', 'Email', 'FeeAmount', 'Status']);
      }
      var items = body.items || [];
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        feeSheet.appendRow([
          new Date(),
          it.ID,
          it.Klien,
          it.Tema,
          it.Creator,
          it.CreatorEmail || '',
          it.FeeAmount,
          it.Status
        ]);
      }
      return createJsonResponse_({ success: true, count: items.length });
    }

    return createJsonResponse_({ error: 'Unknown POST action' });
  } catch (err) {
    return createJsonResponse_({ error: err.toString() });
  }
}

function sheetToObjects_(sheet) {
  var range = sheet.getDataRange();
  var values = range.getValues();
  if (values.length < 2) return [];

  var headers = values[0];
  var list = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    var hasData = false;

    for (var j = 0; j < headers.length; j++) {
      var key = String(headers[j]).trim();
      var val = row[j];
      if (val !== '' && val !== null) hasData = true;
      obj[key] = val;
    }

    if (hasData) {
      list.push(obj);
    }
  }

  return list;
}

function createJsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
  }
}

export const liveSyncService = new LiveSyncService();
