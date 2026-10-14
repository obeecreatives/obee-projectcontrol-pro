import React, { useMemo, useState } from 'react';
import { ContentItem, UserRole, StatusType, StaffUser } from '../types';
import { ROLES } from '../data/seedData';
import { formatDateIndo } from '../utils/dateFormatter';
import { analyzeAssetUrl } from '../utils/imageUtils';
import {
  ExternalLink,
  FolderOpen,
  Calendar,
  Lock,
  Edit2,
  Trash2,
  Clapperboard,
  Image as ImageIcon,
  MessageSquare,
  AtSign,
  Maximize2,
  X,
} from 'lucide-react';

interface ContentCardProps {
  item: ContentItem;
  activeRole: UserRole;
  onEdit: (item: ContentItem) => void;
  onOpenChat?: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: StatusType) => void;
  onToggleChecklist: (id: string, field: 'ChecklistAsset' | 'ChecklistCaption', value: boolean) => void;
  isDarkMode?: boolean;
  currentUser?: StaffUser | null;
  isHighlighted?: boolean;
}

const ALL_STATUS_OPTIONS: StatusType[] = [
  'New Idea',
  'On Progress',
  'Request Approval',
  'Approved / RtP',
  'Scheduling',
  'Published',
];

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  activeRole,
  onEdit,
  onOpenChat,
  onDelete,
  onStatusChange,
  onToggleChecklist,
  isDarkMode = true,
  currentUser,
  isHighlighted = false,
}) => {
  const roleConfig = ROLES[activeRole] || ROLES.project_manager;
  const isInternal = item.TipeProject === 'Internal';
  const isVideo = item.Kategori === 'Video' || item.JenisKonten === 'Reels / TikTok';

  const isClient = activeRole === 'client';
  const isStaff = activeRole === 'staff_creator';
  const isFullOrAdmin =
    roleConfig.canChangeStatusToAll ||
    activeRole === 'admin' ||
    activeRole === 'project_manager' ||
    activeRole === 'web_developer' ||
    activeRole === 'site_engineer';

  const commentsCount = item.comments ? item.comments.length : 0;

  // Check if current user is @mentioned in any comment of this card
  const isMentionedForMe = useMemo(() => {
    if (!currentUser || !item.comments || item.comments.length === 0) return false;
    const myName = currentUser.name.toLowerCase();
    const myFirstName = currentUser.name.split(' ')[0].toLowerCase();
    return item.comments.some((c) => {
      if (
        c.mentions &&
        c.mentions.some(
          (m) =>
            m.toLowerCase().includes(myFirstName) ||
            myName.includes(m.toLowerCase())
        )
      ) {
        return true;
      }
      const lowerText = c.text.toLowerCase();
      return (
        lowerText.includes(`@${myFirstName}`) ||
        lowerText.includes(`@${myName}`) ||
        lowerText.includes(`@[${myName}]`)
      );
    });
  }, [currentUser, item.comments]);

  const [showLightbox, setShowLightbox] = useState(false);
  const imageAnalysis = useMemo(() => analyzeAssetUrl(item.FotoUrl || ''), [item.FotoUrl]);

  // Calculate available statuses for this card & user role:
  const getAvailableStatuses = (): StatusType[] => {
    if (isClient) return [];
    if (isFullOrAdmin) return ALL_STATUS_OPTIONS;

    // Staff / Creator / Freelancer
    if (item.Status === 'New Idea' || item.Status === 'On Progress' || item.Status === 'Request Approval') {
      return ['New Idea', 'On Progress', 'Request Approval'];
    }

    if (item.Status === 'Approved / RtP') {
      return ['Approved / RtP', 'Scheduling', 'Published'];
    }

    if (item.Status === 'Scheduling' || item.Status === 'Published') {
      return ['Scheduling', 'Published'];
    }

    return ['New Idea', 'On Progress', 'Request Approval'];
  };

  const availableStatusOptions = getAvailableStatuses();
  const isCurrentStatusLockedForUser = isClient;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('a')
    ) {
      return;
    }
    onEdit(item);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`${
        isHighlighted
          ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20 animate-pulse'
          : ''
      } ${
        isDarkMode
          ? 'bg-[#1e293b]/90 hover:bg-[#1e293b] border-slate-700/80 shadow-black/40'
          : 'bg-white hover:bg-slate-50 border-slate-200 shadow-slate-200/50'
      } border rounded-xl p-2.5 shadow-sm transition-all duration-150 flex flex-col gap-2 cursor-pointer hover:border-red-500/40 relative group`}
    >
      {/* Newly created highlight badge */}
      {isHighlighted && (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold tracking-tight shadow-sm self-start">
          <span>✨ Baru Ditambahkan</span>
        </div>
      )}

      {/* Mentioned Notification Alert Tag */}
      {isMentionedForMe && (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-red-600/90 text-white text-[10px] font-bold tracking-tight shadow-sm self-start">
          <AtSign className="w-3 h-3 animate-pulse" />
          <span>Anda disebut di kartu ini</span>
        </div>
      )}

      {/* Card Visual / Cover Image / Brand Banner */}
      {item.FotoUrl && (
        <>
          {imageAnalysis.isEmbeddableImage ? (
            <div className="relative w-full h-36 rounded-lg overflow-hidden bg-slate-900/50 border border-slate-700/60 group/cover">
              <img
                src={imageAnalysis.convertedUrl}
                alt={item.Tema || 'Cover Kartu'}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (imageAnalysis.fileId && img.src.includes('googleusercontent.com')) {
                    img.src = `https://drive.google.com/thumbnail?id=${imageAnalysis.fileId}&sz=w800`;
                    return;
                  }
                  img.style.display = 'none';
                  const fallback = img.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div
                style={{ display: 'none' }}
                className="w-full h-full flex-col items-center justify-center bg-slate-900/80 text-slate-400 text-[11px] gap-1 p-2 text-center"
              >
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>Gambar tidak dapat dimuat</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLightbox(true);
                }}
                className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/75 hover:bg-black/95 text-white text-[10px] font-medium flex items-center gap-1 backdrop-blur-xs opacity-90 sm:opacity-0 group-hover/cover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                title="Klik untuk melihat ukuran penuh"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Zoom</span>
              </button>
            </div>
          ) : imageAnalysis.type === 'canva' ? (
            <div className="w-full rounded-lg overflow-hidden p-2.5 bg-gradient-to-r from-teal-950/50 via-purple-950/50 to-pink-950/40 border border-cyan-500/40 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00c4cc] to-[#7d2ae8] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  C
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                    <span>Canva Design</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-900/60 text-cyan-200">Aset</span>
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[150px]">Tautan Desain Aktif</p>
                </div>
              </div>
              <a
                href={item.FotoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 transition-colors shrink-0"
              >
                <span>Buka</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : imageAnalysis.type === 'capcut' ? (
            <div className="w-full rounded-lg overflow-hidden p-2.5 bg-gradient-to-r from-slate-900 to-neutral-900 border border-neutral-700 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-neutral-800 text-white flex items-center justify-center font-bold text-xs shrink-0 border border-white/20 shadow-sm">
                  🎬
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white flex items-center gap-1">
                    <span>CapCut Project</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-300">Video</span>
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[150px]">Tautan Project CapCut</p>
                </div>
              </div>
              <a
                href={item.FotoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1 transition-colors shrink-0"
              >
                <span>Buka</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : imageAnalysis.type === 'figma' ? (
            <div className="w-full rounded-lg overflow-hidden p-2.5 bg-purple-950/40 border border-purple-500/40 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  F
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-purple-300">Figma Design</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[150px]">Tautan Canvas Figma</p>
                </div>
              </div>
              <a
                href={item.FotoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 flex items-center gap-1 transition-colors shrink-0"
              >
                <span>Buka</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : null}
        </>
      )}

      {/* Card Header: Client & Tipe Tag */}
      <div className="flex items-center justify-between gap-1.5 text-xs">
        <span
          className={`font-bold tracking-tight uppercase truncate flex-1 min-w-0 ${
            isInternal
              ? isDarkMode ? 'text-slate-400' : 'text-slate-500'
              : 'text-[#E30000] font-extrabold'
          }`}
          title={item.Klien}
        >
          {item.Klien}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {isInternal ? (
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
              } border`}
              title="Klien Internal Studio obeecreatives (Fee Rp0)"
            >
              Internal Studio
            </span>
          ) : (
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                isDarkMode ? 'bg-red-950/60 text-red-300 border-red-800/40' : 'bg-red-50 text-red-700 border-red-200'
              } border`}
              title="Klien Komersil berasal dari Spreadsheet CRM"
            >
              CRM Komersil
            </span>
          )}
        </div>
      </div>

      {/* Main Title / Tema */}
      <div>
        <h4 className={`font-semibold text-sm leading-snug line-clamp-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
          {item.Tema || item.IdeKonten || '(Tanpa Tema)'}
        </h4>
        {item.Detail && (
          <p className={`text-[11px] mt-0.5 line-clamp-2 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {item.Detail}
          </p>
        )}
      </div>

      {/* Metadata: Creator, Jenis Konten, Jadwal */}
      <div className={`flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        <span className={`font-medium truncate max-w-[120px] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.Creator || 'Belum ditugaskan'}</span>
        <span aria-hidden="true" className="text-slate-400">·</span>
        <span className="flex items-center gap-1 truncate">
          {isVideo ? (
            <Clapperboard className="w-3 h-3 text-sky-500 shrink-0 inline" />
          ) : (
            <ImageIcon className="w-3 h-3 text-emerald-500 shrink-0 inline" />
          )}
          <span className="truncate">{item.JenisKonten}</span>
        </span>
      </div>

      {/* Jadwal Posting & Fee (if role permits) */}
      <div className={`flex items-center justify-between text-xs pt-1 border-t ${isDarkMode ? 'text-slate-400 border-slate-700/60' : 'text-slate-500 border-slate-200'}`}>
        <div className="flex items-center gap-1 text-[11px]">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{item.JadwalPosting ? formatDateIndo(item.JadwalPosting) : 'Belum ada jadwal'}</span>
        </div>
        {roleConfig.showInternalFee && (
          <span
            className={`font-mono text-[11px] font-bold ${
              item.FeeAmount > 0
                ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                : 'text-slate-400'
            }`}
          >
            {item.TipeProject === 'Internal'
              ? 'Rp0 (Internal)'
              : item.FeeAmount > 0
              ? `Rp${item.FeeAmount.toLocaleString('id-ID')}`
              : 'Menunggu RtP'}
          </span>
        )}
      </div>

      {/* Action Links: Materi & Drive File */}
      {(item.MateriKonten || item.File) && (
        <div className="flex flex-col gap-1 pt-0.5">
          {item.MateriKonten && (
            <a
              href={item.MateriKonten}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md border transition-colors truncate ${isDarkMode ? 'text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 border-red-900/30' : 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-200'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span className="truncate">Materi: {item.MateriKonten}</span>
            </a>
          )}
          {item.File && (
            <a
              href={item.File}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md border transition-colors truncate ${isDarkMode ? 'text-sky-400 hover:text-sky-300 bg-sky-950/30 hover:bg-sky-950/50 border-sky-900/30' : 'text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 border-sky-200'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <FolderOpen className="w-3 h-3 shrink-0" />
              <span className="truncate">File: {item.File}</span>
            </a>
          )}
        </div>
      )}

      {/* Checklist Asset & Caption + Clickable Comment Badge */}
      <div className={`flex items-center justify-between text-xs pt-1 border-t ${isDarkMode ? 'text-slate-300 border-slate-700/60' : 'text-slate-700 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 select-none">
            <input
              type="checkbox"
              checked={!!item.ChecklistAsset}
              onChange={(e) => onToggleChecklist(item.ID, 'ChecklistAsset', e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-400 text-red-600 focus:ring-0 cursor-pointer"
            />
            <span className="text-[11px]">Asset</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 select-none">
            <input
              type="checkbox"
              checked={!!item.ChecklistCaption}
              onChange={(e) => onToggleChecklist(item.ID, 'ChecklistCaption', e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-400 text-red-600 focus:ring-0 cursor-pointer"
            />
            <span className="text-[11px]">Caption</span>
          </label>
        </div>

        {/* Comment Badge: Clickable directly to open chat */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenChat) onOpenChat(item);
            else onEdit(item);
          }}
          className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border transition-colors cursor-pointer ${
            commentsCount > 0
              ? isDarkMode
                ? 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border-red-500/30'
                : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
              : isDarkMode
              ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200'
          }`}
          title={`${commentsCount} Catatan Diskusi (Klik untuk buka chat & mention)`}
        >
          <MessageSquare className={`w-3 h-3 ${commentsCount > 0 ? 'text-red-500' : 'text-slate-400'}`} />
          <span className="tabular-nums">{commentsCount}</span>
        </button>
      </div>

      {/* Status Controller (Role Aware) */}
      <div className="pt-0.5">
        {isCurrentStatusLockedForUser ? (
          <div className={`flex items-center justify-center gap-1 text-[11px] font-semibold py-1 px-1.5 rounded-lg border ${isDarkMode ? 'bg-slate-800/80 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            <Lock className="w-3 h-3 shrink-0" />
            <span className="truncate">{item.Status} · Read-Only</span>
          </div>
        ) : (
          <div className="space-y-1">
            <select
              value={item.Status}
              onChange={(e) => onStatusChange(item.ID, e.target.value as StatusType)}
              className={`w-full text-xs font-semibold rounded-lg px-2 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer transition-colors border ${isDarkMode ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'}`}
            >
              {availableStatusOptions.map((st) => (
                <option key={st} value={st}>
                  {st === 'Approved / RtP' && isFullOrAdmin ? `⭐ Pindah: ${st} (Kunci Fee)` : `Pindah ke: ${st}`}
                </option>
              ))}
              {isStaff && ['New Idea', 'On Progress', 'Request Approval'].includes(item.Status) && (
                <option value="Approved / RtP" disabled>
                  🔒 Approved / RtP (Perlu Hak Admin)
                </option>
              )}
              {!availableStatusOptions.includes(item.Status) && (
                <option value={item.Status} disabled>
                  {item.Status} (Terkunci)
                </option>
              )}
            </select>

            {isStaff && item.Status === 'Approved / RtP' && (
              <div className="text-[10px] text-emerald-400 font-medium px-1 flex items-center gap-1">
                <span>✓ Telah Disetujui Admin · Siap Dijadwalkan</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Actions: Tools, Chat Button, Edit, Delete */}
      <div className={`flex items-center justify-between pt-1 border-t mt-0.5 ${isDarkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[70px]">
          {item.ProjectTools || 'Canva'}
        </span>
        <div className="flex items-center gap-1.5">
          {/* Quick Chat / Diskusi Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenChat) onOpenChat(item);
              else onEdit(item);
            }}
            className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border transition-all cursor-pointer ${
              commentsCount > 0
                ? isDarkMode
                  ? 'bg-red-950/40 hover:bg-red-950/70 text-red-400 border-red-800/60 font-semibold'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 font-semibold'
                : isDarkMode
                ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
                : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-300'
            }`}
            title="Buka ruang diskusi & mention tim"
          >
            <MessageSquare className={`w-3 h-3 ${commentsCount > 0 ? 'text-red-500' : 'text-slate-400'}`} />
            <span>Diskusi</span>
            {commentsCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-600 text-white tabular-nums">
                {commentsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border transition-colors cursor-pointer ${isDarkMode ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700' : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-300'}`}
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit</span>
          </button>

          {roleConfig.canDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.ID);
              }}
              className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Hapus Konten"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {showLightbox && imageAnalysis.isEmbeddableImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            e.stopPropagation();
            setShowLightbox(false);
          }}
        >
          <div
            className="relative max-w-4xl max-h-[92vh] w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2 truncate">
                <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                  {item.Tema || 'Pratinjau Sampul'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                  {imageAnalysis.label}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={item.FotoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  title="Buka gambar asli di tab baru"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Buka Asli</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowLightbox(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-3 sm:p-4 flex items-center justify-center overflow-auto bg-black/50">
              <img
                src={imageAnalysis.convertedUrl}
                alt={item.Tema || 'Full Preview'}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
