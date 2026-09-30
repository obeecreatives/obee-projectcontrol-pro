export class GasApiService {
  static normalizeGasUrl(url: string): string {
    let clean = (url || '').trim();
    while (clean.endsWith('/')) {
      clean = clean.slice(0, -1);
    }
    if (clean.includes('/macros/s/') && !clean.endsWith('/exec') && !clean.endsWith('/dev')) {
      clean += '/exec';
    }
    return clean;
  }

  static async testConnection(
    gasUrl: string,
    sheetId?: string
  ): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    const cleanUrl = this.normalizeGasUrl(gasUrl);
    if (!cleanUrl) {
      return { ok: false, message: 'URL Web App GAS belum diisi.', latencyMs: 0 };
    }

    const start = performance.now();
    try {
      const targetUrl = new URL(cleanUrl);
      targetUrl.searchParams.set('action', 'ping');
      if (sheetId) targetUrl.searchParams.set('sheet_id', sheetId);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(targetUrl.toString(), {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timer);

      const latencyMs = Math.round(performance.now() - start);

      if (response.ok) {
        return {
          ok: true,
          message: `Berhasil terhubung ke Google Apps Script (HTTP ${response.status})!`,
          latencyMs,
        };
      } else {
        return {
          ok: false,
          message: `Server GAS merespons dengan status HTTP ${response.status}`,
          latencyMs,
        };
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      if (err.name === 'AbortError') {
        return { ok: false, message: 'Koneksi timeout setelah 8 detik.', latencyMs };
      }
      return {
        ok: false,
        message: err?.message || 'Gagal menghubungi Web App GAS (CORS / offline).',
        latencyMs,
      };
    }
  }

  static async fetchContentFromGas(
    gasUrl: string,
    sheetId: string
  ): Promise<{ ok: boolean; data?: any[]; rateCards?: any[]; error?: string }> {
    const cleanUrl = this.normalizeGasUrl(gasUrl);
    try {
      const targetUrl = new URL(cleanUrl);
      targetUrl.searchParams.set('action', 'get_content');
      targetUrl.searchParams.set('sheet_id', sheetId);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      const resp = await fetch(targetUrl.toString(), {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const text = await resp.text();
      const json = JSON.parse(text);

      const content = json.data || json.content || json;
      if (Array.isArray(content)) {
        return {
          ok: true,
          data: content,
          rateCards: json.rateCard || json.rateCards,
        };
      }

      return { ok: false, error: 'Format data dari GAS bukan array baris konten.' };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Gagal memuat konten dari GAS.' };
    }
  }

  static getHeadlessGasTemplateCode(): string {
    return `/**
 * OBEECREATIVES PROJECT CONTROL - HEADLESS API GATEWAY
 * Deploy as: Web App > Execute as: Me > Who has access: Anyone
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  var sheetId = (e && e.parameter && e.parameter.sheet_id) || SpreadsheetApp.getActiveSpreadsheet().getId();
  
  if (action === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'obeecreatives PCS Gateway Active',
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'get_content') {
    var ss = SpreadsheetApp.openById(sheetId);
    var contentSheet = ss.getSheetByName('ContentTracker') || ss.getSheetByName('Content_Tracker');
    var rateSheet = ss.getSheetByName('RateCard');
    
    var contentData = sheetToObjects_(contentSheet);
    var rateData = sheetToObjects_(rateSheet);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      content: contentData,
      rateCard: rateData
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Action not recognized' })).setMimeType(ContentService.MimeType.JSON);
}

function sheetToObjects_(sheet) {
  if (!sheet) return [];
  var vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return [];
  var headers = vals[0];
  var rows = [];
  for (var i = 1; i < vals.length; i++) {
    var row = vals[i];
    if (row.join('') === '') continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
      obj[headers[j]] = val;
    }
    rows.push(obj);
  }
  return rows;
}`;
  }
}
