import React, { useState, useEffect } from 'react';
import { ViewTab, ContentItem, UserRole, StatusType, RateCardItem, GeneralLink, StaffUser, WorkMode } from './types';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { liveSyncService } from './services/liveSyncService';
import { geoService } from './services/geoService';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { DashboardView } from './components/DashboardView';
import { ActivityLogView } from './components/ActivityLogView';
import { RateCardView } from './components/RateCardView';
import { HeadlessGasView } from './components/HeadlessGasView';
import { StaffDatabaseView } from './components/StaffDatabaseView';
import { AccessSettingsView } from './components/AccessSettingsView';
import { SyncModal } from './components/SyncModal';
import { ContentModal } from './components/ContentModal';
import { RoleSelectorModal } from './components/RoleSelectorModal';
import { GeneralLinksModal } from './components/GeneralLinksModal';
import { WorkModeModal } from './components/WorkModeModal';
import { ProfileModal } from './components/ProfileModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ROLES } from './data/seedData';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  CreditCard,
  Link2,
  Cpu,
  ShieldCheck,
  User,
  LogOut,
  Compass,
  Lock,
  RefreshCw,
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => authService.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<ViewTab>('board');
  const [items, setItems] = useState<ContentItem[]>(() => storageService.getContent());
  const [rates, setRates] = useState<RateCardItem[]>(() => storageService.getRateCards());
  const [links, setLinks] = useState<GeneralLink[]>(() => storageService.getGeneralLinks());
  const [activityLogs, setActivityLogs] = useState(() => storageService.getActivityLogs());
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const user = authService.getCurrentUser();
    return user ? user.role : storageService.getRole();
  });
  const [identityName, setIdentityName] = useState<string>(() => {
    const user = authService.getCurrentUser();
    return user ? user.name : storageService.getIdentity();
  });
  const [gasUrl, setGasUrl] = useState<string>(() => storageService.getGasUrl());

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pcs_theme_mode');
      return saved ? saved === 'dark' : true; // Default dark
    } catch {
      return true;
    }
  });

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pcs_theme_mode', next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  };

  // Modals state
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContentItem, setEditingContentItem] = useState<ContentItem | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [isWorkModeModalOpen, setIsWorkModeModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [currentWorkMode, setCurrentWorkMode] = useState<WorkMode>(() => geoService.getWorkMode());
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pcs_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pcs_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Content Operations (Optimistic UI 0.01s)
  const handleSaveContent = (itemData: Partial<ContentItem>) => {
    const res = storageService.saveContentItem(itemData);
    if (res.success) {
      setItems(storageService.getContent());
      setActivityLogs(storageService.getActivityLogs());
      addToast(
        itemData.ID ? 'Konten berhasil diperbarui' : 'Konten baru berhasil ditambahkan',
        'success'
      );
    }
  };

  const handleStatusChange = (id: string, newStatus: StatusType) => {
    const res = storageService.updateContentStatus(id, newStatus, activeRole, currentUser?.email);
    if (res.success) {
      setItems(storageService.getContent());
      setActivityLogs(storageService.getActivityLogs());
      addToast(`Status diubah ke "${newStatus}"`, 'success');
    } else {
      addToast(res.error || 'Gagal mengubah status', 'error');
    }
  };

  const handleToggleChecklist = (
    id: string,
    field: 'ChecklistAsset' | 'ChecklistCaption',
    value: boolean
  ) => {
    storageService.updateChecklist(id, field, value);
    setItems(storageService.getContent());
  };

  const handleDeleteContent = (id: string) => {
    if (window.confirm('Yakin ingin menghapus konten ini? Tindakan ini tidak dapat dibatalkan.')) {
      const res = storageService.deleteContentItem(id);
      if (res.success) {
        setItems(storageService.getContent());
        setActivityLogs(storageService.getActivityLogs());
        addToast('Konten berhasil dihapus', 'info');
      } else {
        addToast(res.error || 'Gagal menghapus konten', 'error');
      }
    }
  };

  const handleSaveRate = (rate: RateCardItem) => {
    storageService.saveRateCard(rate);
    setRates(storageService.getRateCards());
    addToast(`Rate untuk "${rate.JenisKonten}" diperbarui`, 'success');
  };

  const handleSaveLink = (link: Partial<GeneralLink>) => {
    storageService.saveGeneralLink(link);
    setLinks(storageService.getGeneralLinks());
    addToast('Link berhasil disimpan', 'success');
  };

  const handleDeleteLink = (id: string) => {
    storageService.deleteGeneralLink(id);
    setLinks(storageService.getGeneralLinks());
    addToast('Link berhasil dihapus', 'info');
  };

  const isDevOrEngineer = (role: UserRole) => ['project_manager', 'site_engineer', 'web_developer'].includes(role);

  const handleSelectRole = (role: UserRole) => {
    storageService.setRole(role);
    setActiveRole(role);
    if (!isDevOrEngineer(role) && currentTab === 'headless_gas') {
      setCurrentTab('board');
    }
    addToast(`Peran diganti ke: ${ROLES[role].title}`, 'info');
  };

  const [isGlobalSyncing, setIsGlobalSyncing] = useState(false);

  const handleSyncAllData = async () => {
    const crmUrl = liveSyncService.getCrmGasUrl();
    const staffUrl = liveSyncService.getStaffGasUrl();

    // If neither URL is configured yet, open SyncModal directly
    if (!crmUrl && !staffUrl) {
      setIsSyncModalOpen(true);
      addToast('Masukkan link Google Spreadsheet CRM & Staf atau upload CSV untuk sinkronisasi.', 'info');
      return;
    }

    setIsGlobalSyncing(true);
    addToast('Menghubungkan ke Spreadsheet CRM & Database Staff...', 'info');

    try {
      const stats = await liveSyncService.syncAll();
      setItems(storageService.getContent());
      setActivityLogs(storageService.getActivityLogs());

      if (stats.success) {
        addToast(stats.message, 'success');
      } else {
        setIsSyncModalOpen(true);
        addToast(stats.message, 'info');
      }
    } catch (err: any) {
      setIsSyncModalOpen(true);
      addToast(err?.message || 'Gagal sinkronisasi data', 'error');
    } finally {
      setIsGlobalSyncing(false);
    }
  };

  const handleUpdateGasUrl = (url: string) => {
    storageService.setGasUrl(url);
    setGasUrl(url);
    addToast('URL Google Apps Script disimpan', 'success');
  };

  const handleResetData = () => {
    storageService.resetToDefaultSeed();
    setItems(storageService.getContent());
    setRates(storageService.getRateCards());
    setLinks(storageService.getGeneralLinks());
    setActivityLogs(storageService.getActivityLogs());
    addToast('Data berhasil direset ke seed produksi awal (46 item)', 'info');
  };

  const handleLoginSuccess = (user: StaffUser) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    setIdentityName(user.name);
    storageService.setRole(user.role);
    storageService.setIdentity(user.name);
    if (!isDevOrEngineer(user.role) && currentTab === 'headless_gas') {
      setCurrentTab('board');
    }
    addToast(`Selamat datang, ${user.name}! (${user.jabatan})`, 'success');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    addToast('Anda telah keluar dari sesi', 'info');
  };

  const handleOpenEditModal = (item: ContentItem) => {
    setEditingContentItem(item);
    setIsContentModalOpen(true);
  };

  const handleOpenNewContentModal = () => {
    setEditingContentItem(null);
    setIsContentModalOpen(true);
  };

  // If not logged in, show LoginScreen
  if (!currentUser) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />
        {/* Floating Toast Notification Container */}
        <div className="fixed top-6 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl text-xs font-semibold backdrop-blur-md transition-all ${
                toast.type === 'success'
                  ? 'bg-emerald-950/95 border-emerald-800 text-emerald-200'
                  : toast.type === 'error'
                  ? 'bg-red-950/95 border-red-800 text-red-200'
                  : 'bg-blue-950/95 border-blue-800 text-blue-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : toast.type === 'info' ? (
                  <Info className="w-4 h-4 text-blue-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const roleConfig = ROLES[activeRole] || ROLES.project_manager;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#f8fafc] text-slate-900'} flex antialiased selection:bg-red-500 selection:text-white pb-20 lg:pb-0 transition-colors`}>
      {/* Collapsible Sidebar for Desktop */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        activeRole={activeRole}
        onOpenLinksModal={() => setIsLinksModalOpen(true)}
        onOpenNewContentModal={handleOpenNewContentModal}
        isDarkMode={isDarkMode}
      />

      {/* Main Workspace Area (Top Navbar + Content Viewport) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden">
        {/* Top Navbar Header */}
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activeRole={activeRole}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
          identityName={identityName}
          onOpenIdentityModal={() => setIsIdentityModalOpen(true)}
          onOpenNewContentModal={handleOpenNewContentModal}
          onOpenLinksModal={() => setIsLinksModalOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenWorkModeModal={() => setIsWorkModeModalOpen(true)}
          currentWorkMode={currentWorkMode}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onSyncAll={handleSyncAllData}
          isSyncing={isGlobalSyncing}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
        />

        {/* Main Viewport Container */}
        <main className="flex-1 w-full max-w-full px-2.5 sm:px-6 py-4 sm:py-6 overflow-x-hidden">
          {currentTab === 'board' && (
            <KanbanBoard
              items={items}
              activeRole={activeRole}
              onEditItem={handleOpenEditModal}
              onDeleteItem={handleDeleteContent}
              onStatusChange={handleStatusChange}
              onToggleChecklist={handleToggleChecklist}
              onOpenNewContentModal={handleOpenNewContentModal}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              items={items}
              activeRole={activeRole}
              onEditItem={handleOpenEditModal}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === 'dashboard' && (
            <DashboardView
              items={items}
              activeRole={activeRole}
              onOpenWorkModeModal={() => setIsWorkModeModalOpen(true)}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === 'activity' && (
            <ActivityLogView
              logs={activityLogs}
              onRefresh={() => setActivityLogs(storageService.getActivityLogs())}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === 'staff_database' && (
            <StaffDatabaseView
              contentItems={items}
              activeRole={activeRole}
              onRefreshData={() => {
                setItems(storageService.getContent());
              }}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === 'ratecard' && (
            roleConfig.canEditRateCard ? (
              <RateCardView
                rates={rates}
                onSaveRate={handleSaveRate}
                activeRole={activeRole}
                isDarkMode={isDarkMode}
              />
            ) : (
              <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-8 text-center max-w-md mx-auto my-12 shadow-xl`}>
                <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/40 text-red-500 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Akses Rate Card Dibatasi</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Standar upah Rate Card hanya dapat diakses dan dikelola oleh <b>Admin (Project Manager)</b> dan <b>Site Engineer</b>.
                </p>
                <button
                  onClick={() => setCurrentTab('board')}
                  className={`mt-5 px-4 py-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'} text-xs font-semibold rounded-xl border transition-colors cursor-pointer`}
                >
                  Kembali ke Content Board
                </button>
              </div>
            )
          )}

          {currentTab === 'headless_gas' && (
            isDevOrEngineer(activeRole) ? (
              <HeadlessGasView
                gasUrl={gasUrl}
                onUpdateGasUrl={handleUpdateGasUrl}
                onResetData={handleResetData}
                onSyncSuccess={(count) => {
                  setItems(storageService.getContent());
                  setRates(storageService.getRateCards());
                  setActivityLogs(storageService.getActivityLogs());
                  addToast(`${count} data konten & tarif Rate Card berhasil disinkronkan!`, 'success');
                }}
                isDarkMode={isDarkMode}
              />
            ) : (
              <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-8 text-center max-w-md mx-auto my-12 shadow-xl`}>
                <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-800/40 text-amber-500 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Akses Headless GAS Dibatasi</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Konfigurasi teknis Headless Google Apps Script hanya dapat diakses oleh <b>Admin (PM)</b> dan <b>Site Engineer</b>.
                </p>
                <button
                  onClick={() => setCurrentTab('board')}
                  className={`mt-5 px-4 py-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'} text-xs font-semibold rounded-xl border transition-colors cursor-pointer`}
                >
                  Kembali ke Content Board
                </button>
              </div>
            )
          )}
          {currentTab === 'access_settings' && (
            <AccessSettingsView
              currentUser={currentUser}
              activeRole={activeRole}
              isDarkMode={isDarkMode}
              onRefreshDirectory={() => {
                // Keep directory in sync
              }}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenMoreMenu={() => setIsMobileMoreOpen(true)}
        isDarkMode={isDarkMode}
      />

      {/* Mobile "More" Drawer / Sheet */}
      {isMobileMoreOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/75 backdrop-blur-sm lg:hidden">
          <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} border-t w-full rounded-t-3xl p-6 flex flex-col gap-3 shadow-2xl`}>
            <div className="w-12 h-1.5 bg-slate-500/40 rounded-full mx-auto mb-2" />
            <div className={`flex items-center justify-between pb-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Menu Lainnya</span>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {roleConfig.canEditRateCard && (
                <button
                  onClick={() => {
                    setCurrentTab('staff_database');
                    setIsMobileMoreOpen(false);
                  }}
                  className={`flex items-center gap-2 p-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'} border rounded-xl text-left font-semibold cursor-pointer`}
                >
                  <User className="w-4 h-4 text-sky-500" />
                  <span>Database Staf</span>
                </button>
              )}

              {roleConfig.canEditRateCard && (
                <button
                  onClick={() => {
                    setCurrentTab('ratecard');
                    setIsMobileMoreOpen(false);
                  }}
                  className={`flex items-center gap-2 p-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'} border rounded-xl text-left font-semibold cursor-pointer`}
                >
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  <span>Rate Card</span>
                </button>
              )}

              {(['project_manager', 'site_engineer', 'web_developer', 'admin'].includes(activeRole) || roleConfig.canEditRateCard) && (
                <button
                  onClick={() => {
                    setCurrentTab('access_settings');
                    setIsMobileMoreOpen(false);
                  }}
                  className={`flex items-center gap-2 p-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'} border rounded-xl text-left font-semibold cursor-pointer`}
                >
                  <ShieldCheck className="w-4 h-4 text-red-500" />
                  <span>Pengaturan Akses</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsLinksModalOpen(true);
                  setIsMobileMoreOpen(false);
                }}
                className={`flex items-center gap-2 p-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'} border rounded-xl text-left font-semibold cursor-pointer`}
              >
                <Link2 className="w-4 h-4 text-sky-500" />
                <span>Link Utama</span>
              </button>

              {isDevOrEngineer(activeRole) && (
                <button
                  onClick={() => {
                    setCurrentTab('headless_gas');
                    setIsMobileMoreOpen(false);
                  }}
                  className={`flex items-center gap-2 p-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'} border rounded-xl text-left font-semibold cursor-pointer`}
                >
                  <Cpu className="w-4 h-4 text-emerald-500" />
                  <span>Headless GAS</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsSyncModalOpen(true);
                  setIsMobileMoreOpen(false);
                }}
                className={`flex items-center gap-2 p-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'} border rounded-xl text-left font-semibold cursor-pointer`}
              >
                <RefreshCw className="w-4 h-4 text-amber-500" />
                <span>Sync Spreadsheet</span>
              </button>

              <PWAInstallButton variant="drawer" isDarkMode={isDarkMode} />

              <button
                onClick={() => {
                  setIsRoleModalOpen(true);
                  setIsMobileMoreOpen(false);
                }}
                className={`flex items-center gap-2 p-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'} border rounded-xl text-left font-semibold cursor-pointer`}
              >
                <ShieldCheck className="w-4 h-4 text-red-500" />
                <span>Ubah Peran RBAC</span>
              </button>

              <button
                onClick={() => {
                  setIsWorkModeModalOpen(true);
                  setIsMobileMoreOpen(false);
                }}
                className={`col-span-2 flex items-center gap-2 p-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'} border rounded-xl text-left font-semibold cursor-pointer`}
              >
                <Compass className="w-4 h-4 text-emerald-500" />
                <span>Mode Lokasi & Presensi ({currentWorkMode})</span>
              </button>

              <button
                onClick={() => {
                  setIsIdentityModalOpen(true);
                  setIsMobileMoreOpen(false);
                }}
                className={`col-span-2 flex items-center gap-2 p-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'} border rounded-xl text-left font-semibold cursor-pointer`}
              >
                <User className="w-4 h-4 text-amber-500" />
                <span>Profil & Keamanan PIN ({identityName})</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMoreOpen(false);
                  handleLogout();
                }}
                className="col-span-2 flex items-center justify-center gap-2 p-3 bg-red-950/40 border border-red-900/60 rounded-xl hover:bg-red-900/50 text-red-400 font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar / Ganti Akun Staf</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Add/Edit Modal */}
      <ContentModal
        isOpen={isContentModalOpen}
        onClose={() => {
          setIsContentModalOpen(false);
          setEditingContentItem(null);
        }}
        onSave={handleSaveContent}
        editingItem={editingContentItem}
        activeRole={activeRole}
        defaultCreator={identityName}
        isDarkMode={isDarkMode}
        currentUser={currentUser}
        onCommentsUpdated={() => {
          setItems(storageService.getContent());
          setActivityLogs(storageService.getActivityLogs());
        }}
      />

      {/* Role Selector Modal */}
      <RoleSelectorModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        activeRole={activeRole}
        onSelectRole={handleSelectRole}
        isDarkMode={isDarkMode}
      />

      {/* Profile & PIN Security Modal */}
      <ProfileModal
        isOpen={isIdentityModalOpen}
        onClose={() => setIsIdentityModalOpen(false)}
        currentUser={currentUser}
        activeRole={activeRole}
        onSelectRole={handleSelectRole}
        currentWorkMode={currentWorkMode}
        onWorkModeChange={(mode) => {
          setCurrentWorkMode(mode);
          addToast(`Status lokasi: ${geoService.formatModeLabel(mode)}`, 'success');
        }}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
      />

      {/* General Links Modal */}
      <GeneralLinksModal
        isOpen={isLinksModalOpen}
        onClose={() => setIsLinksModalOpen(false)}
        links={links}
        onSaveLink={handleSaveLink}
        onDeleteLink={handleDeleteLink}
        activeRole={activeRole}
        isDarkMode={isDarkMode}
      />

      {/* Work Mode & Presence Modal */}
      <WorkModeModal
        isOpen={isWorkModeModalOpen}
        onClose={() => setIsWorkModeModalOpen(false)}
        currentUser={currentUser}
        onModeChanged={(mode) => {
          setCurrentWorkMode(mode);
          addToast(`Status lokasi diset: ${geoService.formatModeLabel(mode)}`, 'success');
        }}
        isDarkMode={isDarkMode}
      />

      {/* Spreadsheet Sync Hub Modal (CRM & Staff) */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncComplete={(msg) => {
          setItems(storageService.getContent());
          setActivityLogs(storageService.getActivityLogs());
          addToast(msg, 'success');
        }}
        isDarkMode={isDarkMode}
      />

      {/* Floating Toast Notification Container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl text-xs font-semibold backdrop-blur-md transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-800 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-red-950/95 border-red-800 text-red-200'
                : 'bg-blue-950/95 border-blue-800 text-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export { App };
