import React, { useState, useEffect, useMemo } from 'react';
import { ContentItem, UserRole, StatusType, TipeProjectType, JenisKontenType } from '../types';
import { ROLES, KATEGORI_INTERNAL_OPTIONS } from '../data/seedData';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { X, Save, Building2, User, Phone, CheckCircle2 } from 'lucide-react';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<ContentItem>) => void;
  editingItem: ContentItem | null;
  activeRole: UserRole;
  defaultCreator: string;
  isDarkMode?: boolean;
}

const JENIS_KONTEN_OPTIONS: JenisKontenType[] = [
  'Single Post',
  'Carousel',
  'Cover Highlight',
  'Story',
  'Reels / TikTok',
];

const ALL_STATUS_OPTIONS: StatusType[] = [
  'New Idea',
  'On Progress',
  'Request Approval',
  'Approved / RtP',
  'Scheduling',
  'Published',
];

export const ContentModal: React.FC<ContentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  activeRole,
  defaultCreator,
  isDarkMode = true,
}) => {
  const roleConfig = ROLES[activeRole] || ROLES.project_manager;
  const isFullOrAdmin =
    roleConfig.canChangeStatusToAll ||
    activeRole === 'admin' ||
    activeRole === 'project_manager' ||
    activeRole === 'web_developer' ||
    activeRole === 'site_engineer';
  const isStaff = activeRole === 'staff_creator' || activeRole === 'vendor_lapangan';

  const [tipeProject, setTipeProject] = useState<TipeProjectType>('Komersil');
  const [klien, setKlien] = useState('INOVASI PANGAN LESTARI');
  const [klienInternal, setKlienInternal] = useState(KATEGORI_INTERNAL_OPTIONS[0]);
  const [klienInternalLainnya, setKlienInternalLainnya] = useState('');
  const [tanggalProduksi, setTanggalProduksi] = useState('');
  const [jadwalPosting, setJadwalPosting] = useState('');
  const [tema, setTema] = useState('');
  const [ideKonten, setIdeKonten] = useState('');
  const [detail, setDetail] = useState('');
  const [jenisKonten, setJenisKonten] = useState<JenisKontenType>('Single Post');
  const [creator, setCreator] = useState(defaultCreator);
  const [projectTools, setProjectTools] = useState('Canva');
  const [status, setStatus] = useState<StatusType>('New Idea');
  const [sourceReferences, setSourceReferences] = useState('');
  const [materiKonten, setMateriKonten] = useState('');
  const [file, setFile] = useState('');
  const [catatan, setCatatan] = useState('');
  const [checklistAsset, setChecklistAsset] = useState(false);
  const [checklistCaption, setChecklistCaption] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const crmClients = useMemo(() => storageService.getCrmClients(), []);
  const staffDirectory = useMemo(() => authService.getDirectory(), []);

  const selectedCrmClient = useMemo(() => {
    return crmClients.find((c) => c.company === klien);
  }, [crmClients, klien]);

  useEffect(() => {
    if (editingItem) {
      setTipeProject(editingItem.TipeProject || 'Komersil');
      if (editingItem.TipeProject === 'Internal') {
        if (KATEGORI_INTERNAL_OPTIONS.includes(editingItem.Klien)) {
          setKlienInternal(editingItem.Klien);
          setKlienInternalLainnya('');
        } else {
          setKlienInternal('Lainnya');
          setKlienInternalLainnya(editingItem.Klien);
        }
      } else {
        setKlien(editingItem.Klien || 'INOVASI PANGAN LESTARI');
      }
      setTanggalProduksi(editingItem.TanggalProduksi || '');
      setJadwalPosting(editingItem.JadwalPosting || '');
      setTema(editingItem.Tema || '');
      setIdeKonten(editingItem.IdeKonten || '');
      setDetail(editingItem.Detail || '');
      setJenisKonten((editingItem.JenisKonten as JenisKontenType) || 'Single Post');
      setCreator(editingItem.Creator || defaultCreator);
      setProjectTools(editingItem.ProjectTools || 'Canva');
      setStatus(editingItem.Status || 'New Idea');
      setSourceReferences(editingItem.SourceReferences || '');
      setMateriKonten(editingItem.MateriKonten || '');
      setFile(editingItem.File || '');
      setCatatan(editingItem.Catatan || '');
      setChecklistAsset(!!editingItem.ChecklistAsset);
      setChecklistCaption(!!editingItem.ChecklistCaption);
    } else {
      setTipeProject('Komersil');
      setKlien('INOVASI PANGAN LESTARI');
      setKlienInternal(KATEGORI_INTERNAL_OPTIONS[0]);
      setKlienInternalLainnya('');
      const todayIso = new Date().toISOString().slice(0, 10);
      setTanggalProduksi(todayIso);
      setJadwalPosting('');
      setTema('');
      setIdeKonten('');
      setDetail('');
      setJenisKonten('Single Post');
      setCreator(defaultCreator);
      setProjectTools('Canva');
      setStatus('New Idea');
      setSourceReferences('');
      setMateriKonten('');
      setFile('');
      setCatatan('');
      setChecklistAsset(false);
      setChecklistCaption(false);
    }
    setIsSubmitting(false);
  }, [editingItem, isOpen, defaultCreator]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    let finalKlien = klien;
    if (tipeProject === 'Internal') {
      finalKlien = klienInternal === 'Lainnya' ? klienInternalLainnya.trim() || 'Internal Lainnya' : klienInternal;
    }

    if (!finalKlien) {
      alert('Nama Klien atau Kategori Internal wajib diisi!');
      return;
    }

    setIsSubmitting(true);

    const payload: Partial<ContentItem> = {
      ...(editingItem ? { ID: editingItem.ID } : {}),
      TipeProject: tipeProject,
      Klien: finalKlien,
      TanggalProduksi: tanggalProduksi,
      JadwalPosting: jadwalPosting,
      Tema: tema,
      IdeKonten: ideKonten,
      Detail: detail,
      JenisKonten: jenisKonten,
      Kategori: jenisKonten === 'Reels / TikTok' ? 'Video' : 'Desain',
      Creator: creator,
      ProjectTools: projectTools,
      Status: status,
      SourceReferences: sourceReferences,
      MateriKonten: materiKonten,
      File: file,
      Catatan: catatan,
      ChecklistAsset: checklistAsset,
      ChecklistCaption: checklistCaption,
    };

    onSave(payload);
    onClose();
  };

  const getAllowedStatuses = (): StatusType[] => {
    if (isFullOrAdmin) return ALL_STATUS_OPTIONS;
    if (isStaff) {
      if (!editingItem || ['New Idea', 'On Progress', 'Request Approval'].includes(editingItem.Status)) {
        return ['New Idea', 'On Progress', 'Request Approval'];
      }
      if (editingItem.Status === 'Approved / RtP') {
        return ['Approved / RtP', 'Scheduling', 'Published'];
      }
      if (editingItem.Status === 'Scheduling' || editingItem.Status === 'Published') {
        return ['Scheduling', 'Published'];
      }
    }
    return ['New Idea', 'On Progress', 'Request Approval'];
  };

  const allowedStatuses = getAllowedStatuses();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-[#1e293b]/70' : 'border-slate-200 bg-slate-50'}`}>
          <div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {editingItem ? 'Edit Konten' : 'Tambah Konten Baru'}
            </h3>
            <p className="text-xs text-slate-400">
              {tipeProject === 'Internal' ? 'Kebutuhan Internal Studio (Fee Rp0)' : 'Klien Komersil (Sumber: Spreadsheet CRM)'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4 text-sm">
          {/* Tipe Project */}
          <div>
            <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
              Tipe Project & Sumber Klien
            </label>
            <select
              value={tipeProject}
              onChange={(e) => setTipeProject(e.target.value as TipeProjectType)}
              className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 font-medium`}
            >
              <option value="Komersil">Komersil (Sumber: Spreadsheet CRM - Fee dihitung saat Approved / RtP)</option>
              <option value="Internal">Internal obeecreatives (Kebutuhan Studio, Fee Rp0)</option>
            </select>
          </div>

          {/* Klien / Brand Name */}
          {tipeProject === 'Komersil' ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase text-slate-400">
                  Klien Komersil (Sumber: Spreadsheet CRM)
                </label>
                <span className="text-[10px] text-red-500 font-semibold">Integrasi Web App CRM</span>
              </div>
              <select
                value={klien}
                onChange={(e) => setKlien(e.target.value)}
                className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 font-medium`}
              >
                {crmClients.map((c) => (
                  <option key={c.id || c.company} value={c.company}>
                    {c.company} {c.name ? `(PIC: ${c.name})` : ''}
                  </option>
                ))}
              </select>

              {/* Selected CRM Client Info Card */}
              {selectedCrmClient && (
                <div className={`mt-2 p-3 rounded-xl border text-xs flex flex-wrap items-center gap-3 ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                    <Building2 className="w-3.5 h-3.5 text-red-500" />
                    <span>{selectedCrmClient.company}</span>
                  </div>
                  {selectedCrmClient.name && (
                    <div className="flex items-center gap-1 text-slate-400">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      <span>PIC: {selectedCrmClient.name}</span>
                    </div>
                  )}
                  {selectedCrmClient.phone && (
                    <div className="flex items-center gap-1 text-slate-400 font-mono">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{selectedCrmClient.phone}</span>
                    </div>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold ml-auto">
                    CRM Synced
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                  Kategori Internal obeecreatives
                </label>
                <select
                  value={klienInternal}
                  onChange={(e) => setKlienInternal(e.target.value)}
                  className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500`}
                >
                  {KATEGORI_INTERNAL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {klienInternal === 'Lainnya' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Sebutkan Nama Kategori Internal Lainnya
                  </label>
                  <input
                    type="text"
                    value={klienInternalLainnya}
                    onChange={(e) => setKlienInternalLainnya(e.target.value)}
                    placeholder="misal: obeeWorkshop, Company Profile..."
                    className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500`}
                  />
                </div>
              )}
            </div>
          )}

          {/* Tanggal Produksi & Jadwal Posting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                Tanggal Produksi
              </label>
              <input
                type="date"
                value={tanggalProduksi}
                onChange={(e) => setTanggalProduksi(e.target.value)}
                className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                Jadwal Posting
              </label>
              <input
                type="date"
                value={jadwalPosting}
                onChange={(e) => setJadwalPosting(e.target.value)}
                className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500`}
              />
            </div>
          </div>

          {/* Tema & Ide Konten */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                Pillar / Tema Konten
              </label>
              <input
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="misal: Edukasi, Soft Selling, Testimoni"
                className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                Ide Konten
              </label>
              <input
                type="text"
                value={ideKonten}
                onChange={(e) => setIdeKonten(e.target.value)}
                placeholder="misal: 3 Kesalahan Saat Maklon..."
                className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500`}
              />
            </div>
          </div>

          {/* Detail Deskripsi */}
          <div>
            <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
              Detail Deskripsi / Storyline
            </label>
            <textarea
              rows={2}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Catatan alur, poin penting, slide breakdown..."
              className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500`}
            />
          </div>

          {/* Jenis Konten, Creator, Tools, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                Jenis Konten
              </label>
              <select
                value={jenisKonten}
                onChange={(e) => setJenisKonten(e.target.value as JenisKontenType)}
                className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-2.5 py-2 focus:outline-none focus:border-red-500 text-xs`}
              >
                {JENIS_KONTEN_OPTIONS.map((jk) => (
                  <option key={jk} value={jk}>
                    {jk}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                Creator
              </label>
              <select
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-2.5 py-2 focus:outline-none focus:border-red-500 text-xs`}
              >
                {staffDirectory.map((st) => (
                  <option key={st.id || st.email} value={st.name}>
                    {st.name} {st.divisi ? `(${st.divisi})` : ''} {st.statusKerja?.includes('Nonaktif') ? '· [Nonaktif]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                Tools
              </label>
              <input
                type="text"
                value={projectTools}
                onChange={(e) => setProjectTools(e.target.value)}
                placeholder="Canva, CapCut"
                className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-2.5 py-2 focus:outline-none focus:border-red-500 text-xs`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                Status Alur
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusType)}
                className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-2.5 py-2 focus:outline-none focus:border-red-500 text-xs font-semibold`}
              >
                {allowedStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st === 'Approved / RtP' && isFullOrAdmin ? `⭐ ${st} (Kunci Fee)` : st}
                  </option>
                ))}
                {isStaff && ['New Idea', 'On Progress', 'Request Approval'].includes(status) && (
                  <option value="Approved / RtP" disabled>
                    🔒 Approved / RtP (Perlu Hak Admin)
                  </option>
                )}
                {!allowedStatuses.includes(status) && (
                  <option value={status} disabled>
                    {status} (Terkunci)
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Links: Materi & Drive File */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                Link Materi Konten (Trello, Doc)
              </label>
              <input
                type="url"
                value={materiKonten}
                onChange={(e) => setMateriKonten(e.target.value)}
                placeholder="https://..."
                className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 text-xs`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                Link File Hasil (Google Drive / Canva)
              </label>
              <input
                type="url"
                value={file}
                onChange={(e) => setFile(e.target.value)}
                placeholder="https://drive.google.com/..."
                className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 text-xs`}
              />
            </div>
          </div>

          {/* Source References & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                Source References
              </label>
              <input
                type="text"
                value={sourceReferences}
                onChange={(e) => setSourceReferences(e.target.value)}
                placeholder="Link referensi atau inspirasi"
                className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 text-xs`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                Catatan Khusus / Revisi
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="misal: font ganti, revisi warna..."
                className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 text-xs`}
              />
            </div>
          </div>

          {/* Checklist Asset & Caption */}
          <div className={`flex items-center gap-6 p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-xs font-bold uppercase text-slate-400">Checklist Kelengkapan:</span>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={checklistAsset}
                onChange={(e) => setChecklistAsset(e.target.checked)}
                className="w-4 h-4 rounded border-slate-400 text-red-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-medium">Asset Lengkap</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={checklistCaption}
                onChange={(e) => setChecklistCaption(e.target.checked)}
                className="w-4 h-4 rounded border-slate-400 text-red-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-medium">Caption Siap</span>
            </label>
          </div>

          {/* Modal Footer Actions */}
          <div className={`flex items-center justify-end gap-3 pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} mt-2`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 ${isDarkMode ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700' : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'} rounded-xl font-medium transition-colors cursor-pointer`}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 bg-[#E30000] hover:bg-[#c00000] text-white px-5 py-2 rounded-xl font-bold transition-transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Konten'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
