import { ContentItem, RateCardItem, GeneralLink, ActivityLog, StatusType, UserRole, CrmClientItem, CardComment, KpiTargets } from '../types';
import { INITIAL_CONTENT_ITEMS, INITIAL_RATE_CARDS, INITIAL_LINKS, FULL_ACCESS_EMAILS, INITIAL_CRM_DATA, KATEGORI_INTERNAL_OPTIONS } from '../data/seedData';
import { geoService } from './geoService';

const KEY_CONTENT = 'obee_pcs_content_v1';
const KEY_RATE_CARDS = 'obee_pcs_rate_card_v1';
const KEY_LINKS = 'obee_pcs_links_v1';
const KEY_ACTIVITY = 'obee_pcs_activity_v1';
const KEY_ROLE = 'pcs_role';
const KEY_IDENTITY = 'pcs_identity_nama';
const KEY_GAS_URL = 'obee_pcs_gas_url_v1';
const KEY_CRM_CLIENTS = 'obee_pcs_crm_clients_v1';
const KEY_KPI_TARGETS = 'obee_pcs_kpi_targets_v1';

export const DEFAULT_KPI_TARGETS: KpiTargets = {
  monthlyContentTarget: 30,
  monthlyRevenueTarget: 15000000,
  targetSlaDays: 3,
  onTimeGoalPercent: 85,
};

export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbz_obeecreatives_project_control_v2/exec';

class StorageService {
  getContent(): ContentItem[] {
    try {
      const raw = localStorage.getItem(KEY_CONTENT);
      if (!raw) {
        this.saveContent(INITIAL_CONTENT_ITEMS);
        return INITIAL_CONTENT_ITEMS;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        this.saveContent(INITIAL_CONTENT_ITEMS);
        return INITIAL_CONTENT_ITEMS;
      }

      // Check if comments exist; if all cards have 0 comments, migrate sample comments
      let hasMigrated = false;
      const totalComments = parsed.reduce(
        (acc, curr) => acc + (Array.isArray(curr.comments) ? curr.comments.length : 0),
        0
      );

      if (totalComments === 0 && parsed.length > 0) {
        if (INITIAL_CONTENT_ITEMS[0]?.comments) {
          parsed[0].comments = INITIAL_CONTENT_ITEMS[0].comments;
          hasMigrated = true;
        }
        if (parsed[1] && INITIAL_CONTENT_ITEMS[1]?.comments) {
          parsed[1].comments = INITIAL_CONTENT_ITEMS[1].comments;
          hasMigrated = true;
        }
      }

      parsed.forEach((it) => {
        if (!it.comments) {
          it.comments = [];
          hasMigrated = true;
        }
      });

      if (hasMigrated) {
        this.saveContent(parsed);
      }

      return parsed;
    } catch {
      return INITIAL_CONTENT_ITEMS;
    }
  }

  saveContent(items: ContentItem[]) {
    try {
      localStorage.setItem(KEY_CONTENT, JSON.stringify(items));
    } catch (e) {
      console.error('StorageService: failed to write content to localStorage', e);
    }
  }

