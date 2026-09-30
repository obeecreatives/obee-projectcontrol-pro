import React from 'react';
import { ContentItem, UserRole, StatusType } from '../types';
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
} from 'lucide-react';

interface ContentCardProps {
  item: ContentItem;
  activeRole: UserRole;
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: StatusType) => void;
  onToggleChecklist: (id: string, field: 'ChecklistAsset' | 'ChecklistCaption', value: boolean) => void;
  isDarkMode?: boolean;
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
  onDelete,
  onStatusChange,
  onToggleChecklist,
  isDarkMode = true,
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

  // Calculate available statuses for this card & user role:
  // a. Staff/creator/freelancer:
  //    - draft phase (New Idea, On Progress, Request Approval)
  //    - CANNOT move to Approved / RtP
  //    - If ALREADY in Approved / RtP, given rights back to move to Scheduling / Published!
  const getAvailableStatuses = (): StatusType[] => {
    if (isClient) return [];
    if (isFullOrAdmin) return ALL_STATUS_OPTIONS;

    // Staff / Creator / Freelancer
    if (item.Status === 'New Idea' || item.Status === 'On Progress' || item.Status === 'Request Approval') {
      // In early draft: can move between New Idea, On Progress, Request Approval
      return ['New Idea', 'On Progress', 'Request Approval'];
    }

    if (item.Status === 'Approved / RtP') {
      // Once Approved / RtP, staff can advance to Scheduling or Published!
      return ['Approved / RtP', 'Scheduling', 'Published'];
    }

    if (item.Status === 'Scheduling' || item.Status === 'Published') {
      // Once in Scheduling or Published, staff can move between Scheduling and Published
      return ['Scheduling', 'Published'];
    }

    return ['New Idea', 'On Progress', 'Request Approval'];
  };

  const availableStatusOptions = getAvailableStatuses();
  const isCurrentStatusLockedForUser = isClient;

  return (
    <div className={`${isDarkMode ? 'bg-[#1e293b]/90 hover:bg-[#1e293b] border-slate-700/80 shadow-black/40' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-slate-200/50'} border rounded-xl p-2.5 shadow-sm transition-all duration-150 flex flex-col gap-2`}>
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
              title="Klien Komersil berasal dari Spreadsheet CRM (Siap Integrasi Modern Web App)"
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

      {/* Jadwal Posting date if specified */}
      {item.JadwalPosting && (
        <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${isDarkMode ? 'text-amber-300/90 bg-amber-950/30 border-amber-900/40' : 'text-amber-800 bg-amber-50 border-amber-200'}`}>
          <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="truncate">Jadwal: {item.JadwalPosting}</span>
        </div>
      )}

      {/* Fee Display (Hidden for Client role) */}
      {roleConfig.showInternalFee && item.FeeAmount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <div
            className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border self-start ${
              isDarkMode
                ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/40'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}
            title="Nilai fee ditentukan dari persetujuan Approved / RtP dan siap ditarik ke Web App Database Staff"
          >
            Fee: Rp {Number(item.FeeAmount).toLocaleString('id-ID')}
          </div>
          {item.Status === 'Approved / RtP' && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"
              title="Fee terkunci pada status Approved / RtP oleh Admin"
            >
              ✓ Fee Terkunci
            </span>
          )}
        </div>
      )}

      {/* Direct Links (Materi & File) */}
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

      {/* Checklist Asset & Caption + Comment Badge */}
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

        {/* Micro badge: ONLY shown if comments > 0 to keep UI 100% clean */}
        {Boolean(item.comments && item.comments.length > 0) && (
          <div
            className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
              isDarkMode
                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}
            title={`${item.comments!.length} Catatan Diskusi / Revisi`}
          >
            <MessageSquare className="w-3 h-3 text-red-500" />
            <span className="tabular-nums">{item.comments!.length}</span>
          </div>
        )}
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

      {/* Card Actions */}
      <div className={`flex items-center justify-between pt-1 border-t mt-0.5 ${isDarkMode ? 'border-slate-700/60' : 'border-slate-200'}`}>
        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[80px]">
          {item.ProjectTools || 'Canva'}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(item)}
            className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border transition-colors cursor-pointer ${isDarkMode ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700' : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-300'}`}
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit</span>
          </button>
          {roleConfig.canDelete && (
            <button
              onClick={() => onDelete(item.ID)}
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
