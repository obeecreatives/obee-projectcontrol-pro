import { ContentItem, StatusType } from '../types';
import { storageService } from './storageService';
import { GasApiService } from './gasApiService';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'pending' | 'error';

export interface KanbanSyncState {
  status: SyncStatus;
  lastSyncTime: string | null;
  pendingCount: number;
  autoSyncEnabled: boolean;
  message: string;
}

interface QueuedCardChange {
  id: string;
  action: 'upsert' | 'status_change' | 'delete';
  card?: ContentItem;
  cardId?: string;
  newStatus?: StatusType;
  oldStatus?: StatusType;
  timestamp: string;
}

const KEY_KANBAN_QUEUE = 'obee_kanban_sync_queue_v2';
const KEY_AUTO_SYNC_ENABLED = 'obee_kanban_auto_sync_enabled_v1';
const KEY_AUTO_SYNC_INTERVAL = 'obee_kanban_auto_sync_interval_v1';
const KEY_LAST_CARD_SYNC = 'obee_kanban_last_card_sync_v1';

type StateListener = (state: KanbanSyncState) => void;

export class KanbanSyncService {
  private listeners: Set<StateListener> = new Set();
  private isProcessingQueue = false;
  private autoSyncTimer: any = null;
  private currentStatus: SyncStatus = 'idle';
  private currentMessage = '2-Arah Siap Terhubung';