  saveContentItem(itemData: Partial<ContentItem>): { success: boolean; id: string } {
    const list = this.getContent();
    const nowIso = new Date().toISOString();
    let targetId = itemData.ID;
    const isNew = !targetId;

    if (!targetId) {
      targetId = 'cnt-' + Math.random().toString(36).substring(2, 9);
    }

    const rateCards = this.getRateCards();
    const matchingRate = rateCards.find((r) => r.JenisKonten === itemData.JenisKonten);
    const calculatedFee =
      itemData.TipeProject === 'Internal'
        ? 0
        : itemData.Status === 'Approved / RtP' || itemData.Status === 'Scheduling' || itemData.Status === 'Published'
        ? (matchingRate ? matchingRate.RatePerKonten : 10000)
        : 0;

    let previousStatus: StatusType | undefined;

    const existingIndex = list.findIndex((it) => it.ID === targetId);
    if (existingIndex > -1) {
      previousStatus = list[existingIndex].Status;
      const updatedItem: ContentItem = {
        ...list[existingIndex],
        ...itemData,
        ID: targetId,
        UpdatedAt: nowIso,
        FeeAmount:
          itemData.TipeProject === 'Internal'
            ? 0
            : list[existingIndex].FeeAmount > 0
            ? list[existingIndex].FeeAmount
            : calculatedFee,
        TanggalApprove:
          list[existingIndex].TanggalApprove ||
          (itemData.Status === 'Approved / RtP' ? nowIso.slice(0, 10) : undefined),
      } as ContentItem;
      list[existingIndex] = updatedItem;
    } else {
      const newItem: ContentItem = {
        ID: targetId,
        Klien: itemData.Klien || 'INOVASI PANGAN LESTARI',
        TanggalProduksi: itemData.TanggalProduksi || nowIso.slice(0, 10),
        Tema: itemData.Tema || itemData.IdeKonten || 'Ide Baru',
        IdeKonten: itemData.IdeKonten || '',
        Detail: itemData.Detail || '',
        JenisKonten: itemData.JenisKonten || 'Single Post',
        Kategori: itemData.JenisKonten === 'Reels / TikTok' ? 'Video' : 'Desain',
        SourceReferences: itemData.SourceReferences || '',
        MateriKonten: itemData.MateriKonten || '',
        ProjectTools: itemData.ProjectTools || 'Canva',
        Creator: itemData.Creator || this.getIdentity(),
        Status: itemData.Status || 'New Idea',
        JadwalPosting: itemData.JadwalPosting || '',
        File: itemData.File || '',
        Catatan: itemData.Catatan || '',
        FeeAmount: calculatedFee,
        CreatedAt: nowIso,
        UpdatedAt: nowIso,
        ChecklistAsset: !!itemData.ChecklistAsset,
        ChecklistCaption: !!itemData.ChecklistCaption,
        TipeProject: itemData.TipeProject || 'Komersil',
        TanggalApprove: itemData.Status === 'Approved / RtP' ? nowIso.slice(0, 10) : undefined,
        comments: itemData.comments || [],
      };
      list.unshift(newItem);
    }

    this.saveContent(list);

    // Activity Log
    this.addActivityLog({
      ID: 'act-' + Math.random().toString(36).substring(2, 9),
      Timestamp: nowIso,
      ActorName: this.getIdentity(),
      Action: isNew ? 'Konten Dibuat' : 'Status Diubah',
      ContentID: targetId,
      ContentTema: itemData.Tema || itemData.IdeKonten || 'Konten',
      Klien: itemData.Klien,
      StatusLama: previousStatus,
      StatusBaru: itemData.Status,
      locationSnapshot: geoService.createLocationSnapshot(),
    });

    return { success: true, id: targetId };
  }

