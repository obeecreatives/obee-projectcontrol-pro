import React, { useState, useEffect } from 'react';
import { ViewTab, UserRole, StaffUser, WorkMode } from '../types';
import { ROLES } from '../data/seedData';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Kanban,
  Calendar,
  BarChart3,
  History,
  CreditCard,
  Cpu,
  Users,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Building2,
  MapPin,
  Home,
  Coffee,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  activeRole: UserRole;
  onOpenRoleModal: () => void;
  identityName: string;
  onOpenIdentityModal: () => void;
  onOpenNewContentModal: () => void;
  onOpenLinksModal: () => void;
  currentUser: StaffUser | null;
  onLogout: () => void;
  onOpenWorkModeModal: () => void;
  currentWorkMode: WorkMode;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onSyncAll?: () => void;
  isSyncing?: boolean;
  onOpenSyncModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeRole,
  onOpenRoleModal,
  identityName,
  onOpenIdentityModal,
  onOpenNewContentModal,
  currentUser,
  onLogout,
  onOpenWorkModeModal,
  currentWorkMode,
  isSidebarCollapsed = false,
  onToggleSidebar,
  isDarkMode,
  onToggleTheme,
  onSyncAll,
  isSyncing = false,
  onOpenSyncModal,
}) => {
  const roleConfig = ROLES[activeRole] || ROLES.project_manager;
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const getWorkModeBadge = (mode: WorkMode) => {
    switch (mode) {
      case 'WFO':
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Studio',
          borderCls: isDarkMode
            ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40'
            : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        };
      case 'ON_SITE':
        return {
          icon: <MapPin className="w-3.5 h-3.5 text-amber-400" />,
          label: 'On-Site',
          borderCls: isDarkMode
            ? 'border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/40'
            : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100',
        };
      case 'WFH':
        return {
          icon: <Home className="w-3.5 h-3.5 text-sky-400" />,
          label: 'WFH',
          borderCls: isDarkMode
            ? 'border-sky-500/40 bg-sky-950/40 text-sky-300 hover:bg-sky-900/40'
            : 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100',
        };
      case 'MOBILE':
        return {
          icon: <Coffee className="w-3.5 h-3.5 text-purple-400" />,
          label: 'Mobile',
          borderCls: isDarkMode
            ? 'border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-900/40'
            : 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100',
        };
    }
  };

  const currentModeBadge = getWorkModeBadge(currentWorkMode);

  const getTabInfo = () => {
    switch (currentTab) {
      case 'board':
        return { title: 'Content Board', icon: <Kanban className="w-4 h-4 text-red-500" /> };
      case 'calendar':
        return { title: 'Kalender Konten', icon: <Calendar className="w-4 h-4 text-emerald-400" /> };
      case 'dashboard':
        return { title: 'Dashboard & Payroll', icon: <BarChart3 className="w-4 h-4 text-blue-400" /> };
      case 'activity':
        return { title: 'Aktivitas & Log', icon: <History className="w-4 h-4 text-amber-400" /> };
      case 'ratecard':
        return { title: 'Rate Card Fee', icon: <CreditCard className="w-4 h-4 text-purple-400" /> };
      case 'staff_database':
        return { title: 'Database Tim & Staf', icon: <Users className="w-4 h-4 text-sky-400" /> };
      case 'headless_gas':
        return { title: 'Headless GAS Sync', icon: <Cpu className="w-4 h-4 text-emerald-400" /> };
      default:
        return { title: 'Project Control', icon: null };
    }
  };

  const currentTabInfo = getTabInfo();

  return (
    <header className={`sticky top-0 z-20 ${isDarkMode ? 'bg-[#0f172a]/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-800'} backdrop-blur-md border-b transition-colors`}>
      <div className="w-full px-3 sm:px-5 h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Brand Button */}
          <div className="flex lg:hidden items-center gap-1.5">
            <button
              onClick={() => onSelectTab('board')}
              className="flex items-baseline text-left group focus:outline-none"
            >
              <span className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>obee</span>
              <span className="text-lg font-black tracking-tight text-[#E30000] ml-0.5">creatives</span>
            </button>
            <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'} border`}>
              OS
            </span>
          </div>

          {/* Desktop Breadcrumb & Sidebar Toggle */}
          <div className="hidden lg:flex items-center gap-2.5">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className={`p-1.5 rounded-lg ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300'} transition-colors border border-transparent`}
                title={isSidebarCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            )}

            <div className={`h-4 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />

            <div className="flex items-center gap-2 text-sm">
              <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} font-medium`}>obeecreatives</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <div className={`flex items-center gap-1.5 font-bold ${isDarkMode ? 'text-white bg-slate-800/60 border-slate-700/50' : 'text-slate-900 bg-slate-100 border-slate-300/80'} border px-2.5 py-1 rounded-lg`}>
                {currentTabInfo.icon}
                <span>{currentTabInfo.title}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Theme Mode Toggle (Sun / Moon) */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-colors ${
              isDarkMode
                ? 'bg-slate-800/90 border-slate-700 text-amber-400 hover:bg-slate-700 hover:text-amber-300'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
            title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Fullscreen Native Toggle */}
          <button
            onClick={toggleFullscreen}
            className={`hidden sm:flex p-2 rounded-xl border transition-colors ${
              isDarkMode
                ? 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* PWA Install Button (HP & PC) */}
          <PWAInstallButton isDarkMode={isDarkMode} variant="navbar" />

          {/* Live Sync CRM & Database Staff Button */}
          {onSyncAll && (
            <div className="flex items-center">
              <button
                onClick={onSyncAll}
                disabled={isSyncing}
                className={`flex items-center gap-1.5 text-xs border ${
                  onOpenSyncModal ? 'rounded-l-xl border-r-0' : 'rounded-xl'
                } px-2.5 py-1.5 font-bold transition-all cursor-pointer ${
                  isSyncing
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : isDarkMode
                    ? 'bg-slate-800/90 border-slate-700 text-slate-200 hover:text-white hover:border-slate-600'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                }`}
                title="Tarik & Sinkronkan Data Terbaru dari Spreadsheet CRM dan Database Staff"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                <span className="hidden lg:inline">{isSyncing ? 'Menyinkronkan...' : 'Sync CRM & Staf'}</span>
              </button>
              {onOpenSyncModal && (
                <button
                  onClick={onOpenSyncModal}
                  className={`p-1.5 text-xs border rounded-r-xl transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-800/90 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title="Buka Pengaturan Link Spreadsheet CRM & Staff / Upload CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
          )}

          {/* 0.01s Instant Status Indicator */}
          <div className={`hidden xl:flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50' : 'text-emerald-700 bg-emerald-50 border-emerald-200'} border px-2.5 py-1.5 rounded-lg`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="font-mono font-medium text-[11px]">0.01s Instant</span>
          </div>

          {/* Work Mode / Presensi Status Badge */}
          <button
            onClick={onOpenWorkModeModal}
            className={`flex items-center gap-1 text-xs border p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl font-medium transition-all ${currentModeBadge.borderCls}`}
            title="Status Lokasi & Presensi Kerja"
          >
            {currentModeBadge.icon}
            <span className="hidden sm:inline font-semibold text-xs">{currentModeBadge.label}</span>
          </button>

          {/* User Profile Info Badge */}
          <button
            onClick={onOpenIdentityModal}
            className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'} border p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition-colors`}
            title="Klik untuk profil, ganti PIN, atau ubah mode kerja"
          >
            <div className="w-6 h-6 rounded-lg bg-red-600/30 border border-red-500/40 text-red-500 flex items-center justify-center text-[11px] font-bold shrink-0">
              {(currentUser?.name || identityName).charAt(0)}
            </div>
            <div className="text-left">
              <span className="font-semibold text-xs max-w-[80px] sm:max-w-[120px] truncate block leading-tight">
                {(currentUser?.name || identityName).split(' ')[0]}
              </span>
              <span className={`hidden sm:block text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} leading-tight mt-0.5`}>
                {roleConfig.label}
              </span>
            </div>
          </button>

          {/* RBAC Role Selector Badge */}
          <button
            onClick={onOpenRoleModal}
            className={`hidden md:flex items-center gap-1.5 text-xs border px-2.5 py-1.5 rounded-lg font-medium transition-all ${roleConfig.badgeColor}`}
            title="Peran RBAC"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-semibold text-xs">{roleConfig.label}</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`hidden md:flex p-2 ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-950/40' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'} rounded-lg transition-colors`}
            title="Keluar / Ganti Akun Staf"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
