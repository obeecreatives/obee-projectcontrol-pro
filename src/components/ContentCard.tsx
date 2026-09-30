import React, { useMemo } from 'react';
import { ContentItem, UserRole, StatusType, StaffUser } from '../types';
import { ROLES } from '../data/seedData';
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
}) => {
  const roleConfig = ROLES[activeRole] || ROLES.project_manager;
  const isInternal = item.TipeProject === 'Internal';
  const isVideo = item.Kategori === 'Video' || item.JenisKonten === 'Reels / TikTok';

  const isClient = activeRole === 'client';
  const isStaff = activeRole === 'staff_creator' || activeRole === 'vendor_lapangan';
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
        isDarkMode
          ? 'bg-[#1e293b]/90 hover:bg-[#1e293b] border-slate-700/80 shadow-black/40'
          : 'bg-white hover:bg-slate-50 border-slate-200 shadow-slate-200/50'
      } border rounded-xl p-2.5 shadow-sm transition-all duration-150 flex flex-col gap-2 cursor-pointer hover:border-red-500/40 relative group`}
    >
      {/* Mentioned Notification Alert Tag */}
      {isMentionedForMe && (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-red-600/90 text-white text-[10px] font-bold tracking-tight shadow-sm self-start">
          <AtSign className="w-3 h-3 animate-pulse" />
          <span>Anda disebut di kartu ini</span>
        </div>
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
          <span>{item.JadwalPosting || 'Belum ada jadwal'}</span>
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
    </div>
  );
};