  updateContentStatus(
    id: string,
    newStatus: StatusType,
    actorRole?: UserRole,
    actorEmail?: string
  ): { success: boolean; error?: string } {
    const list = this.getContent();
    const item = list.find((it) => it.ID === id);
    if (!item) return { success: false, error: 'Konten tidak ditemukan' };

    const role = actorRole || this.getRole();
    const email = (actorEmail || '').toLowerCase().trim();
    const isFullAccess =
      role === 'project_manager' ||
      role === 'site_engineer' ||
      role === 'web_developer' ||
      FULL_ACCESS_EMAILS.includes(email);

    // Rule enforcement based on User specifications:
    // a. Staff/creator/freelancer:
    //    - Berhak memindahkan kartu pada fase draft awal: New Idea - On Progress - mentok di Request Approval.
    //    - HANYA TIDAK BERHAK MEMINDAH KARTU KE POSISI Approved / RtP karena nilai fee ditentukan dari Approved / RtP.
    //    - Namun kembali diberi hak untuk menggeser kartu yang SUDAH BERADA pada tahap Approved / RtP (misal ke Scheduling / Published).
    // b. Admin: berhak memindahkan kartu ke Approved / RtP, Scheduling, atau Published.
    // c. Project Manager / Site Engineer: Full Akses.
    // d. Web Developer: Full Akses.

    if (!isFullAccess) {
      if (role === 'client') {
        return {
          success: false,
          error: 'Akses Client Portal bersifat read-only dan tidak dapat mengubah alur status konten.',
        };
      }

      if (role === 'staff_creator' || role === 'vendor_lapangan') {
        // Staff CANNOT move into Approved / RtP under any circumstance
        if (newStatus === 'Approved / RtP') {
          return {
            success: false,
            error:
              'Staff / Creator / Freelancer tidak berhak memindahkan kartu ke posisi "Approved / RtP" karena nilai fee ditentukan dari tahap ini. Harap minta Admin, Project Manager, atau Web Developer untuk menyetujui.',
          };
        }

        const isCurrentlyInDraft =
          item.Status === 'New Idea' || item.Status === 'On Progress' || item.Status === 'Request Approval';

        // In draft phase, staff can only move between New Idea, On Progress, Request Approval
        if (isCurrentlyInDraft) {
          const draftAllowed: StatusType[] = ['New Idea', 'On Progress', 'Request Approval'];
          if (!draftAllowed.includes(newStatus)) {
            return {
              success: false,
              error:
                'Pada fase draft awal, kartu hanya dapat dipindahkan antara New Idea, On Progress, dan Request Approval. Kartu harus disetujui (Approved / RtP) oleh Admin sebelum dapat dijadwalkan.',
            };
          }
        }
        // If already in Approved / RtP, Scheduling, or Published:
        // Staff is given right back to shift to Scheduling or Published!
      }
    }

    const oldStatus = item.Status;
    item.Status = newStatus;
    item.UpdatedAt = new Date().toISOString();

    if (newStatus === 'Approved / RtP') {
      if (!item.TanggalApprove) {
        item.TanggalApprove = new Date().toISOString().slice(0, 10);
      }
      if (item.TipeProject !== 'Internal' && item.FeeAmount === 0) {
        const rateCards = this.getRateCards();
        const r = rateCards.find((rc) => rc.JenisKonten === item.JenisKonten);
        item.FeeAmount = r ? r.RatePerKonten : 10000;
      }
    }

    this.saveContent(list);

    this.addActivityLog({
      ID: 'act-' + Math.random().toString(36).substring(2, 9),
      Timestamp: new Date().toISOString(),
      ActorName: this.getIdentity(),
      Action: 'Status Diubah',
      ContentID: id,
      ContentTema: item.Tema || item.IdeKonten,
      Klien: item.Klien,
      StatusLama: oldStatus,
      StatusBaru: newStatus,
      locationSnapshot: geoService.createLocationSnapshot(),
    });

    return { success: true };
  }

  updateChecklist(id: string, field: 'ChecklistAsset' | 'ChecklistCaption', value: boolean) {
    const list = this.getContent();
    const item = list.find((it) => it.ID === id);
    if (item) {
      item[field] = value;
      item.UpdatedAt = new Date().toISOString();
      this.saveContent(list);
    }
  }

  deleteContentItem(id: string): { success: boolean; error?: string } {
    const list = this.getContent();
    const item = list.find((it) => it.ID === id);
    if (!item) return { success: false, error: 'Konten tidak ditemukan' };

    const filtered = list.filter((it) => it.ID !== id);
    this.saveContent(filtered);

    this.addActivityLog({
      ID: 'act-' + Math.random().toString(36).substring(2, 9),
      Timestamp: new Date().toISOString(),
      ActorName: this.getIdentity(),
      Action: 'Konten Dihapus',
      ContentID: id,
      ContentTema: item.Tema || item.IdeKonten,
      Klien: item.Klien,
      locationSnapshot: geoService.createLocationSnapshot(),
    });

    return { success: true };
  }

