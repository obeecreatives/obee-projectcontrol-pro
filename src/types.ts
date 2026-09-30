export type ViewTab =
  | 'board'
  | 'calendar'
  | 'dashboard'
  | 'activity'
  | 'staff_database'
  | 'ratecard'
  | 'headless_gas'
  | 'access_settings';

export type UserRole =
  | 'project_manager'
  | 'web_developer'
  | 'admin'
  | 'staff_creator'
  | 'site_engineer'
  | 'vendor_lapangan'
  | 'client';

export type StatusType =
  | 'New Idea'
  | 'On Progress'
  | 'Request Approval'
  | 'Approved / RtP'
  | 'Scheduling'
  | 'Published';

export type TipeProjectType = 'Komersil' | 'Internal';

export type JenisKontenType =
  | 'Single Post'
  | 'Carousel'
  | 'Cover Highlight'
  | 'Story'
  | 'Reels / TikTok';

export type KategoriKontenType = 'Desain' | 'Video';

export type WorkMode = 'WFO' | 'ON_SITE' | 'WFH' | 'MOBILE';

export interface LocationSnapshot {
  mode: WorkMode;
  label: string;
  placeTag?: string;
  timestamp: string;
  coords?: { lat: number; lng: number };
  distanceKm?: number;
}

export interface ContentItem {
  ID: string;
  Klien: string;
  TanggalProduksi: string;
  Bulan?: string;
  Tahun?: number | string;
  Tema: string;
  IdeKonten?: string;
  Detail?: string;
  JenisKonten: JenisKontenType | string;
  Kategori: KategoriKontenType | string;
  SourceReferences?: string;
  MateriKonten?: string;
  ProjectTools?: string;
  Creator: string;
  Status: StatusType;
  JadwalPosting?: string;
  File?: string;
  Catatan?: string;
  FeeAmount: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  ChecklistAsset?: boolean;
  ChecklistCaption?: boolean;
  TipeProject: TipeProjectType;
  TanggalApprove?: string;
}

export interface RateCardItem {
  JenisKonten: string;
  Kategori: KategoriKontenType;
  RatePerKonten: number;
}

export interface GeneralLink {
  ID: string;
  Label: string;
  URL: string;
  AddedBy?: string;
  CreatedAt?: string;
}

export interface ActivityLog {
  ID: string;
  Timestamp: string;
  UserEmail?: string;
  ActorName?: string;
  Action: 'Konten Dibuat' | 'Status Diubah' | 'Konten Dihapus' | string;
  ContentID?: string;
  ContentTema?: string;
  Klien?: string;
  StatusLama?: string;
  StatusBaru?: string;
  locationSnapshot?: LocationSnapshot;
}

export interface CrmClientItem {
  id: string;
  name: string; // PIC name
  company: string; // Brand / Company name
  phone?: string;
  email?: string;
  division?: string;
  notes?: string;
  createdAt?: string;
  status?: string;
  source?: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  divisi: string;
  jabatan: string;
  role: UserRole;
  phone?: string;
  statusKerja?: string;
  baseRate?: number;
  namaBank?: string;
  noRekening?: string;
  isAdmin: boolean;
  createdAt?: string;
  pin?: string;
  instagram?: string;
  alamat?: string;
  gradeSkill?: string;
  gajiPokok?: string | number;
  tunjJabatan?: string | number;
  catatan?: string;
}

export interface RoleConfig {
  id: UserRole;
  title: string;
  label: string;
  description: string;
  badgeColor: string;
  canChangeStatusToAll: boolean;
  canApproveToRtP: boolean;
  canEditRateCard: boolean;
  showInternalFee: boolean;
  canDelete: boolean;
  isFullAccess?: boolean;
}

export interface SecurityLogItem {
  id: string;
  timestamp: string;
  action: 'WHITELIST_ADD' | 'WHITELIST_REMOVE' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET' | 'DEFAULT_PASSWORD_UPDATE';
  actorEmail: string;
  targetEmail?: string;
  details: string;
}

export interface DefaultPasswordConfig {
  adminDefault: string;
  staffDefault: string;
  updatedAt?: string;
  updatedBy?: string;
}