  constructor() {
    // Attempt auto-flush when online
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processQueue();
      });
    }
  }

  // --- Settings & State ---

  getAutoSyncEnabled(): boolean {
    try {
      const saved = localStorage.getItem(KEY_AUTO_SYNC_ENABLED);
      return saved !== null ? saved === 'true' : true; // Default ON
    } catch {
      return true;
    }
  }

  setAutoSyncEnabled(enabled: boolean) {
    try {
      localStorage.setItem(KEY_AUTO_SYNC_ENABLED, String(enabled));
      this.notify();
      if (enabled) {
        this.startAutoSyncPolling();
      } else {
        this.stopAutoSyncPolling();
      }
    } catch {}
  }

  getAutoSyncInterval(): number {
    try {
      const saved = localStorage.getItem(KEY_AUTO_SYNC_INTERVAL);
      return saved ? Math.max(15, parseInt(saved, 10)) : 45; // Default 45s
    } catch {
      return 45;
    }
  }

  setAutoSyncInterval(seconds: number) {
    try {
      localStorage.setItem(KEY_AUTO_SYNC_INTERVAL, String(Math.max(15, seconds)));
      if (this.getAutoSyncEnabled()) {
        this.stopAutoSyncPolling();
        this.startAutoSyncPolling();
      }
    } catch {}
  }

  getLastSyncTime(): string | null {
    try {
      return localStorage.getItem(KEY_LAST_CARD_SYNC);
    } catch {
      return null;
    }
  }

  setLastSyncTime(iso: string) {
    try {
      localStorage.setItem(KEY_LAST_CARD_SYNC, iso);
    } catch {}
  }

  getGasUrl(): string {
    return storageService.getGasUrl();
  }

  setGasUrl(url: string) {
    storageService.setGasUrl(url);
    this.notify();
  }

  getState(): KanbanSyncState {
    const queue = this.getQueue();
    return {
      status: this.currentStatus,
      lastSyncTime: this.getLastSyncTime(),
      pendingCount: queue.length,
      autoSyncEnabled: this.getAutoSyncEnabled(),
      message: this.currentMessage,
    };
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  // --- Queue Operations ---

  private getQueue(): QueuedCardChange[] {
    try {
      const raw = localStorage.getItem(KEY_KANBAN_QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: QueuedCardChange[]) {
    try {
      localStorage.setItem(KEY_KANBAN_QUEUE, JSON.stringify(queue));
    } catch {}
  }

  // Enqueue a card status change (Kanban drag-and-drop or status selector)
  queueStatusChange(id: string, newStatus: StatusType, card?: ContentItem, oldStatus?: StatusType) {
    const queue = this.getQueue();
    // Consolidate any existing status change for the same card
    const existingIdx = queue.findIndex((q) => q.cardId === id && q.action === 'status_change');
    const change: QueuedCardChange = {
      id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      action: 'status_change',
      cardId: id,
      newStatus,
      oldStatus,
      card,
      timestamp: new Date().toISOString(),
    };

    if (existingIdx > -1) {
      queue[existingIdx] = change;
    } else {
      queue.push(change);
    }

    this.saveQueue(queue);
    this.currentMessage = `Perubahan status kartu "${newStatus}" disimpan di antrean sinkron`;
    this.notify();

    // Trigger immediate background push
    this.processQueue();
  }

  // Enqueue card upsert (Create / Edit modal / Checklist toggle)
  queueCardUpsert(card: ContentItem) {
    const queue = this.getQueue();
    const existingIdx = queue.findIndex((q) => q.cardId === card.ID && q.action === 'upsert');
    const change: QueuedCardChange = {
      id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      action: 'upsert',
      cardId: card.ID,
      card,
      timestamp: new Date().toISOString(),
    };

    if (existingIdx > -1) {
      queue[existingIdx] = change;
    } else {
      queue.push(change);
    }

    this.saveQueue(queue);
    this.currentMessage = `Perubahan kartu "${card.Tema || card.IdeKonten || card.ID}" siap dikirim`;
    this.notify();

    this.processQueue();
  }

  // Enqueue card delete
  queueCardDelete(id: string) {
    const queue = this.getQueue();
    queue.push({
      id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      action: 'delete',
      cardId: id,
      timestamp: new Date().toISOString(),
    });
    this.saveQueue(queue);
    this.notify();

    this.processQueue();
  }

  // --- Background Push Execution ---

  async processQueue(): Promise<{ processed: number; remaining: number }> {
    if (this.isProcessingQueue) {
      return { processed: 0, remaining: this.getQueue().length };
    }

    const gasUrl = this.getGasUrl();
    const queue = this.getQueue();

    if (!gasUrl || queue.length === 0) {
      if (queue.length > 0) {
        this.currentStatus = 'pending';
        this.currentMessage = `${queue.length} perubahan tersimpan lokal (menunggu konfigurasi URL GAS)`;
        this.notify();
      }
      return { processed: 0, remaining: queue.length };
    }

    this.isProcessingQueue = true;
    this.currentStatus = 'syncing';
    this.currentMessage = `Menyinkronkan ${queue.length} perubahan kartu ke Spreadsheet...`;
    this.notify();

    let processed = 0;

    try {
      while (queue.length > 0) {
        const item = queue[0];
        const success = await this.sendPostToGas(gasUrl, item);

        if (success) {
          queue.shift();
          this.saveQueue(queue);
          processed++;
          this.setLastSyncTime(new Date().toISOString());
        } else {
          // Break on network error, retry later
          break;
        }
      }

      if (queue.length === 0) {
        this.currentStatus = 'synced';
        this.currentMessage = `Seluruh kartu Kanban tersinkron 2-arah ke Spreadsheet!`;
      } else {
        this.currentStatus = 'pending';
        this.currentMessage = `${queue.length} perubahan tertunda di antrean (koneksi terputus)`;
      }
    } catch (err: any) {
      this.currentStatus = 'error';
      this.currentMessage = `Kendala sinkronisasi: ${err?.message || 'Gagal mengirim ke GAS'}`;
    } finally {
      this.isProcessingQueue = false;
      this.notify();
    }

    return { processed, remaining: queue.length };
  }

  // Send single payload to GAS endpoint
  private async sendPostToGas(gasUrl: string, item: QueuedCardChange): Promise<boolean> {
    try {
      const cleanUrl = GasApiService.normalizeGasUrl(gasUrl);
      let payloadAction = 'upsert_card';
      let payloadBody: any = {};

      if (item.action === 'status_change') {
        payloadAction = 'update_card_status';
        payloadBody = {
          action: 'update_card_status',
          cardId: item.cardId,
          newStatus: item.newStatus,
          oldStatus: item.oldStatus,
          feeAmount: item.card?.FeeAmount,
          tanggalApprove: item.card?.TanggalApprove,
          updatedAt: item.timestamp,
        };
      } else if (item.action === 'upsert') {
        payloadAction = 'upsert_card';
        payloadBody = {
          action: 'upsert_card',
          card: item.card,
        };
      } else if (item.action === 'delete') {
        payloadAction = 'delete_card';
        payloadBody = {
          action: 'delete_card',
          cardId: item.cardId,
        };
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      // We use text/plain to avoid CORS preflight options blocking
      const response = await fetch(cleanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payloadBody),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.ok) {
        try {
          const resJson = await response.json();
          if (resJson.success !== false) {
            return true;
          }
        } catch {
          // If response not JSON but HTTP OK, still consider delivered
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  // --- Bulk Push All Cards ---

  async pushAllCardsToSpreadsheet(cards: ContentItem[]): Promise<{ success: boolean; message: string; count: number }> {
    const gasUrl = this.getGasUrl();
    if (!gasUrl) {
      return { success: false, message: 'URL Web App GAS belum dikonfigurasi.', count: 0 };
    }

    this.currentStatus = 'syncing';
    this.currentMessage = `Mengirim seluruh ${cards.length} kartu Kanban ke Spreadsheet...`;
    this.notify();

    try {
      const cleanUrl = GasApiService.normalizeGasUrl(gasUrl);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(cleanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'bulk_sync_cards',
          cards,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      // Clear pending queue since all cards are now pushed
      this.saveQueue([]);
      this.setLastSyncTime(new Date().toISOString());
      this.currentStatus = 'synced';
      this.currentMessage = `Berhasil! Seluruh ${cards.length} kartu Kanban tersinkron di Spreadsheet.`;
      this.notify();

      return { success: true, message: this.currentMessage, count: cards.length };
    } catch (err: any) {
      this.currentStatus = 'error';
      this.currentMessage = `Gagal push massal: ${err?.message || 'Koneksi terganggu'}`;
      this.notify();
      return { success: false, message: this.currentMessage, count: 0 };
    }
  }

  // --- Pull Remote Cards & Intelligent Merge ---

  async pullCardsFromSpreadsheet(sheetId?: string): Promise<{
    success: boolean;
    added: number;
    updated: number;
    total: number;
    cards: ContentItem[];
    error?: string;
  }> {
    const gasUrl = this.getGasUrl();
    if (!gasUrl) {
      return {
        success: false,
        added: 0,
        updated: 0,
        total: storageService.getContent().length,
        cards: storageService.getContent(),
        error: 'URL Web App GAS belum diatur.',
      };
    }

    this.currentStatus = 'syncing';
    this.currentMessage = 'Menarik kartu terbaru dari Spreadsheet...';
    this.notify();

    try {
      const targetSheetId = sheetId || '1wdsy4L0NbPOR39dYjnOM8Og_Os10piz9VT5DBglb0qQ';
      const res = await GasApiService.fetchContentFromGas(gasUrl, targetSheetId);

      if (!res.ok || !Array.isArray(res.data)) {
        throw new Error(res.error || 'Data yang diterima bukan format baris kartu yang valid.');
      }

      const remoteRows = res.data;
      const localCards = storageService.getContent();
      const queue = this.getQueue();
      const pendingIds = new Set(queue.map((q) => q.cardId));

      let added = 0;
      let updated = 0;

      const mergedMap = new Map<string, ContentItem>();
      localCards.forEach((c) => mergedMap.set(c.ID, c));

      remoteRows.forEach((r: any) => {
        const id = (r.ID || r.id || '').trim();
        if (!id) return;

        // If card has pending local un-pushed change, preserve local copy
        if (pendingIds.has(id)) return;

        const mappedCard: ContentItem = {
          ID: id,
          Klien: r.Klien || r.klien || 'Klien Baru',
          TanggalProduksi: r.TanggalProduksi || r.tanggal_produksi || '',
          Bulan: r.Bulan || r.bulan || '',
          Tahun: Number(r.Tahun || r.tahun) || new Date().getFullYear(),
          Tema: r.Tema || r.tema || r.IdeKonten || 'Konten',
          IdeKonten: r.IdeKonten || r.ide_konten || '',
          Detail: r.Detail || r.detail || '',
          JenisKonten: r.JenisKonten || r.jenis_konten || 'Single Post',
          Kategori: r.Kategori || r.kategori || 'Desain',
          SourceReferences: r.SourceReferences || '',
          MateriKonten: r.MateriKonten || '',
          ProjectTools: r.ProjectTools || 'Canva',
          Creator: r.Creator || r.creator || '',
          Status: (r.Status || r.status || 'New Idea') as StatusType,
          JadwalPosting: r.JadwalPosting || '',
          File: r.File || '',
          Catatan: r.Catatan || '',
          FeeAmount: Number(r.FeeAmount) || 0,
          CreatedAt: r.CreatedAt || new Date().toISOString(),
          UpdatedAt: r.UpdatedAt || new Date().toISOString(),
          ChecklistAsset: r.ChecklistAsset === true || String(r.ChecklistAsset).toUpperCase() === 'TRUE',
          ChecklistCaption: r.ChecklistCaption === true || String(r.ChecklistCaption).toUpperCase() === 'TRUE',
          TipeProject: r.TipeProject === 'Internal' ? 'Internal' : 'Komersil',
          TanggalApprove: r.TanggalApprove || '',
        };

        if (mergedMap.has(id)) {
          const existing = mergedMap.get(id)!;
          // Preserve comments if existing
          if (existing.comments && existing.comments.length > 0) {
            mappedCard.comments = existing.comments;
          }
          mergedMap.set(id, { ...existing, ...mappedCard });
          updated++;
        } else {
          mergedMap.set(id, mappedCard);
          added++;
        }
      });

      const finalCards = Array.from(mergedMap.values());
      storageService.saveContent(finalCards);

      if (res.rateCards && res.rateCards.length > 0) {
        localStorage.setItem('obee_pcs_rate_card_v1', JSON.stringify(res.rateCards));
      }

      this.setLastSyncTime(new Date().toISOString());
      this.currentStatus = 'synced';
      this.currentMessage = `Berhasil menarik data: ${added} kartu baru, ${updated} kartu diperbarui. Total: ${finalCards.length} kartu.`;
      this.notify();

      return {
        success: true,
        added,
        updated,
        total: finalCards.length,
        cards: finalCards,
      };
    } catch (err: any) {
      this.currentStatus = 'error';
      this.currentMessage = `Gagal menarik data: ${err?.message || 'Koneksi terputus'}`;
      this.notify();

      return {
        success: false,
        added: 0,
        updated: 0,
        total: storageService.getContent().length,
        cards: storageService.getContent(),
        error: err?.message,
      };
    }
  }

  // --- Auto-Sync Interval (Polling) ---

  startAutoSyncPolling(onDataPulled?: (cards: ContentItem[]) => void) {
    this.stopAutoSyncPolling();
    if (!this.getAutoSyncEnabled()) return;

    const intervalSec = this.getAutoSyncInterval();
    this.autoSyncTimer = setInterval(async () => {
      // 1. Flush any pending queue first
      if (this.getQueue().length > 0) {
        await this.processQueue();
      }

      // 2. Poll remote if idle
      if (this.getGasUrl() && !this.isProcessingQueue) {
        const pullRes = await this.pullCardsFromSpreadsheet();
        if (pullRes.success && (pullRes.added > 0 || pullRes.updated > 0) && onDataPulled) {
          onDataPulled(pullRes.cards);
        }
      }
    }, intervalSec * 1000);
  }

  stopAutoSyncPolling() {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
    }
  }

  // --- Google Apps Script Template Generator ---

  generateFullTwoWayGasScript(): string {
    return `/**
 * =========================================================================
 * OBEECREATIVES PROJECT CONTROL - 2-WAY REAL-TIME KANBAN GATEWAY v3.0
 * =========================================================================
 * Skrip ini dipasang di Google Spreadsheet Master (Extensions > Apps Script).
 * Mendukung sinkronisasi DUA ARAH (Two-Way Sync):
 * 1. Pull: Web App menarik seluruh kartu Kanban & Rate Cards dari Spreadsheet.
 * 2. Push Real-Time: Setiap kartu digeser di Kanban (drag & drop), diedit,
 *    dibuat baru, atau dihapus, otomatis terupdate di baris Spreadsheet ini!
 * 
 * LANGKAH DEPLOY:
 * 1. Buka Extensions > Apps Script pada Spreadsheet Anda.
 * 2. Tempel seluruh kode ini ke 'Code.gs'.
 * 3. Klik 'Deploy' > 'New deployment'.
 * 4. Pilih tipe: 'Web app'.
 * 5. Description: 'obeecreatives 2-Way Kanban Sync Gateway'.
 * 6. Execute as: 'Me' (email Anda).
 * 7. Who has access: 'Anyone' (Siapa saja, agar web app bisa push).
 * 8. Klik Deploy, Authorize access, dan salin URL Web App yang didapat ke Web App!
 * =========================================================================
 */

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

/**
 * GET Handler - Tarik Kartu & Rate Cards dari Spreadsheet
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  var sheetId = (e && e.parameter && e.parameter.sheet_id) || SpreadsheetApp.getActiveSpreadsheet().getId();
  
  if (action === 'ping') {
    return createJsonResponse_({
      success: true,
      status: 'online',
      message: 'obeecreatives 2-Way Kanban Sync Gateway Connected',
      timestamp: new Date().toISOString()
    });
  }
  
  if (action === 'get_content') {
    var ss = SpreadsheetApp.openById(sheetId);
    var contentSheet = ss.getSheetByName('ContentTracker') || ss.getSheetByName('Content_Tracker') || ss.getSheets()[0];
    var rateSheet = ss.getSheetByName('RateCard');
    
    ensureHeaders_(contentSheet);
    
    var contentData = sheetToObjects_(contentSheet);
    var rateData = rateSheet ? sheetToObjects_(rateSheet) : [];
    
    return createJsonResponse_({
      success: true,
      timestamp: new Date().toISOString(),
      total: contentData.length,
      data: contentData,
      rateCards: rateData
    });
  }
  
  return createJsonResponse_({ error: 'Action not recognized: ' + action });
}

/**
 * POST Handler - Menerima perubahan kartu langsung dari Kanban Web Apps
 */
function doPost(e) {
  try {
    var raw = e.postData ? e.postData.contents : '';
    if (!raw) {
      return createJsonResponse_({ success: false, error: 'Empty POST body' });
    }
    
    var body = JSON.parse(raw);
    var action = body.action || 'upsert_card';
    var sheetId = body.sheet_id || SpreadsheetApp.getActiveSpreadsheet().getId();
    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheetByName('ContentTracker') || ss.getSheetByName('Content_Tracker') || ss.getSheets()[0];
    
    ensureHeaders_(sheet);
    
    // 1. UPDATE STATUS KARTU (Drag & Drop antar kolom Kanban)
    if (action === 'update_card_status') {
      return handleUpdateStatus_(sheet, body);
    }
    
    // 2. UPSERT KARTU (Buat baru / Edit detail kartu / Centang checklist)
    if (action === 'upsert_card') {
      return handleUpsertCard_(sheet, body.card || body);
    }
    
    // 3. DELETE KARTU
    if (action === 'delete_card') {
      return handleDeleteCard_(sheet, body.cardId || body.id);
    }
    
    // 4. BULK SYNC (Push massal seluruh kartu sekaligus)
    if (action === 'bulk_sync_cards') {
      return handleBulkSyncCards_(sheet, body.cards || []);
    }
    
    return createJsonResponse_({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return createJsonResponse_({ success: false, error: err.toString() });
  }
}

/**
 * Update Status Kartu Cepat (Drag & Drop)
 */
function handleUpdateStatus_(sheet, body) {
  var cardId = String(body.cardId || '').trim();
  var newStatus = body.newStatus;
  var rowIdx = findRowById_(sheet, cardId);
  var headerMap = getHeaderMap_(sheet);
  
  var nowIso = new Date().toISOString();
  
  if (rowIdx > -1) {
    if (headerMap['Status']) {
      sheet.getRange(rowIdx, headerMap['Status']).setValue(newStatus);
    }
    if (headerMap['UpdatedAt']) {
      sheet.getRange(rowIdx, headerMap['UpdatedAt']).setValue(nowIso);
    }
    if (newStatus === 'Approved / RtP') {
      if (headerMap['TanggalApprove'] && body.tanggalApprove) {
        sheet.getRange(rowIdx, headerMap['TanggalApprove']).setValue(body.tanggalApprove);
      }
      if (headerMap['FeeAmount'] && body.feeAmount) {
        sheet.getRange(rowIdx, headerMap['FeeAmount']).setValue(body.feeAmount);
      }
    }
    return createJsonResponse_({ success: true, action: 'status_updated', row: rowIdx, cardId: cardId });
  } else {
    // Jika kartu belum ada di spreadsheet, buatkan baris baru
    if (body.card) {
      return handleUpsertCard_(sheet, body.card);
    }
    return createJsonResponse_({ success: false, error: 'Card ID not found to update status' });
  }
}

/**
 * Upsert Kartu Tunggal (Tambah baru atau Timpa jika ID cocok)
 */
function handleUpsertCard_(sheet, card) {
  if (!card || !card.ID) {
    return createJsonResponse_({ success: false, error: 'Card or Card ID is missing' });
  }
  
  var rowIdx = findRowById_(sheet, String(card.ID).trim());
  var headerMap = getHeaderMap_(sheet);
  var lastCol = sheet.getLastColumn();
  
  if (rowIdx > -1) {
    // Update existing row
    COLUMN_HEADERS.forEach(function(header) {
      var colIdx = headerMap[header];
      if (colIdx && card[header] !== undefined) {
        sheet.getRange(rowIdx, colIdx).setValue(card[header]);
      }
    });
    if (headerMap['UpdatedAt']) {
      sheet.getRange(rowIdx, headerMap['UpdatedAt']).setValue(new Date().toISOString());
    }
    return createJsonResponse_({ success: true, action: 'card_updated', row: rowIdx });
  } else {
    // Append new row
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

/**
 * Hapus Kartu dari Spreadsheet
 */
function handleDeleteCard_(sheet, cardId) {
  var rowIdx = findRowById_(sheet, String(cardId).trim());
  if (rowIdx > -1) {
    sheet.deleteRow(rowIdx);
    return createJsonResponse_({ success: true, action: 'card_deleted', row: rowIdx });
  }
  return createJsonResponse_({ success: false, error: 'Card ID not found to delete' });
}

/**
 * Sinkronisasi Massal (Bulk Sync All Cards)
 */
function handleBulkSyncCards_(sheet, cards) {
  if (!cards || !cards.length) {
    return createJsonResponse_({ success: true, count: 0 });
  }
  
  // Re-write data cleanly
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

// --- Helper Functions ---

function findRowById_(sheet, cardId) {
  if (!cardId) return -1;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  
  var idCol = 1; // Default ID di kolom 1
  var headerMap = getHeaderMap_(sheet);
  if (headerMap['ID']) idCol = headerMap['ID'];
  
  var ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === cardId) {
      return i + 2; // 1-based index including header
    }
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
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
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
}
`;
  }
}

export const kanbanSyncService = new KanbanSyncService();