  addComment(
    itemId: string,
    commentData: Omit<CardComment, 'id' | 'createdAt'>
  ): { success: boolean; comment?: CardComment; error?: string } {
    const list = this.getContent();
    const item = list.find((it) => it.ID === itemId);
    if (!item) return { success: false, error: 'Konten tidak ditemukan' };

    const newComment: CardComment = {
      ...commentData,
      id: 'cmt-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };

    if (!item.comments) {
      item.comments = [];
    }
    item.comments.push(newComment);
    item.UpdatedAt = new Date().toISOString();

    this.saveContent(list);

    // Activity Log
    this.addActivityLog({
      ID: 'act-' + Math.random().toString(36).substring(2, 9),
      Timestamp: new Date().toISOString(),
      ActorName: commentData.authorName,
      Action: 'Komentar Ditambahkan',
      ContentID: itemId,
      ContentTema: item.Tema || item.IdeKonten,
      Klien: item.Klien,
      StatusBaru: commentData.category ? `[${commentData.category}]` : undefined,
      locationSnapshot: geoService.createLocationSnapshot(),
    });

    return { success: true, comment: newComment };
  }

  deleteComment(itemId: string, commentId: string): boolean {
    const list = this.getContent();
    const item = list.find((it) => it.ID === itemId);
    if (!item || !item.comments) return false;

    const prevLen = item.comments.length;
    item.comments = item.comments.filter((c) => c.id !== commentId);
    if (item.comments.length !== prevLen) {
      item.UpdatedAt = new Date().toISOString();
      this.saveContent(list);
      return true;
    }
    return false;
  }

  getRateCards(): RateCardItem[] {
    try {
      const raw = localStorage.getItem(KEY_RATE_CARDS);
      return raw ? JSON.parse(raw) : INITIAL_RATE_CARDS;
    } catch {
      return INITIAL_RATE_CARDS;
    }
  }

  saveRateCard(item: RateCardItem) {
    const rates = this.getRateCards();
    const idx = rates.findIndex((r) => r.JenisKonten === item.JenisKonten);
    if (idx > -1) {
      rates[idx] = item;
    } else {
      rates.push(item);
    }
    localStorage.setItem(KEY_RATE_CARDS, JSON.stringify(rates));
  }

  getGeneralLinks(): GeneralLink[] {
    try {
      const raw = localStorage.getItem(KEY_LINKS);
      return raw ? JSON.parse(raw) : INITIAL_LINKS;
    } catch {
      return INITIAL_LINKS;
    }
  }

  saveGeneralLink(linkData: Partial<GeneralLink>) {
    const links = this.getGeneralLinks();
    if (linkData.ID) {
      const idx = links.findIndex((l) => l.ID === linkData.ID);
      if (idx > -1) {
        links[idx] = { ...links[idx], ...linkData } as GeneralLink;
      }
    } else {
      links.unshift({
        ID: 'lnk-' + Math.random().toString(36).substring(2, 9),
        Label: linkData.Label || 'Link Dokumen',
        URL: linkData.URL || 'https://',
        AddedBy: this.getIdentity(),
        CreatedAt: new Date().toISOString().slice(0, 10),
      });
    }
    localStorage.setItem(KEY_LINKS, JSON.stringify(links));
  }

  deleteGeneralLink(id: string) {
    const links = this.getGeneralLinks().filter((l) => l.ID !== id);
    localStorage.setItem(KEY_LINKS, JSON.stringify(links));
  }

  getActivityLogs(): ActivityLog[] {
    try {
      const raw = localStorage.getItem(KEY_ACTIVITY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  addActivityLog(log: ActivityLog) {
    const logs = this.getActivityLogs();
    logs.unshift(log);
    const trimmed = logs.slice(0, 100);
    localStorage.setItem(KEY_ACTIVITY, JSON.stringify(trimmed));
  }

  getRole(): UserRole {
    return (localStorage.getItem(KEY_ROLE) as UserRole) || 'project_manager';
  }

  setRole(role: UserRole) {
    localStorage.setItem(KEY_ROLE, role);
  }

  getIdentity(): string {
    return localStorage.getItem(KEY_IDENTITY) || 'Lalu Mahendra Ali Akbar';
  }

  setIdentity(name: string) {
    localStorage.setItem(KEY_IDENTITY, name);
  }

  getGasUrl(): string {
    return localStorage.getItem(KEY_GAS_URL) || DEFAULT_GAS_URL;
  }

  setGasUrl(url: string) {
    localStorage.setItem(KEY_GAS_URL, url);
  }

  resetToDefaultSeed() {
    this.saveContent(INITIAL_CONTENT_ITEMS);
    localStorage.setItem(KEY_RATE_CARDS, JSON.stringify(INITIAL_RATE_CARDS));
    localStorage.setItem(KEY_LINKS, JSON.stringify(INITIAL_LINKS));
  }

  exportContentCsv(): string {
    const items = this.getContent();
    const headers = [
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
      'TanggalApprove',
    ];

    const rows = items.map((it) =>
      headers
        .map((h) => {
          const val = (it as any)[h] ?? '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  // CRM Clients Management & Live Sync
  getCrmClients(): CrmClientItem[] {
    try {
      const raw = localStorage.getItem(KEY_CRM_CLIENTS);
      if (!raw) {
        this.saveCrmClients(INITIAL_CRM_DATA);
        return INITIAL_CRM_DATA;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CRM_DATA;
    } catch {
      return INITIAL_CRM_DATA;
    }
  }

  saveCrmClients(clients: CrmClientItem[]) {
    try {
      localStorage.setItem(KEY_CRM_CLIENTS, JSON.stringify(clients));
    } catch (e) {
      console.error('StorageService: failed to save CRM clients', e);
    }
  }

  mergeCrmClients(remoteClients: CrmClientItem[]): { added: number; updated: number; list: CrmClientItem[] } {
    const local = this.getCrmClients();
    let added = 0;
    let updated = 0;

    remoteClients.forEach((rc) => {
      const cleanCompany = (rc.company || '').trim().toUpperCase();
      if (!cleanCompany) return;

      const idx = local.findIndex(
        (lc) =>
          (lc.id && rc.id && lc.id.toLowerCase() === rc.id.toLowerCase()) ||
          lc.company.trim().toUpperCase() === cleanCompany
      );

      if (idx > -1) {
        local[idx] = { ...local[idx], ...rc, company: rc.company.trim() };
        updated++;
      } else {
        local.push({
          ...rc,
          id: rc.id || 'crm-' + Math.random().toString(36).substring(2, 9),
          company: rc.company.trim(),
          source: rc.source || 'Spreadsheet CRM',
          createdAt: rc.createdAt || new Date().toISOString().split('T')[0],
        });
        added++;
      }
    });

    this.saveCrmClients(local);
    return { added, updated, list: local };
  }

  addCrmClient(client: CrmClientItem): { success: boolean; client: CrmClientItem } {
    const list = this.getCrmClients();
    const cleanCompany = client.company.trim();
    const existing = list.find((c) => c.company.trim().toUpperCase() === cleanCompany.toUpperCase());
    if (existing) {
      return { success: false, client: existing };
    }
    const newClient: CrmClientItem = {
      ...client,
      id: client.id || 'crm-' + Math.random().toString(36).substring(2, 9),
      company: cleanCompany,
      source: client.source || 'Spreadsheet CRM',
      createdAt: client.createdAt || new Date().toISOString().split('T')[0],
    };
    list.unshift(newClient);
    this.saveCrmClients(list);
    return { success: true, client: newClient };
  }

  getAllClientNames(): string[] {
    const crm = this.getCrmClients().map((c) => c.company.trim()).filter(Boolean);
    const content = this.getContent().map((c) => c.Klien.trim()).filter(Boolean);
    const internal = KATEGORI_INTERNAL_OPTIONS.map((k) => k.trim());
    return Array.from(new Set([...crm, ...content, ...internal])).sort();
  }

  exportDataJson(): string {
    return JSON.stringify(
      {
        content: this.getContent(),
        rateCards: this.getRateCards(),
        links: this.getGeneralLinks(),
        activityLogs: this.getActivityLogs(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  getKpiTargets(): KpiTargets {
    try {
      const raw = localStorage.getItem(KEY_KPI_TARGETS);
      if (!raw) return DEFAULT_KPI_TARGETS;
      const parsed = JSON.parse(raw);
      return {
        monthlyContentTarget: Number(parsed.monthlyContentTarget) || DEFAULT_KPI_TARGETS.monthlyContentTarget,
        monthlyRevenueTarget: Number(parsed.monthlyRevenueTarget) || DEFAULT_KPI_TARGETS.monthlyRevenueTarget,
        targetSlaDays: Number(parsed.targetSlaDays) || DEFAULT_KPI_TARGETS.targetSlaDays,
        onTimeGoalPercent: Number(parsed.onTimeGoalPercent) || DEFAULT_KPI_TARGETS.onTimeGoalPercent,
      };
    } catch {
      return DEFAULT_KPI_TARGETS;
    }
  }

  saveKpiTargets(targets: KpiTargets): void {
    try {
      localStorage.setItem(KEY_KPI_TARGETS, JSON.stringify(targets));
    } catch (e) {
      console.error('Failed to save KPI targets:', e);
    }
  }
}

export const storageService = new StorageService();
