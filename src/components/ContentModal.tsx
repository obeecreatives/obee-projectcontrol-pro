import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ContentItem,
  UserRole,
  StatusType,
  TipeProjectType,
  JenisKontenType,
  CardComment,
  CommentCategory,
  StaffUser,
} from '../types';
import { ROLES, KATEGORI_INTERNAL_OPTIONS } from '../data/seedData';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import {
  X,
  Save,
  Building2,
  User,
  Phone,
  CheckCircle2,
  MessageSquare,
  Send,
  AtSign,
  Trash2,
  Clock,
  FileText,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { AiAssistantModal, AiMode } from './AiAssistantModal';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<ContentItem>) => void;
  editingItem: ContentItem | null;
  activeRole: UserRole;
  defaultCreator: string;
  isDarkMode?: boolean;
  currentUser?: StaffUser | null;
  onCommentsUpdated?: (itemId: string, comments: CardComment[]) => void;
  initialTab?: 'detail' | 'comments';
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

const COMMENT_CATEGORIES: CommentCategory[] = [
  'Catatan Internal',
  'Revisi Klien',
  'Feedback Aset',
  'Urgent',
  'General',
];

function formatRelativeTime(isoString: string): string {
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

export const ContentModal: React.FC<ContentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  activeRole,
  defaultCreator,
  isDarkMode = true,
  currentUser,
  onCommentsUpdated,
  initialTab = 'detail',
}) => {
  const roleConfig = ROLES[activeRole] || ROLES.project_manager;
  const isFullOrAdmin =
    roleConfig.canChangeStatusToAll ||
    activeRole === 'admin' ||
    activeRole === 'project_manager' ||
    activeRole === 'web_developer' ||
    activeRole === 'site_engineer';
  const isStaff = activeRole === 'staff_creator' || activeRole === 'vendor_lapangan';

  const [activeModalTab, setActiveModalTab] = useState<'detail' | 'comments'>('detail');
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

  // Card Comments State (Trello-style discussion)
  const [commentsList, setCommentsList] = useState<CardComment[]>(editingItem?.comments || []);
  const [commentText, setCommentText] = useState('');
  const [commentCategory, setCommentCategory] = useState<CommentCategory>('Catatan Internal');
  const [activeFilterCategory, setActiveFilterCategory] = useState<'ALL' | CommentCategory>('ALL');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionCursorPos, setMentionCursorPos] = useState<number>(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // AI Assistant Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalMode, setAiModalMode] = useState<AiMode>('caption');

  const crmClients = useMemo(() => storageService.getCrmClients(), []);
  const staffDirectory = useMemo(() => authService.getDirectory(), []);

  const selectedCrmClient = useMemo(() => {
    return crmClients.find((c) => c.company === klien);
  }, [crmClients, klien]);

  const matchingStaff = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return staffDirectory
      .filter((s) => s.name.toLowerCase().includes(q) || s.jabatan.toLowerCase().includes(q))
      .slice(0, 5);
  }, [mentionQuery, staffDirectory]);

  const filteredComments = useMemo(() => {
    if (activeFilterCategory === 'ALL') return commentsList;
    return commentsList.filter((c) => c.category === activeFilterCategory);
  }, [commentsList, activeFilterCategory]);

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
      setCommentsList(editingItem.comments || []);
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
      setCommentsList([]);
    }
    setActiveModalTab(editingItem && initialTab ? initialTab : 'detail');
    setIsSubmitting(false);
    setCommentText('');
    setMentionQuery(null);
  }, [editingItem, isOpen, defaultCreator, initialTab]);

  useEffect(() => {
    if (activeModalTab === 'comments') {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeModalTab]);

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
      comments: commentsList,
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

  // Quick mention insert helper
  const handleInsertQuickMention = (staff: StaffUser) => {
    const mentionTag = `@${staff.name} `;
    setCommentText((prev) => {
      if (prev.endsWith(' ') || prev.length === 0) {
        return prev + mentionTag;
      }
      return prev + ' ' + mentionTag;
    });
    setMentionQuery(null);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 50);
  };

  // Send new comment (Trello-style)
  const handleSendComment = () => {
    if (!editingItem || !commentText.trim()) return;

    // Detect all mentions in text (full name, first name, or clean handle)
    const foundMentions: string[] = [];
    const textLower = commentText.toLowerCase();

    staffDirectory.forEach((staff) => {
      const fullName = staff.name.toLowerCase();
      const firstName = staff.name.split(' ')[0].toLowerCase();
      const igHandle = staff.instagram ? staff.instagram.toLowerCase().replace('@', '') : '';

      if (
        textLower.includes(`@${fullName}`) ||
        textLower.includes(`@${firstName}`) ||
        textLower.includes(`@[${fullName}]`) ||
        (igHandle && textLower.includes(`@${igHandle}`))
      ) {
        if (!foundMentions.includes(staff.name)) {
          foundMentions.push(staff.name);
        }
      }
    });

    const authorName = currentUser?.name || defaultCreator || 'Staf';
    const authorRole = currentUser?.role || activeRole;
    const authorEmail = currentUser?.email;

    const res = storageService.addComment(editingItem.ID, {
      authorName,
      authorEmail,
      authorRole,
      text: commentText.trim(),
      category: commentCategory,
      mentions: foundMentions.length > 0 ? foundMentions : undefined,
    });

    if (res.success && res.comment) {
      const updated = [...commentsList, res.comment];
      setCommentsList(updated);
      setCommentText('');
      setMentionQuery(null);
      if (onCommentsUpdated) {
        onCommentsUpdated(editingItem.ID, updated);
      }
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Delete comment
  const handleDeleteComment = (commentId: string) => {
    if (!editingItem) return;
    const ok = storageService.deleteComment(editingItem.ID, commentId);
    if (ok) {
      const updated = commentsList.filter((c) => c.id !== commentId);
      setCommentsList(updated);
      if (onCommentsUpdated) {
        onCommentsUpdated(editingItem.ID, updated);
      }
    }
  };

  // Autocomplete @mention detection
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart || 0;
    setCommentText(val);

    const textBeforeCursor = val.slice(0, cursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      // Must be at line start or preceded by whitespace
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      if (/\s/.test(charBeforeAt)) {
        const textBetween = textBeforeCursor.slice(lastAtIndex + 1);
        if (!textBetween.includes('\n') && textBetween.length < 30) {
          setMentionQuery(textBetween);
          setMentionCursorPos(lastAtIndex);
          return;
        }
      }
    }
    setMentionQuery(null);
  };

  const handleSelectMention = (staffName: string) => {
    if (mentionCursorPos === -1) return;
    const beforeAt = commentText.slice(0, mentionCursorPos);
    const cursor = textareaRef.current?.selectionStart || commentText.length;
    const afterQuery = commentText.slice(cursor);

    const newText = `${beforeAt}@${staffName} ${afterQuery}`;
    setCommentText(newText);
    setMentionQuery(null);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursor = beforeAt.length + staffName.length + 2;
        textareaRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 50);
  };

  const renderCommentText = (text: string) => {
    // Generate patterns for all staff names (longest first to avoid greedy cutoff)
    const staffPatterns = staffDirectory
      .flatMap((s) => [s.name, s.name.split(' ')[0]])
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
      .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    const pattern = new RegExp(
      `(@\\[[^\\]]+\\]|@(?:${staffPatterns.join('|')})|@[a-zA-Z0-9_]{2,30})`,
      'gi'
    );

    const parts = text.split(pattern);

    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const cleanName = part.replace(/^@\[?/, '').replace(/\]?$/, '');
        const isMentionedMe =
          currentUser?.name &&
          (cleanName.toLowerCase() === currentUser.name.toLowerCase() ||
            cleanName.toLowerCase() === currentUser.name.split(' ')[0].toLowerCase() ||
            currentUser.name.toLowerCase().includes(cleanName.toLowerCase()));

        return (
          <span
            key={index}
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold text-xs mx-0.5 transition-all ${
              isMentionedMe
                ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-400 font-extrabold'
                : isDarkMode
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}
            title={isMentionedMe ? 'Anda disebut dalam pesan ini' : `Mention untuk ${cleanName}`}
          >
            <AtSign className="w-3 h-3 inline shrink-0" />
            <span>{cleanName}</span>
            {isMentionedMe && (
              <span className="ml-1 text-[9px] uppercase px-1 py-0.2 bg-white text-red-600 rounded font-extrabold tracking-wider">
                Kamu
              </span>
            )}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const getCategoryBadgeClass = (cat?: CommentCategory) => {
    switch (cat) {
      case 'Revisi Klien':
        return isDarkMode
          ? 'bg-red-500/20 text-red-400 border-red-500/40'
          : 'bg-red-50 text-red-600 border-red-200';
      case 'Catatan Internal':
        return isDarkMode
          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
          : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Feedback Aset':
        return isDarkMode
          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Urgent':
        return isDarkMode
          ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
          : 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return isDarkMode
          ? 'bg-slate-800 text-slate-300 border-slate-700'
          : 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className={`${
          isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        } border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b ${
            isDarkMode ? 'border-slate-800 bg-[#1e293b]/70' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div>
            <h3 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {editingItem ? 'Edit Konten' : 'Tambah Konten Baru'}
            </h3>
            <p className="text-xs text-slate-400">
              {tipeProject === 'Internal'
                ? 'Kebutuhan Internal Studio (Fee Rp0)'
                : 'Klien Komersil (Sumber: Spreadsheet CRM)'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Switcher (Only shown if editing existing card) */}
        {editingItem && (
          <div
            className={`flex items-center gap-2 px-5 sm:px-6 pt-2 border-b shrink-0 ${
              isDarkMode ? 'border-slate-800 bg-[#0b0f17]' : 'border-slate-200 bg-slate-100/70'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveModalTab('detail')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeModalTab === 'detail'
                  ? 'border-red-600 text-red-500'
                  : isDarkMode
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Detail & Produksi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModalTab('comments')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeModalTab === 'comments'
                  ? 'border-red-600 text-red-500'
                  : isDarkMode
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Diskusi & Catatan Tim</span>
              {commentsList.length > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                  {commentsList.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* TAB 1: Detail & Produksi Form */}
        {activeModalTab === 'detail' && (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-4 text-sm">
            {/* Tipe Project */}
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                Tipe Project & Sumber Klien
              </label>
              <select
                value={tipeProject}
                onChange={(e) => setTipeProject(e.target.value as TipeProjectType)}
                className={`w-full ${
                  isDarkMode
                    ? 'bg-slate-900 text-slate-100 border-slate-700'
                    : 'bg-slate-50 text-slate-800 border-slate-300'
                } border rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 font-medium`}
              >
                <option value="Komersil">
                  Komersil (Sumber: Spreadsheet CRM - Fee dihitung saat Approved / RtP)
                </option>
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
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Auto-sync CRM
                  </span>
                </div>
                <select
                  value={klien}
                  onChange={(e) => setKlien(e.target.value)}
                  className={`w-full ${
                    isDarkMode
                      ? 'bg-slate-900 text-slate-100 border-slate-700'
                      : 'bg-slate-50 text-slate-800 border-slate-300'
                  } border rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 font-semibold`}
                >
                  {crmClients.map((c) => (
                    <option key={c.id} value={c.company}>
                      {c.company} {c.name ? `(PIC: ${c.name})` : ''}
                    </option>
                  ))}
                </select>

                {/* Selected CRM PIC Quick Preview */}
                {selectedCrmClient && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl border text-xs flex flex-wrap items-center gap-3 ${
                      isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedCrmClient.company}</span>
                    </div>
                    {selectedCrmClient.name && (
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>PIC: {selectedCrmClient.name}</span>
                      </div>
                    )}
                    {selectedCrmClient.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedCrmClient.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                  Kategori Internal Studio (Fee Rp0)
                </label>
                <div className="flex gap-2">
                  <select
                    value={klienInternal}
                    onChange={(e) => setKlienInternal(e.target.value)}
                    className={`flex-1 ${
                      isDarkMode
                        ? 'bg-slate-900 text-slate-100 border-slate-700'
                        : 'bg-slate-50 text-slate-800 border-slate-300'
                    } border rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 font-medium`}
                  >
                    {KATEGORI_INTERNAL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {klienInternal === 'Lainnya' && (
                    <input
                      type="text"
                      value={klienInternalLainnya}
                      onChange={(e) => setKlienInternalLainnya(e.target.value)}
                      placeholder="Sebutkan kategori..."
                      className={`flex-1 ${
                        isDarkMode
                          ? 'bg-slate-900 text-slate-100 border-slate-700'
                          : 'bg-slate-50 text-slate-800 border-slate-300'
                      } border rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500`}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Tema / Judul Konten */}
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                Tema / Judul Konten <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Contoh: Tips Foto Produk Estetik untuk UMKM"
                className={`w-full ${
                  isDarkMode
                    ? 'bg-slate-900 text-slate-100 border-slate-700'
                    : 'bg-slate-50 text-slate-800 border-slate-300'
                } border rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 font-medium`}
              />
            </div>

            {/* Ide Konten & Detail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase text-slate-400">
                    Ide Konten (Sub-tema / Hook)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAiModalMode('brainstorm');
                      setAiModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
                    title="Brainstorm ide konten dengan Gemini AI"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                    <span>✨ AI Brainstorm</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={ideKonten}
                  onChange={(e) => setIdeKonten(e.target.value)}
                  placeholder="Hook pembuka..."
                  className={`w-full ${
                    isDarkMode
                      ? 'bg-slate-900 text-slate-100 border-slate-700'
                      : 'bg-slate-50 text-slate-800 border-slate-300'
                  } border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 text-xs sm:text-sm`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                  Jenis Format Konten
                </label>
                <select
                  value={jenisKonten}
                  onChange={(e) => setJenisKonten(e.target.value as JenisKontenType)}
                  className={`w-full ${
                    isDarkMode
                      ? 'bg-slate-900 text-slate-100 border-slate-700'
                      : 'bg-slate-50 text-slate-800 border-slate-300'
                  } border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 text-xs sm:text-sm`}
                >
                  {JENIS_KONTEN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt} {opt === 'Reels / TikTok' ? '(Video)' : '(Desain)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
                  className={`w-full ${
                    isDarkMode
                      ? 'bg-slate-900 text-slate-100 border-slate-700'
                      : 'bg-slate-50 text-slate-800 border-slate-300'
                  } border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 font-mono text-xs sm:text-sm`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                  Jadwal Posting (Publish)
                </label>
                <input
                  type="date"
                  value={jadwalPosting}
                  onChange={(e) => setJadwalPosting(e.target.value)}
                  className={`w-full ${
                    isDarkMode
                      ? 'bg-slate-900 text-slate-100 border-slate-700'
                      : 'bg-slate-50 text-slate-800 border-slate-300'
                  } border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 font-mono text-xs sm:text-sm`}
                />
              </div>
            </div>

            {/* Creator Assignment & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                  Assignee / Creator
                </label>
                <select
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                  className={`w-full ${
                    isDarkMode
                      ? 'bg-slate-900 text-slate-100 border-slate-700'
                      : 'bg-slate-50 text-slate-800 border-slate-300'
                  } border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 text-xs sm:text-sm`}
                >
                  {staffDirectory.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name} ({st.jabatan})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                  Tahap Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusType)}
                  className={`w-full ${
                    isDarkMode
                      ? 'bg-slate-900 text-slate-100 border-slate-700'
                      : 'bg-slate-50 text-slate-800 border-slate-300'
                  } border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 text-xs sm:text-sm font-semibold`}
                >
                  {allowedStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Detail Brief & Copywriting */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase text-slate-400">
                  Detail Brief & Instruksi Konten
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAiModalMode('caption');
                    setAiModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-500 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  title="Buat copywriting caption & hook otomatis dengan Gemini AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span>✨ AI Generate Caption & Hook</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Rincian alur, visual guide, atau poin penting..."
                className={`w-full ${
                  isDarkMode
                    ? 'bg-slate-900 text-slate-100 border-slate-700'
                    : 'bg-slate-50 text-slate-800 border-slate-300'
                } border rounded-xl p-3 focus:outline-none focus:border-red-500 text-xs sm:text-sm`}
              />
            </div>

            {/* Link File Google Drive / Cloud Asset */}
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">
                Link File Aset / Google Drive / Figma
              </label>
              <input
                type="text"
                value={file}
                onChange={(e) => setFile(e.target.value)}
                placeholder="https://drive.google.com/..."
                className={`w-full ${
                  isDarkMode
                    ? 'bg-slate-900 text-slate-100 border-slate-700'
                    : 'bg-slate-50 text-slate-800 border-slate-300'
                } border rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 font-mono text-xs sm:text-sm`}
              />
            </div>

            {/* Checklist Asset & Caption */}
            <div
              className={`flex items-center gap-6 p-3 rounded-xl border ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
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

            {/* Quick Discussion Link Callout */}
            {editingItem && (
              <div
                onClick={() => setActiveModalTab('comments')}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isDarkMode
                    ? 'bg-red-500/10 hover:bg-red-500/15 border-red-500/30 text-red-300'
                    : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center text-red-500 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm block">
                      Diskusi & Catatan Tim ({commentsList.length})
                    </span>
                    <span className="text-[11px] opacity-80 block">
                      Kirim instruksi, revisi, dan mention rekan tim seperti di Trello.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModalTab('comments');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <span>Buka Chat</span>
                  <span className="tabular-nums">({commentsList.length})</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div
              className={`flex items-center justify-end gap-3 pt-3 border-t ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              } mt-2`}
            >
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 ${
                  isDarkMode
                    ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'
                    : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
                } rounded-xl font-medium transition-colors cursor-pointer text-xs sm:text-sm`}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 bg-[#E30000] hover:bg-[#c00000] text-white px-5 py-2 rounded-xl font-bold transition-transform active:scale-[0.98] disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Konten'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Trello-style Activity & Team Discussion */}
        {activeModalTab === 'comments' && editingItem && (
          <div className="flex-1 flex flex-col min-h-0 text-sm overflow-hidden">
            {/* Category Filter Chips Bar */}
            <div
              className={`px-5 sm:px-6 py-2 border-b flex items-center justify-between gap-1.5 overflow-x-auto shrink-0 ${
                isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 shrink-0">Filter:</span>
                <button
                  type="button"
                  onClick={() => setActiveFilterCategory('ALL')}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    activeFilterCategory === 'ALL'
                      ? 'bg-red-600 text-white shadow-sm'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Semua ({commentsList.length})
                </button>
                {COMMENT_CATEGORIES.map((cat) => {
                  const count = commentsList.filter((c) => c.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveFilterCategory(cat)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                        activeFilterCategory === cat
                          ? 'bg-red-600 text-white shadow-sm'
                          : isDarkMode
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {cat} {count > 0 && `(${count})`}
                    </button>
                  );
                })}
              </div>

              {commentsList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAiModalMode('summarize');
                    setAiModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer shrink-0 ml-2"
                  title="Ringkas riwayat diskusi dan revisi menjadi checklist tindakan otomatis dengan Gemini AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>✨ AI Ringkas Revisi</span>
                </button>
              )}
            </div>

            {/* Scrollable Comments Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-3 min-h-[220px] max-h-[380px]">
              {filteredComments.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
                      isDarkMode ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <MessageCircle className="w-6 h-6 text-red-500/80" />
                  </div>
                  <p className="font-semibold text-sm mb-1">Belum ada catatan diskusi atau revisi</p>
                  <p className="text-xs max-w-sm">
                    Gunakan kolom di bawah untuk memberi catatan revisi, feedback asset, atau mention rekan tim dengan mengetik <span className="font-mono font-bold text-red-500">@</span>.
                  </p>
                </div>
              ) : (
                filteredComments.map((comment) => {
                  const isAuthor =
                    currentUser &&
                    (currentUser.email === comment.authorEmail || currentUser.name === comment.authorName);
                  const canDelete = isAuthor || isFullOrAdmin;

                  return (
                    <div
                      key={comment.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isDarkMode
                          ? 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                          : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      {/* Header comment: Author + Role + Category + Time */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Avatar Circle */}
                          <div className="w-6 h-6 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                            {comment.authorName.charAt(0)}
                          </div>
                          <span
                            className={`font-bold text-xs truncate ${
                              isDarkMode ? 'text-slate-100' : 'text-slate-900'
                            }`}
                          >
                            {comment.authorName}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${
                              isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {ROLES[comment.authorRole]?.title || comment.authorRole}
                          </span>
                          {comment.category && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full border font-bold shrink-0 ${getCategoryBadgeClass(
                                comment.category
                              )}`}
                            >
                              {comment.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                              title="Hapus Catatan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Comment Body */}
                      <div
                        className={`text-xs sm:text-sm whitespace-pre-wrap leading-relaxed ${
                          isDarkMode ? 'text-slate-200' : 'text-slate-800'
                        }`}
                      >
                        {renderCommentText(comment.text)}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Compose New Comment Box with @mention dropdown */}
            <div
              className={`p-3.5 sm:p-4 border-t relative shrink-0 ${
                isDarkMode ? 'border-slate-800 bg-[#0b0f17]' : 'border-slate-200 bg-slate-50'
              }`}
            >
              {/* Floating @mention Autocomplete Suggestions */}
              {matchingStaff.length > 0 && mentionQuery !== null && (
                <div
                  className={`absolute left-4 bottom-full mb-2 w-64 rounded-xl border shadow-2xl p-1.5 z-50 ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-800/40 mb-1 flex items-center gap-1">
                    <AtSign className="w-3 h-3 text-red-500" /> Mention Anggota Tim:
                  </div>
                  {matchingStaff.map((staff) => (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => handleSelectMention(staff.name)}
                      className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-red-600/30 text-red-500 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {staff.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold block truncate">{staff.name}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{staff.jabatan}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Category Selector + Compose Area */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 font-medium text-[11px] shrink-0">Kategori:</span>
                    <select
                      value={commentCategory}
                      onChange={(e) => setCommentCategory(e.target.value as CommentCategory)}
                      className={`text-xs border rounded-lg px-2 py-1 focus:outline-none focus:border-red-500 font-semibold cursor-pointer ${
                        isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-white text-slate-800 border-slate-300'
                      }`}
                    >
                      {COMMENT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    Ketik <span className="font-mono font-bold text-red-500">@</span> untuk mention tim
                  </span>
                </div>

                {/* Quick Mention Strip */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 shrink-0 no-scrollbar">
                  <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 flex items-center gap-1">
                    <AtSign className="w-2.5 h-2.5 text-red-500" /> Tag Cepat:
                  </span>
                  {staffDirectory.map((staff) => {
                    const shortName = staff.name.split(' ')[0];
                    return (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => handleInsertQuickMention(staff)}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all shrink-0 cursor-pointer border ${
                          isDarkMode
                            ? 'bg-slate-800/90 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border-slate-700 hover:border-red-800/50'
                            : 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border-slate-200 hover:border-red-300'
                        }`}
                        title={`Tag ${staff.name} (${staff.jabatan})`}
                      >
                        @{shortName}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-end gap-2">
                  <div className="relative flex-1">
                    <textarea
                      ref={textareaRef}
                      rows={2}
                      value={commentText}
                      onChange={handleTextareaChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendComment();
                        }
                      }}
                      placeholder="Tulis instruksi revisi atau update... (Enter untuk kirim)"
                      className={`w-full p-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:border-red-500 resize-none ${
                        isDarkMode
                          ? 'bg-slate-900 text-slate-100 placeholder-slate-500 border-slate-700'
                          : 'bg-white text-slate-900 placeholder-slate-400 border-slate-300'
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendComment}
                    disabled={!commentText.trim()}
                    className="flex items-center gap-1.5 bg-[#E30000] hover:bg-[#c00000] text-white px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                    title="Kirim Catatan (Enter)"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Kirim</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant Studio Modal */}
      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        mode={aiModalMode}
        isDarkMode={isDarkMode}
        klien={
          tipeProject === 'Internal'
            ? klienInternal === 'Lainnya'
              ? klienInternalLainnya || 'Internal obeecreatives'
              : klienInternal
            : klien
        }
        tema={tema}
        ideKonten={ideKonten}
        jenisKonten={jenisKonten}
        tipeProject={tipeProject}
        comments={commentsList}
        onApplyCaption={(captionText) => {
          setDetail((prev) => (prev ? `${prev}\n\n---\n📝 DRAFT CAPTION & HOOK (AI):\n${captionText}` : captionText));
          setChecklistCaption(true);
        }}
        onApplyIdea={(ideaText) => {
          setDetail((prev) => (prev ? `${prev}\n\n---\n💡 KONSEP IDE KONTEN (AI):\n${ideaText}` : ideaText));
        }}
        onApplySummaryNote={(summaryText) => {
          if (!editingItem) return;
          const res = storageService.addComment(editingItem.ID, {
            authorName: 'Gemini AI Assistant',
            authorRole: 'admin',
            text: `📌 RINGKASAN REVISI OTOMATIS (AI):\n\n${summaryText}`,
            category: 'Catatan Internal',
          });
          if (res.success && res.comment) {
            const updated = [...commentsList, res.comment];
            setCommentsList(updated);
            if (onCommentsUpdated) {
              onCommentsUpdated(editingItem.ID, updated);
            }
          }
        }}
      />
    </div>
  );
};
