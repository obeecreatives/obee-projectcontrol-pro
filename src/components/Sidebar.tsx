import React from 'react';
import { ViewTab, UserRole } from '../types';
import { ROLES } from '../data/seedData';
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  activeRole,
  onOpenLinksModal,
  isDarkMode = true,
}) => {
  const roleConfig = ROLES[activeRole] || ROLES.project_manager;

  const navItems = [
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
    ...(['project_manager', 'site_engineer', 'web_developer'].includes(activeRole)
      ? [
          {
            tab: 'headless_gas' as ViewTab,
            label: 'Headless GAS',
            shortLabel: 'GAS Sync',
            icon: <Cpu className="w-5 h-5 text-emerald-500" />,
            description: 'Sinkronisasi Google Sheet (Dev)',
          },
        ]
      : []),
    ...(['project_manager', 'web_developer', 'admin'].includes(activeRole)
      ? [
          {
            tab: 'developer_docs' as ViewTab,
            label: 'Panduan Sistem (PDF)',
            shortLabel: 'Panduan PDF',
            icon: <BookOpen className="w-5 h-5 text-amber-500" />,
            description: 'Dokumentasi teknis & cetak PDF',
          },
        ]
      : []),
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col ${
        isDarkMode ? 'bg-[#070d19] border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
      } border-r transition-all duration-300 ease-in-out shrink-0 select-none z-30 sticky top-0 h-screen ${
        isCollapsed ? 'w-[76px]' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className={`h-[72px] border-b ${isDarkMode ? 'border-slate-800/80 bg-[#070d19]' : 'border-slate-200 bg-white'} flex items-center px-4 justify-between gap-2 shrink-0`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Red Ring Icon from Screenshot */}
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-inner">
              <div className="w-6 h-6 rounded-full border-[3px] border-[#E30000] flex items-center justify-center shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#E30000]/30" />
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <button
                onClick={() => onSelectTab('board')}
                className="flex items-baseline text-left focus:outline-none group"
              >
                <span className={`text-[19px] font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'} transition-colors`}>
                  obee
                </span>
                <span className="text-[19px] font-black tracking-tight text-[#E30000] ml-1">
                  creatives
                </span>
              </button>
              <div className="text-[10px] font-bold text-sky-400 tracking-wider uppercase -mt-0.5">
                CRM &bull; WORKSPACE OS
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <button
              onClick={() => onSelectTab('board')}
              className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:scale-105 transition-transform"
              title="obeecreatives Workspace OS"
            >
              <div className="w-6 h-6 rounded-full border-[3px] border-[#E30000] flex items-center justify-center" />
            </button>
          </div>
        )}

        {/* Toggle Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className={`p-2 rounded-xl ${
            isDarkMode
              ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              : 'bg-slate-200/80 hover:bg-slate-300 text-slate-600 hover:text-slate-900 border border-slate-300'
          } transition-colors cursor-pointer ${
            isCollapsed ? 'hidden' : 'block'
          }`}
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Switch App Bar (Inspired by Screenshot) */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-1">
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
        </div>
      )}

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
      <div className={`border-t ${isDarkMode ? 'border-slate-800/80 bg-[#050a14]' : 'border-slate-200 bg-slate-100/80'} p-3 shrink-0 flex flex-col gap-2`}>
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
