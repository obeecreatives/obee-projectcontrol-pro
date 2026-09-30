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
    ...(['project_manager', 'site_engineer', 'web_developer', 'admin'].includes(activeRole) || roleConfig.canEditRateCard
      ? [
          {
            tab: 'staff_database' as ViewTab,
            label: 'Database Tim & Staf',
            shortLabel: 'Tim & Staf',
            icon: <Users className="w-5 h-5 text-sky-500" />,
            description: 'Manajemen staf & reset PIN',
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
            label: 'Pengaturan Akses',
            shortLabel: 'Akses & PIN',
            icon: <ShieldCheck className="w-5 h-5 text-red-500" />,
            description: 'Whitelist Email & Password Default',
          },
        ]
      : []),
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
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col ${
        isDarkMode ? 'bg-[#0b1120] border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
      } border-r transition-all duration-300 ease-in-out shrink-0 select-none z-30 sticky top-0 h-screen ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className={`h-16 border-b ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'} flex items-center px-4 justify-between gap-2 shrink-0`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <button
              onClick={() => onSelectTab('board')}
              className="flex items-baseline text-left focus:outline-none group"
            >
              <span className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'} transition-colors`}>
                obee
              </span>
              <span className="text-xl font-black tracking-tight text-[#E30000] ml-0.5">
                creatives
              </span>
            </button>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-200 text-slate-700 border-slate-300'} border px-1.5 py-0.5 rounded`}>
              OS
            </span>
          </div>
        ) : (
          <div className="mx-auto">
            <button
              onClick={() => onSelectTab('board')}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-black text-white text-base shadow-md hover:scale-105 transition-transform"
              title="obeecreatives Workspace OS"
            >
              oc
            </button>
          </div>
        )}

        {/* Toggle Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-lg ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'} transition-colors ${
            isCollapsed ? 'hidden' : 'block'
          }`}
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar (Mini Rail Mode)'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        {!isCollapsed && (
          <div className={`px-3 pb-1 text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Navigasi Utama
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
                  ? 'justify-center p-2.5'
                  : 'justify-start gap-3 px-3 py-2.5 text-left'
              } ${
                isActive
                  ? isDarkMode
                    ? 'bg-slate-800/90 text-white font-semibold shadow-sm border border-slate-700/60'
                    : 'bg-white text-slate-900 font-semibold shadow-sm border border-slate-200'
                  : isDarkMode
                  ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {/* Active Marker Line */}
              {isActive && (
                <div
                  className={`absolute bg-red-500 rounded-full transition-all ${
                    isCollapsed
                      ? 'left-0.5 top-2.5 bottom-2.5 w-1'
                      : 'left-1 top-2 bottom-2 w-1'
                  }`}
                />
              )}

              <div className="shrink-0">{item.icon}</div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold leading-tight truncate">
                    {item.label}
                  </div>
                  <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} truncate mt-0.5`}>
                    {item.description}
                  </div>
                </div>
              )}

              {/* Tooltip for mini icon mode */}
              {isCollapsed && (
                <div className={`fixed left-[76px] ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-lg'} border text-xs px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap`}>
                  <div className="font-bold text-red-500">{item.label}</div>
                  <div className="text-[10px]">{item.description}</div>
                </div>
              )}
            </button>
          );
        })}

        {/* Quick Link Button */}
        <div className="pt-2">
          {!isCollapsed && (
            <div className={`px-3 pb-1 text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Akses Cepat
            </div>
          )}

          <button
            onClick={onOpenLinksModal}
            title={isCollapsed ? 'Link Utama & Google Drive Klien' : undefined}
            className={`w-full flex items-center rounded-xl cursor-pointer transition-all group ${
              isCollapsed
                ? 'justify-center p-2.5'
                : 'justify-start gap-3 px-3 py-2.5 text-left'
            } ${
              isDarkMode
                ? 'text-slate-400 hover:text-sky-300 hover:bg-slate-800/40'
                : 'text-slate-600 hover:text-sky-600 hover:bg-slate-100'
            }`}
          >
            <Link2 className="w-5 h-5 text-sky-500 shrink-0" />
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'} leading-tight`}>
                  Link Utama
                </div>
                <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} truncate mt-0.5`}>
                  Drive & Folder Klien
                </div>
              </div>
            )}

            {isCollapsed && (
              <div className={`fixed left-[76px] ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-lg'} border text-xs px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap`}>
                <div className="font-bold text-sky-500">Link Utama & Drive</div>
                <div className="text-[10px]">Akses cepat folder klien</div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Footer & Sync Status */}
      <div className={`border-t ${isDarkMode ? 'border-slate-800/80 bg-[#090e1a]/60' : 'border-slate-200 bg-slate-100/60'} p-2.5 shrink-0 flex flex-col gap-2`}>
        {!isCollapsed && (
          <PWAInstallButton isDarkMode={isDarkMode} variant="sidebar" />
        )}
        {!isCollapsed ? (
          <div className={`flex items-center justify-between px-2 py-1 ${isDarkMode ? 'bg-emerald-950/30 border-emerald-800/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'} border rounded-lg text-[11px]`}>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sync Engine</span>
            </div>
            <span className="font-mono text-[10px]">0.01s Instant</span>
          </div>
        ) : (
          <div
            className="w-3 h-3 rounded-full bg-emerald-500 mx-auto animate-pulse"
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
