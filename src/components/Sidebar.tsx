import React from 'react';
import { ViewTab, UserRole } from '../types';
import { ROLES } from '../data/seedData';
import { storageService } from '../services/storageService';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Kanban,
  Calendar,
  BarChart3,
  History,
  CreditCard,
  Link2,
  Cpu,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Users,
  ShieldCheck,
  BookOpen,
  Sliders,
  Layers,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeRole: UserRole;
  onOpenLinksModal: () => void;
  onOpenNewContentModal: () => void;
  isDarkMode?: boolean;
  onSyncAll?: () => void;
  isSyncing?: boolean;
  onOpenSyncModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  activeRole,
  onOpenLinksModal,
  isDarkMode = true,
  onSyncAll,
  isSyncing = false,
  onOpenSyncModal,
}) => {
  const roleConfig = ROLES[activeRole] || ROLES.project_manager;
  const canManageSyncSettings = activeRole === 'admin' || activeRole === 'project_manager' || activeRole === 'site_engineer' || activeRole === 'web_developer';

  const allNavItems = [
    {
      tab: 'board' as ViewTab,
      label: 'Content Board',
      shortLabel: 'Board',
      icon: <Kanban className="w-5 h-5 text-red-500" />,
      description: 'Kanban alur produksi konten',
    },
    {
      tab: 'calendar' as ViewTab,
      label: 'Kalender Konten',
      shortLabel: 'Kalender',
      icon: <Calendar className="w-5 h-5 text-emerald-500" />,
      description: 'Timeline jadwal tayang',
    },
    {
      tab: 'dashboard' as ViewTab,
      label: 'Dashboard & Fee',
      shortLabel: 'Dashboard',
      icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
      description: 'Statistik & rekap fee creator',
    },
    {
      tab: 'activity' as ViewTab,
      label: 'Aktivitas & Log',
      shortLabel: 'Aktivitas',
      icon: <History className="w-5 h-5 text-amber-500" />,
      description: 'Audit log & presensi lokasi',
    },
    {
      tab: 'staff_database' as ViewTab,
      label: 'Database Tim & Staf',
      shortLabel: 'Tim & Staf',
      icon: <Users className="w-5 h-5 text-sky-500" />,
      description: 'Manajemen staf & direktori',
    },
    {
      tab: 'ratecard' as ViewTab,
      label: 'Rate Card Fee',
      shortLabel: 'Rate Card',
      icon: <CreditCard className="w-5 h-5 text-purple-500" />,
      description: 'Standar upah produksi konten',
    },
    {
      tab: 'access_settings' as ViewTab,
      label: 'Pengaturan Peran',
      shortLabel: 'Pengaturan',
      icon: <Sliders className="w-5 h-5 text-red-500" />,
      description: 'Kelola hak akses & matriks peran',
      badge: 'Role & Akses',
    },
    {
      tab: 'headless_gas' as ViewTab,
      label: 'Headless GAS',
      shortLabel: 'GAS Sync',
      icon: <Cpu className="w-5 h-5 text-emerald-500" />,
      description: 'Sinkronisasi Google Sheet (Dev)',
    },
    {
      tab: 'developer_docs' as ViewTab,
      label: 'Panduan Sistem (PDF)',
      shortLabel: 'Panduan PDF',
      icon: <BookOpen className="w-5 h-5 text-amber-500" />,
      description: 'Dokumentasi teknis & cetak PDF',
    },
  ];

  // Dynamic RBAC Menu Visibility based on storageService permissions
  const navItems = allNavItems.filter((item) => storageService.isTabAllowedForRole(activeRole, item.tab));

  return (
    <aside
      className={`hidden lg:flex flex-col ${
        isDarkMode ? 'bg-[#070d19] border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
      } border-r transition-all duration-300 ease-in-out shrink-0 select-none z-10 h-full ${
        isCollapsed ? 'w-[76px]' : 'w-72'
      }`}
    >
      {/* Quick Switch App Bar */}
      <div className="px-2.5 pt-3 pb-1 shrink-0">
        {!isCollapsed ? (
          <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${
            isDarkMode ? 'bg-slate-900/70 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
          } border text-xs font-semibold shadow-xs`}>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-500" />
              <span className="font-bold text-[13px] tracking-tight">Switch App</span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-700 border-slate-200'
            }`}>
              OS
            </span>
          </div>
        ) : (
          <div
            className={`flex items-center justify-center p-2.5 rounded-xl ${
              isDarkMode ? 'bg-slate-900/70 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            } border shadow-xs`}
            title="Switch App (OS)"
          >
            <Layers className="w-4 h-4 text-red-500" />
          </div>
        )}
      </div>

      {/* Navigation List with Enriched Large Fonts */}
      <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-1.5">
        {!isCollapsed && (
          <div className={`px-2 pt-1 pb-1 text-[11px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Menu Utama
          </div>
        )}

        {navItems.map((item) => {
          const isActive = currentTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              title={isCollapsed ? `${item.label} - ${item.description}` : undefined}
              className={`w-full flex items-center rounded-xl transition-all relative group cursor-pointer ${
                isCollapsed
                  ? 'justify-center p-3'
                  : 'justify-start gap-3 px-3.5 py-2.5 text-left'
              } ${
                isActive
                  ? 'bg-[#E30000] text-white font-bold shadow-md shadow-red-600/30 border border-red-500/40'
                  : isDarkMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {/* Active Marker Indicator for collapsed mode */}
              {isActive && isCollapsed && (
                <div className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-white rounded-full" />
              )}

              <div className={`shrink-0 ${isActive ? 'text-white' : ''}`}>
                {item.icon}
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[15px] font-bold leading-tight tracking-tight truncate">
                      {item.label}
                    </span>
                    {item.badge && !isActive && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 uppercase tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-red-100' : isDarkMode ? 'text-slate-400' : 'text-slate-500'} truncate mt-0.5 font-medium`}>
                    {item.description}
                  </div>
                </div>
              )}

              {/* Tooltip for mini icon mode */}
              {isCollapsed && (
                <div className={`fixed left-[84px] ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-lg'} border text-xs px-3 py-2 rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap`}>
                  <div className="font-bold text-sm text-red-500">{item.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.description}</div>
                </div>
              )}
            </button>
          );
        })}

        {/* Quick Link Button */}
        <div className="pt-2">
          {!isCollapsed && (
            <div className={`px-2 pb-1 text-[11px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Akses Cepat
            </div>
          )}

          <button
            onClick={onOpenLinksModal}
            title={isCollapsed ? 'Link Utama & Google Drive Klien' : undefined}
            className={`w-full flex items-center rounded-xl cursor-pointer transition-all group ${
              isCollapsed
                ? 'justify-center p-3'
                : 'justify-start gap-3 px-3.5 py-2.5 text-left'
            } ${
              isDarkMode
                ? 'text-slate-300 hover:text-sky-300 hover:bg-slate-800/60'
                : 'text-slate-700 hover:text-sky-600 hover:bg-slate-200/70'
            }`}
          >
            <Link2 className="w-5 h-5 text-sky-500 shrink-0" />
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className={`text-[15px] font-bold ${isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-800 group-hover:text-slate-900'} leading-tight tracking-tight`}>
                  Link Utama
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} truncate mt-0.5 font-medium`}>
                  Drive & Folder Klien
                </div>
              </div>
            )}

            {isCollapsed && (
              <div className={`fixed left-[84px] ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-lg'} border text-xs px-3 py-2 rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap`}>
                <div className="font-bold text-sm text-sky-400">Link Utama & Drive</div>
                <div className="text-xs text-slate-400 mt-0.5">Akses cepat folder klien</div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Footer & Sync Status */}
      <div className={`border-t ${isDarkMode ? 'border-slate-800/80 bg-[#050a14]' : 'border-slate-200 bg-slate-100/80'} p-3 shrink-0 flex flex-col gap-2.5`}>
        {/* Sync CRM & Staff Controls (Pindahan dari Navbar Atas) */}
        {onSyncAll && (
          !isCollapsed ? (
            <div className="flex items-center gap-1.5 w-full">
              <button
                onClick={onSyncAll}
                disabled={isSyncing}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                  isSyncing
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : isDarkMode
                    ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700/80 hover:border-slate-600'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs'
                }`}
                title="Tarik & Sinkronkan Data Terbaru dari Spreadsheet CRM dan Database Staff"
              >
                <RefreshCw className={`w-3.5 h-3.5 shrink-0 text-emerald-400 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                <span className="truncate">{isSyncing ? 'Menyinkronkan...' : 'Sync CRM & Staf'}</span>
              </button>

              {/* Buka Pengaturan Link: Disembunyikan dari Peran Staff */}
              {canManageSyncSettings && onOpenSyncModal && (
                <button
                  onClick={onOpenSyncModal}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                    isDarkMode
                      ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-600'
                      : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-300 shadow-xs'
                  }`}
                  title="Buka Pengaturan Link Spreadsheet CRM & Staff / Upload CSV"
                >
                  <FileSpreadsheet className="w-4 h-4 text-red-500" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 w-full">
              <button
                onClick={onSyncAll}
                disabled={isSyncing}
                className={`w-10 h-10 mx-auto rounded-xl border flex items-center justify-center transition-all cursor-pointer relative group ${
                  isSyncing
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : isDarkMode
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                }`}
                title={isSyncing ? 'Menyinkronkan...' : 'Sync CRM & Staf'}
              >
                <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                <div className={`fixed left-[84px] ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-lg'} border text-xs px-3 py-2 rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap`}>
                  <div className="font-bold text-sm text-emerald-400">Sync CRM & Staf</div>
                  <div className="text-xs text-slate-400 mt-0.5">Tarik data dari Google Sheets</div>
                </div>
              </button>

              {/* Buka Pengaturan Link (Collapsed): Disembunyikan dari Peran Staff */}
              {canManageSyncSettings && onOpenSyncModal && (
                <button
                  onClick={onOpenSyncModal}
                  className={`w-10 h-10 mx-auto rounded-xl border flex items-center justify-center transition-all cursor-pointer relative group ${
                    isDarkMode
                      ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                  }`}
                  title="Buka Pengaturan Link Spreadsheet CRM & Staff / Upload CSV"
                >
                  <FileSpreadsheet className="w-4 h-4 text-red-500" />
                  <div className={`fixed left-[84px] ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-lg'} border text-xs px-3 py-2 rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap`}>
                    <div className="font-bold text-sm text-red-400">Pengaturan Spreadsheet</div>
                    <div className="text-xs text-slate-400 mt-0.5">Edit Link Spreadsheet CRM & Staff</div>
                  </div>
                </button>
              )}
            </div>
          )
        )}
        {!isCollapsed && (
          <PWAInstallButton isDarkMode={isDarkMode} variant="sidebar" />
        )}
        {!isCollapsed ? (
          <div className={`flex items-center justify-between px-3 py-1.5 ${isDarkMode ? 'bg-emerald-950/30 border-emerald-800/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'} border rounded-xl text-xs`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-bold">Sync Engine</span>
            </div>
            <span className="font-mono text-[11px] font-semibold">0.01s Instant</span>
          </div>
        ) : (
          <div
            className="w-3.5 h-3.5 rounded-full bg-emerald-500 mx-auto animate-pulse"
            title="Optimistic Sync Engine: 0.01s Instant"
          />
        )}

        {/* Collapsed Mode Expand Button */}
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className={`w-10 h-10 mx-auto rounded-xl ${isDarkMode ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900'} flex items-center justify-center transition-colors cursor-pointer`}
            title="Buka Sidebar (Expanded)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
