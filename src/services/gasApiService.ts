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
 * OBEECREATIVES PROJECT CONTROL - 2-WAY KANBAN SYNC API GATEWAY v3.1
 * Deploy as: Web App > Execute as: Me > Who has access: Anyone
 */

// SPREADSHEET ID OBEECREATIVES
var DEFAULT_SPREADSHEET_ID = '1wdsy4L0NbPOR39dYjnOM8Og_Os10piz9VT5DBglb0qQ';

var COLUMN_HEADERS = [
  'ID',
  'Klien',
  'TanggalProduksi',
  'Bulan',
  'Tahun',
  'Tema',
  'IdeKonten',
  'Detail',
  'JenisKonten',
  'Kategori',
  'SourceReferences',
  'MateriKonten',
  'ProjectTools',
  'Creator',
  'Status',
  'JadwalPosting',
  'File',
  'Catatan',
  'FeeAmount',
  'CreatedAt',
  'UpdatedAt',
  'ChecklistAsset',
  'ChecklistCaption',
  'TipeProject',
  'TanggalApprove'
];

function getSpreadsheet_(providedId) {
  var id = (providedId || '').trim();
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (e) {}
  }
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}
  return SpreadsheetApp.openById(DEFAULT_SPREADSHEET_ID);
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  var paramSheetId = e && e.parameter && e.parameter.sheet_id;
  
  if (action === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      status: 'online',
      message: 'obeecreatives 2-Way Kanban Sync Gateway Connected',
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'get_content') {
    var ss = getSpreadsheet_(paramSheetId);
    var contentSheet = ss.getSheetByName('ContentTracker') || ss.getSheetByName('Content_Tracker') || ss.getSheets()[0];
    var rateSheet = ss.getSheetByName('RateCard');
    
    ensureHeaders_(contentSheet);
    
    var contentData = sheetToObjects_(contentSheet);
    var rateData = rateSheet ? sheetToObjects_(rateSheet) : [];
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      total: contentData.length,
      data: contentData,
      rateCards: rateData
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Action not recognized: ' + action })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var raw = e.postData ? e.postData.contents : '';
    if (!raw) return createJsonResponse_({ success: false, error: 'Empty payload' });
    
    var body = JSON.parse(raw);
    var action = body.action || 'upsert_card';
    var ss = getSpreadsheet_(body.sheet_id);
    var sheet = ss.getSheetByName('ContentTracker') || ss.getSheetByName('Content_Tracker') || ss.getSheets()[0];
    
    ensureHeaders_(sheet);
    
    if (action === 'update_card_status') {
      return handleUpdateStatus_(sheet, body);
    }
    
    if (action === 'upsert_card') {
      return handleUpsertCard_(sheet, body.card || body);
    }
    
    if (action === 'delete_card') {
      return handleDeleteCard_(sheet, body.cardId || body.id);
    }
    
    if (action === 'bulk_sync_cards') {
      return handleBulkSyncCards_(sheet, body.cards || []);
    }
    
    return createJsonResponse_({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return createJsonResponse_({ success: false, error: err.toString() });
  }
}

function handleUpdateStatus_(sheet, body) {
  var cardId = String(body.cardId || '').trim();
  var newStatus = body.newStatus;
  var rowIdx = findRowById_(sheet, cardId);
  var headerMap = getHeaderMap_(sheet);
  var nowIso = new Date().toISOString();
  
  if (rowIdx > -1) {
    if (headerMap['Status']) sheet.getRange(rowIdx, headerMap['Status']).setValue(newStatus);
    if (headerMap['UpdatedAt']) sheet.getRange(rowIdx, headerMap['UpdatedAt']).setValue(nowIso);
    if (newStatus === 'Approved / RtP') {
      if (headerMap['TanggalApprove'] && body.tanggalApprove) {
        sheet.getRange(rowIdx, headerMap['TanggalApprove']).setValue(body.tanggalApprove);
      }
      if (headerMap['FeeAmount'] && body.feeAmount) {
        sheet.getRange(rowIdx, headerMap['FeeAmount']).setValue(body.feeAmount);
      }
    }
    return createJsonResponse_({ success: true, action: 'status_updated', row: rowIdx });
  } else if (body.card) {
    return handleUpsertCard_(sheet, body.card);
  }
  return createJsonResponse_({ success: false, error: 'Card not found' });
}

function handleUpsertCard_(sheet, card) {
  if (!card || !card.ID) return createJsonResponse_({ success: false, error: 'Invalid card' });
  var rowIdx = findRowById_(sheet, String(card.ID).trim());
  var headerMap = getHeaderMap_(sheet);
  var lastCol = sheet.getLastColumn();
  
  if (rowIdx > -1) {
    COLUMN_HEADERS.forEach(function(header) {
      var colIdx = headerMap[header];
      if (colIdx && card[header] !== undefined) {
        sheet.getRange(rowIdx, colIdx).setValue(card[header]);
      }
    });
    if (headerMap['UpdatedAt']) sheet.getRange(rowIdx, headerMap['UpdatedAt']).setValue(new Date().toISOString());
    return createJsonResponse_({ success: true, action: 'card_updated', row: rowIdx });
  } else {
    var newRow = [];
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    for (var i = 0; i < headers.length; i++) {
      var h = headers[i];
      var val = card[h] !== undefined ? card[h] : '';
      newRow.push(val);
    }
    sheet.appendRow(newRow);
    return createJsonResponse_({ success: true, action: 'card_inserted', row: sheet.getLastRow() });
  }
}

function handleDeleteCard_(sheet, cardId) {
  var rowIdx = findRowById_(sheet, String(cardId).trim());
  if (rowIdx > -1) {
    sheet.deleteRow(rowIdx);
    return createJsonResponse_({ success: true, action: 'card_deleted', row: rowIdx });
  }
  return createJsonResponse_({ success: false, error: 'Card not found' });
}

function handleBulkSyncCards_(sheet, cards) {
  if (!cards || !cards.length) return createJsonResponse_({ success: true, count: 0 });
  sheet.clearContents();
  sheet.appendRow(COLUMN_HEADERS);
  var rows = [];
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    var row = [];
    for (var j = 0; j < COLUMN_HEADERS.length; j++) {
      var h = COLUMN_HEADERS[j];
      row.push(c[h] !== undefined ? c[h] : '');
    }
    rows.push(row);
  }
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, COLUMN_HEADERS.length).setValues(rows);
  }
  return createJsonResponse_({ success: true, count: cards.length, timestamp: new Date().toISOString() });
}

function findRowById_(sheet, cardId) {
  if (!cardId) return -1;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  var idCol = 1;
  var headerMap = getHeaderMap_(sheet);
  if (headerMap['ID']) idCol = headerMap['ID'];
  var ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === cardId) return i + 2;
  }
  return -1;
}

function getHeaderMap_(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return {};
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    map[String(headers[i]).trim()] = i + 1;
  }
  return map;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMN_HEADERS);
  }
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
        var tz = 'Asia/Jakarta';
        try {
          tz = (ss && ss.getSpreadsheetTimeZone()) || Session.getScriptTimeZone() || 'Asia/Jakarta';
        } catch (e) {
          tz = 'Asia/Jakarta';
        }
        val = Utilities.formatDate(val, tz, 'yyyy-MM-dd');
      }
      obj[headers[j]] = val;
    }
    rows.push(obj);
  }
  return rows;
}

function createJsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}`;
  }
}
