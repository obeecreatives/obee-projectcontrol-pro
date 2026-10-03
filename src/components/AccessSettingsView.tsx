import React, { useState, useMemo } from 'react';
import { StaffUser, UserRole, SecurityLogItem, DefaultPasswordConfig } from '../types';
import { authService, DEVELOPER_STANDARD_DEFAULT_PASSWORDS } from '../services/authService';
import { ROLES, FULL_ACCESS_EMAILS } from '../data/seedData';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  UserPlus,
  Users,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
  Trash2,
  Edit2,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  Shield,
  Send,
  Sliders,
} from 'lucide-react';

interface AccessSettingsViewProps {
  currentUser: StaffUser | null;
  activeRole: UserRole;
  isDarkMode?: boolean;
  onRefreshDirectory?: () => void;
}

export const AccessSettingsView: React.FC<AccessSettingsViewProps> = ({
  currentUser,
  activeRole,
  isDarkMode = true,
  onRefreshDirectory,
}) => {
  const [subTab, setSubTab] = useState<'roles' | 'whitelist' | 'passwords' | 'self_service' | 'logs'>('roles');
  const [directory, setDirectory] = useState<StaffUser[]>(() => authService.getDirectory());
  const [roleChangeFeedback, setRoleChangeFeedback] = useState<string | null>(null);
  const [defaultPasswords, setDefaultPasswords] = useState<DefaultPasswordConfig>(() =>
    authService.getDefaultPasswordConfig()
  );
  const [securityLogs, setSecurityLogs] = useState<SecurityLogItem[]>(() => authService.getSecurityLogs());

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const handleRoleChange = (email: string, newRole: UserRole) => {
    const res = authService.updateUserRole(email, newRole, currentUser?.email || 'Admin');
    if (res.success) {
      refreshAll();
      setRoleChangeFeedback(`Peran akun "${email}" berhasil diubah menjadi "${ROLES[newRole]?.title || newRole}".`);
      setTimeout(() => setRoleChangeFeedback(null), 3500);
    } else {
      alert(res.error || 'Gagal mengubah peran.');
    }
  };

  // New Whitelist Registration Form State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('admin');
  const [newDivisi, setNewDivisi] = useState('Manajemen');
  const [newJabatan, setNewJabatan] = useState('Admin Kurator Konten');
  const [useDefaultPassword, setUseDefaultPassword] = useState(true);
  const [customPassword, setCustomPassword] = useState('');
  const [registrationFeedback, setRegistrationFeedback] = useState<{
    success: boolean;
    message: string;
    credentials?: { name: string; email: string; role: string; password: string };
  } | null>(null);

  // Success Credential Modal
  const [credentialModalData, setCredentialModalData] = useState<{
    name: string;
    email: string;
    role: string;
    password: string;
  } | null>(null);
  const [copiedCredential, setCopiedCredential] = useState(false);

  // Reset / Change Password Modal for specific staff
  const [targetStaff, setTargetStaff] = useState<StaffUser | null>(null);
  const [targetNewPassword, setTargetNewPassword] = useState('');
  const [resetModalMessage, setResetModalMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Self-Service Password Change State
  const [selfOldPassword, setSelfOldPassword] = useState('');
  const [selfNewPassword, setSelfNewPassword] = useState('');
  const [selfConfirmPassword, setSelfConfirmPassword] = useState('');
  const [selfShowPassword, setSelfShowPassword] = useState(false);
  const [selfFeedback, setSelfFeedback] = useState<{ success: boolean; text: string } | null>(null);

  // Default Passwords Config State
  const [editAdminDefault, setEditAdminDefault] = useState(defaultPasswords.adminDefault);
  const [editStaffDefault, setEditStaffDefault] = useState(defaultPasswords.staffDefault);
  const [defaultPassFeedback, setDefaultPassFeedback] = useState<string | null>(null);

  // Peeking Password State
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  const toggleRevealPassword = (email: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [email]: !prev[email] }));
  };

  const refreshAll = () => {
    setDirectory(authService.getDirectory());
    setDefaultPasswords(authService.getDefaultPasswordConfig());
    setSecurityLogs(authService.getSecurityLogs());
    if (onRefreshDirectory) onRefreshDirectory();
  };

  // Filtered Whitelist
  const filteredDirectory = useMemo(() => {
    return directory.filter((user) => {
      if (roleFilter !== 'ALL' && user.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = user.name.toLowerCase().includes(q);
        const matchEmail = user.email.toLowerCase().includes(q);
        const matchJabatan = (user.jabatan || '').toLowerCase().includes(q);
        return matchName || matchEmail || matchJabatan;
      }
      return true;
    });
  }, [directory, roleFilter, searchQuery]);

  // Summary counts
  const stats = useMemo(() => {
    const total = directory.length;
    const fullAccess = directory.filter((u) =>
      FULL_ACCESS_EMAILS.includes(u.email.toLowerCase()) ||
      u.role === 'project_manager' ||
      u.role === 'web_developer'
    ).length;
    const admins = directory.filter((u) => u.role === 'admin').length;
    const creators = directory.filter((u) => u.role === 'staff_creator' || u.role === 'vendor_lapangan').length;
    return { total, fullAccess, admins, creators };
  }, [directory]);

  // Handle Register New User to Whitelist
  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationFeedback(null);

    if (!newEmail.trim() || !newName.trim()) {
      setRegistrationFeedback({
        success: false,
        message: 'Email dan Nama Lengkap wajib diisi.',
      });
      return;
    }

    if (!newEmail.includes('@')) {
      setRegistrationFeedback({
        success: false,
        message: 'Format email tidak valid. Gunakan email Gmail atau email resmi.',
      });
      return;
    }

    if (!useDefaultPassword && customPassword.trim().length < 4) {
      setRegistrationFeedback({
        success: false,
        message: 'Password kustom minimal terdiri dari 4 karakter/digit.',
      });
      return;
    }

    const isAdminRole = ['project_manager', 'web_developer', 'admin', 'site_engineer'].includes(newRole);

    const newUser: StaffUser = {
      id: 'stf-' + Math.random().toString(36).substring(2, 8),
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      divisi: newDivisi.trim() || 'Manajemen',
      jabatan: newJabatan.trim() || 'Staff',
      role: newRole,
      statusKerja: 'Aktif',
      isAdmin: isAdminRole,
      baseRate: isAdminRole ? 40000 : 30000,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const assignedPassword = useDefaultPassword ? undefined : customPassword.trim();
    const res = authService.registerWhitelistUser(newUser, assignedPassword, currentUser?.email || 'Admin');

    if (res.success && res.initialPassword) {
      refreshAll();
      setIsRegisterModalOpen(false);

      // Open credentials card modal
      setCredentialModalData({
        name: newUser.name,
        email: newUser.email,
        role: ROLES[newUser.role]?.title || newUser.role,
        password: res.initialPassword,
      });

      // Reset form fields
      setNewEmail('');
      setNewName('');
      setCustomPassword('');
      setUseDefaultPassword(true);
    } else {
      setRegistrationFeedback({
        success: false,
        message: res.error || 'Gagal mendaftarkan user ke whitelist.',
      });
    }
  };

  // Copy Credential Text
  const handleCopyCredentials = () => {
    if (!credentialModalData) return;
    const text = `🔐 KREDENSIAL AKSES WORKSPACE OS - obeecreatives
--------------------------------------------------
👤 Nama      : ${credentialModalData.name}
📧 Email     : ${credentialModalData.email}
🛡️ Peran     : ${credentialModalData.role}
🔑 Password  : ${credentialModalData.password}
--------------------------------------------------
ℹ️ Masuk ke sistem dengan email & password di atas.
💡 Anda dapat mengganti password mandiri kapan saja di Profil / Pengaturan Akses.`;

    navigator.clipboard.writeText(text);
    setCopiedCredential(true);
    setTimeout(() => setCopiedCredential(false), 3000);
  };

  // Handle Quick Reset to Default Password for a staff member
  const handleResetToDefault = (user: StaffUser) => {
    const isTargetAdmin = user.isAdmin || ['project_manager', 'web_developer', 'admin'].includes(user.role);
    const expectedDefault = isTargetAdmin ? defaultPasswords.adminDefault : defaultPasswords.staffDefault;

    if (
      window.confirm(
        `Reset password akun "${user.email}" ke Password Default Awal (${expectedDefault})?`
      )
    ) {
      const res = authService.adminResetPin(currentUser?.email || 'admin', user.email);
      if (res.success) {
        refreshAll();
        alert(`Password akun ${user.email} berhasil di-reset ke standar: "${res.newPassword}"`);
      } else {
        alert(res.error || 'Gagal mereset password.');
      }
    }
  };

  // Handle Custom Password assignment modal
  const handleSaveCustomPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStaff) return;
    if (targetNewPassword.trim().length < 4) {
      setResetModalMessage({ success: false, text: 'Password minimal 4 karakter/digit.' });
      return;
    }

    const res = authService.adminResetPin(
      currentUser?.email || 'admin',
      targetStaff.email,
      targetNewPassword.trim()
    );
    if (res.success) {
      refreshAll();
      setResetModalMessage({ success: true, text: `Password berhasil diubah ke: "${targetNewPassword.trim()}"` });
      setTimeout(() => {
        setTargetStaff(null);
        setTargetNewPassword('');
        setResetModalMessage(null);
      }, 1500);
    } else {
      setResetModalMessage({ success: false, text: res.error || 'Gagal mengubah password.' });
    }
  };

  // Handle Delete from Whitelist
  const handleDeleteFromWhitelist = (user: StaffUser) => {
    if (FULL_ACCESS_EMAILS.includes(user.email.toLowerCase())) {
      alert(`Akun "${user.email}" adalah akun Super Admin / Developer terproteksi dan tidak boleh dihapus.`);
      return;
    }

    if (window.confirm(`Hapus akun "${user.name}" (${user.email}) dari Whitelist sistem? Akun ini tidak akan dapat login lagi.`)) {
      const res = authService.removeWhitelistUser(user.email, currentUser?.email || 'Admin');
      if (res.success) {
        refreshAll();
      } else {
        alert(res.error || 'Gagal menghapus user dari whitelist.');
      }
    }
  };

  // Handle Self-Service Password Change
  const handleSelfPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setSelfFeedback(null);

    if (!currentUser) {
      setSelfFeedback({ success: false, text: 'Sesi akun tidak aktif. Silakan masuk kembali.' });
      return;
    }

    if (!selfOldPassword.trim() || !selfNewPassword.trim()) {
      setSelfFeedback({ success: false, text: 'Password lama dan password baru wajib diisi.' });
      return;
    }

    if (selfNewPassword !== selfConfirmPassword) {
      setSelfFeedback({ success: false, text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    if (selfNewPassword.trim().length < 4) {
      setSelfFeedback({ success: false, text: 'Password baru minimal harus 4 karakter/digit.' });
      return;
    }

    const res = authService.changePin(currentUser.email, selfOldPassword, selfNewPassword);
    if (res.success) {
      refreshAll();
      setSelfFeedback({ success: true, text: 'Password akun Anda berhasil diperbarui dan aktif langsung!' });
      setSelfOldPassword('');
      setSelfNewPassword('');
      setSelfConfirmPassword('');
    } else {
      setSelfFeedback({ success: false, text: res.error || 'Gagal memperbarui password.' });
    }
  };

  // Handle Save Default Password Config
  const handleSaveDefaultPasswords = (e: React.FormEvent) => {
    e.preventDefault();
    if (editAdminDefault.trim().length < 4 || editStaffDefault.trim().length < 4) {
      setDefaultPassFeedback('Password default minimal harus 4 karakter.');
      return;
    }

    authService.updateDefaultPasswordConfig(
      { adminDefault: editAdminDefault.trim(), staffDefault: editStaffDefault.trim() },
      currentUser?.email || 'Developer'
    );
    refreshAll();
    setDefaultPassFeedback('Standar password default berhasil diperbarui untuk seluruh pendaftaran baru!');
    setTimeout(() => setDefaultPassFeedback(null), 3500);
  };

  // Reset to Developer Standard Default Passwords
  const handleResetToDeveloperStandards = () => {
    if (window.confirm('Kembalikan konfigurasi password default ke standar resmi developer (Admin: 8888, Staf: 1234)?')) {
      const std = authService.resetToDeveloperStandardPasswords(currentUser?.email || 'Developer');
      setEditAdminDefault(std.adminDefault);
      setEditStaffDefault(std.staffDefault);
      refreshAll();
      setDefaultPassFeedback('Konfigurasi berhasil dikembalikan ke Standar Developer (8888 & 1234)!');
      setTimeout(() => setDefaultPassFeedback(null), 3500);
    }
  };

  return (
    <div className={`space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200`}>
      {/* 2-Layer Security Status Banner */}
      <div className={`relative overflow-hidden rounded-3xl border p-6 sm:p-7 shadow-xl ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#0b1329] border-slate-800'
          : 'bg-gradient-to-br from-white via-slate-50 to-slate-100 border-slate-200'
      }`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AKTIF SEPENUHNYA &bull; 2-LAYER SECURITY PROTOCOL</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 uppercase tracking-wider">
                RBAC & Whitelist Enforced
              </span>
            </div>

            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Pengaturan Akses & Keamanan Sistem
            </h2>

            <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <b>Konsep Keamanan 2 Lapis:</b> <i>Lapis 1</i> Whitelist Email terverifikasi &bull; <i>Lapis 2</i> Password Standar Developer (atau Default Umum) otomatis + Fitur Ganti Password Mandiri.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3 bg-[#E30000] hover:bg-[#c00000] text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftarkan Email Baru</span>
            </button>
            <button
              onClick={refreshAll}
              className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:text-black'
              }`}
              title="Segarkan Data Keamanan"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/50">
          <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
            <div className="text-[11px] text-slate-400 font-medium">Whitelist Terdaftar</div>
            <div className={`text-xl font-black mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {stats.total} Akun
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>100% Terverifikasi</span>
            </div>
          </div>

          <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
            <div className="text-[11px] text-slate-400 font-medium">Full Access (PM & Dev)</div>
            <div className="text-xl font-black mt-0.5 text-red-500">
              {stats.fullAccess} Akun
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              loehendra &bull; obeetools &bull; obeecreatives
            </div>
          </div>

          <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
            <div className="text-[11px] text-slate-400 font-medium">Admin & Kurator</div>
            <div className="text-xl font-black mt-0.5 text-amber-500">
              {stats.admins} Akun
            </div>
            <div className="text-[10px] text-amber-400/90 mt-1 font-medium">
              Hak Approved/RtP & Kunci Fee
            </div>
          </div>

          <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
            <div className="text-[11px] text-slate-400 font-medium">Password Default Awal</div>
            <div className="text-sm font-mono font-bold mt-1 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                Admin: {defaultPasswords.adminDefault}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Staf: {defaultPasswords.staffDefault}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Otomatis saat pendaftaran</div>
          </div>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className={`flex items-center gap-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-2 text-xs font-semibold overflow-x-auto`}>
        <button
          onClick={() => setSubTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'roles'
              ? 'bg-[#E30000] text-white shadow-md shadow-red-950/40 font-bold'
              : isDarkMode
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Matriks & Pengaturan Izin Peran</span>
        </button>

        <button
          onClick={() => setSubTab('whitelist')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'whitelist'
              ? 'bg-[#E30000] text-white shadow-md shadow-red-950/40 font-bold'
              : isDarkMode
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Whitelist Akun ({filteredDirectory.length})</span>
        </button>

        <button
          onClick={() => setSubTab('passwords')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'passwords'
              ? 'bg-[#E30000] text-white shadow-md shadow-red-950/40 font-bold'
              : isDarkMode
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Konfigurasi Password Default Standar</span>
        </button>

        <button
          onClick={() => setSubTab('self_service')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'self_service'
              ? 'bg-[#E30000] text-white shadow-md shadow-red-950/40 font-bold'
              : isDarkMode
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Ganti Password Mandiri ({currentUser?.email || 'Akun Anda'})</span>
        </button>

        <button
          onClick={() => setSubTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'logs'
              ? 'bg-[#E30000] text-white shadow-md shadow-red-950/40 font-bold'
              : isDarkMode
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Log Audit Keamanan ({securityLogs.length})</span>
        </button>
      </div>

      {/* Role Change Feedback Banner */}
      {roleChangeFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{roleChangeFeedback}</span>
          </div>
          <button
            onClick={() => setRoleChangeFeedback(null)}
            className="text-emerald-400 hover:text-white p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Subtab 0: Role Settings & Permission Matrix */}
      {subTab === 'roles' && (
        <div className="space-y-6">
          {/* Section 1: Role Overview Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  1. Matriks Hak Akses & Izin Peran Sistem (RBAC)
                </h3>
                <p className="text-xs text-slate-400">
                  Ringkasan kapabilitas hak alur kerja Kanban, kunci tarif, dan kewenangan setiap peran.
                </p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-lg border font-mono font-bold ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}>
                {Object.keys(ROLES).length} Peran Terkonfigurasi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(ROLES).map(([roleKey, role]) => {
                const countMembers = directory.filter((u) => u.role === roleKey).length;

                return (
                  <div
                    key={roleKey}
                    className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                      isDarkMode
                        ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${role.badgeColor}`}>
                          {role.label}
                        </span>
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                          isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {countMembers} Staf
                        </span>
                      </div>

                      <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-1`}>
                        {role.title}
                      </h4>

                      <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-[40px]">
                        {role.description}
                      </p>

                      <div className="space-y-1.5 pt-3 border-t border-slate-700/50 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Alur Geser Bebas:</span>
                          <span className={role.canChangeStatusToAll ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {role.canChangeStatusToAll ? '✅ Bebas Semua' : 'Draft -> Req Approval'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Approval ke RtP:</span>
                          <span className={role.canApproveToRtP ? 'text-emerald-400 font-bold' : 'text-red-400 font-semibold'}>
                            {role.canApproveToRtP ? '✅ Berhak Kunci Fee' : '❌ Dilarang (Reviewer Only)'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Edit Rate Card:</span>
                          <span className={role.canEditRateCard ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {role.canEditRateCard ? '✅ Ya' : '❌ Tidak'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Lihat Fee / Omzet:</span>
                          <span className={role.showInternalFee ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {role.showInternalFee ? '✅ Ya' : '❌ Disembunyikan'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Hapus Konten:</span>
                          <span className={role.canDelete ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {role.canDelete ? '✅ Ya' : '❌ Tidak'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Interactive Role Assignment Table */}
          <div className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          } shadow-lg space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  2. Kelola Penugasan Peran Staf
                </h3>
                <p className="text-xs text-slate-400">
                  Ubah hak peran staf secara langsung dengan memilih peran dari dropdown. Perubahan langsung tersimpan ke sistem.
                </p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari staf..."
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-red-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <tr>
                    <th className="py-3 px-4">Nama Staf & Email</th>
                    <th className="py-3 px-4">Divisi & Jabatan</th>
                    <th className="py-3 px-4">Peran Saat Ini</th>
                    <th className="py-3 px-4">Ubah Hak Peran (Dropdown Cepat)</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                  {filteredDirectory.map((staff) => (
                    <tr key={staff.email} className={`${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'} transition-colors`}>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">{staff.name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{staff.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-300">{staff.divisi || '-'}</div>
                        <div className="text-[11px] text-slate-400">{staff.jabatan || '-'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          ROLES[staff.role]?.badgeColor || 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}>
                          {ROLES[staff.role]?.title || staff.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={staff.role}
                          onChange={(e) => handleRoleChange(staff.email, e.target.value as UserRole)}
                          className={`px-3 py-1.5 text-xs rounded-xl border font-bold cursor-pointer transition-colors focus:outline-none focus:border-red-500 ${
                            isDarkMode
                              ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                              : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <option value="project_manager">Project Manager / Site Engineer</option>
                          <option value="admin">Admin</option>
                          <option value="web_developer">Web Developer</option>
                          <option value="staff_creator">Staff / Creator / Freelancer</option>
                          <option value="site_engineer">Site Engineer</option>
                          <option value="vendor_lapangan">Vendor Lapangan</option>
                          <option value="client">Client Portal</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 1: Whitelist Management */}
      {subTab === 'whitelist' && (
        <div className="space-y-4">
          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, email, atau jabatan..."
                className={`w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-red-500 transition-colors ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={`px-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-red-500 font-medium ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="ALL">Semua Peran ({directory.length})</option>
                <option value="project_manager">PM / Site Engineer (Full Access)</option>
                <option value="web_developer">Web Developer (Full Access)</option>
                <option value="admin">Admin / Kurator (Review & Approve)</option>
                <option value="staff_creator">Staff / Creator (Draft & RtP)</option>
                <option value="client">Client (Read Only)</option>
              </select>

              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-4 py-2.5 bg-[#E30000] hover:bg-[#c00000] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-950/30"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Daftarkan Whitelist</span>
              </button>
            </div>
          </div>

          {/* Whitelist Cards / Table */}
          <div className={`border rounded-2xl overflow-hidden shadow-lg ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <tr>
                    <th className="py-3.5 px-4">Nama & Email Terverifikasi</th>
                    <th className="py-3.5 px-4">Peran & Hak Alur Kanban</th>
                    <th className="py-3.5 px-4">Password / PIN</th>
                    <th className="py-3.5 px-4">Status & Divisi</th>
                    <th className="py-3.5 px-4 text-right">Aksi Keamanan</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {filteredDirectory.map((user) => {
                    const isProtected = FULL_ACCESS_EMAILS.includes(user.email.toLowerCase());
                    const currentPin = authService.getStaffPin(user.email);
                    const isRevealed = !!revealedPasswords[user.email];
                    const roleCfg = ROLES[user.role] || ROLES.staff_creator;

                    return (
                      <tr key={user.email} className={`hover:bg-slate-500/5 transition-colors`}>
                        {/* Name & Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isProtected
                                ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                                : user.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                            }`}>
                              {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                  {user.name}
                                </span>
                                {isProtected && (
                                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                                    PROTECTED SUPER
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span>{user.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role & Kanban Rule */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleCfg.badgeColor}`}>
                              {roleCfg.title}
                            </span>
                            <div className="text-[10px] text-slate-400 leading-tight">
                              {roleCfg.isFullAccess ? (
                                <span className="text-red-400 font-medium">Full Akses Kanban & Fee</span>
                              ) : roleCfg.canApproveToRtP ? (
                                <span className="text-amber-400 font-medium">Bisa geser ke Approved / RtP & Penentu Fee</span>
                              ) : (
                                <span className="text-blue-400">Draft alur & geser post-RtP (Tak bisa ubah fee)</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Password / PIN Display */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <code className={`font-mono text-xs px-2 py-1 rounded border ${
                              isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
                            }`}>
                              {isRevealed ? currentPin : '••••••••'}
                            </code>
                            <button
                              onClick={() => toggleRevealPassword(user.email)}
                              className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer transition-colors"
                              title={isRevealed ? 'Sembunyikan Password' : 'Lihat Password'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(currentPin);
                                alert(`Password untuk ${user.email} disalin: "${currentPin}"`);
                              }}
                              className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                              title="Salin Password"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Division & Status */}
                        <td className="py-3.5 px-4">
                          <div className="text-[11px] font-semibold text-slate-300">{user.jabatan || 'Staff'}</div>
                          <div className="text-[10px] text-slate-400">{user.divisi || 'Studio'}</div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleResetToDefault(user)}
                              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                                isDarkMode
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                              }`}
                              title="Reset Password ke Standar Default Awal"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-400" />
                              <span>Reset Default</span>
                            </button>

                            <button
                              onClick={() => {
                                setTargetStaff(user);
                                setTargetNewPassword('');
                                setResetModalMessage(null);
                              }}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                isDarkMode
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                              }`}
                              title="Atur Password Baru Manual"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                            </button>

                            {!isProtected && (
                              <button
                                onClick={() => handleDeleteFromWhitelist(user)}
                                className={`p-1.5 rounded-lg border transition-all text-red-400 hover:text-red-300 hover:bg-red-950/40 border-red-900/40 cursor-pointer`}
                                title="Hapus dari Whitelist"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Default Passwords Configuration */}
      {subTab === 'passwords' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Standar Developer Password */}
          <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Standar Password Default Awal Developer
                  </h3>
                  <p className="text-xs text-slate-400">
                    Diberikan secara otomatis saat mendaftarkan akun Admin/Kurator & Staf baru.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveDefaultPasswords} className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-300">
                    Password Default: Admin, Kurator & Full Access
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-red-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={editAdminDefault}
                      onChange={(e) => setEditAdminDefault(e.target.value)}
                      placeholder="cth: 8888 / admin8888"
                      className={`w-full pl-9 pr-4 py-2.5 text-xs font-mono font-bold rounded-xl border focus:outline-none focus:border-red-500 ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Nilai bawaan developer: <code className="text-red-400 font-bold">8888</code>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-300">
                    Password Default: Staff Creator & Freelancer
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={editStaffDefault}
                      onChange={(e) => setEditStaffDefault(e.target.value)}
                      placeholder="cth: 1234 / staff1234"
                      className={`w-full pl-9 pr-4 py-2.5 text-xs font-mono font-bold rounded-xl border focus:outline-none focus:border-red-500 ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Nilai bawaan developer: <code className="text-blue-400 font-bold">1234</code>
                  </p>
                </div>

                {defaultPassFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{defaultPassFeedback}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#E30000] hover:bg-[#c00000] text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/40 transition-all cursor-pointer"
                  >
                    Simpan Standar Password
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDeveloperStandards}
                    className={`px-3 py-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                    title="Kembalikan ke 8888 & 1234"
                  >
                    Reset Bawaan
                  </button>
                </div>
              </form>
            </div>

            <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} text-[11px] text-slate-400 flex items-center justify-between`}>
              <span>Terakhir diperbarui: {defaultPasswords.updatedAt || '2026-01-01'}</span>
              <span>Oleh: {defaultPasswords.updatedBy || 'Developer'}</span>
            </div>
          </div>

          {/* Card: SOP & Ketentuan Keamanan 2-Lapis */}
          <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Protokol Keamanan 2 Lapis
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kepatuhan integrasi akses multi-perangkat tim obeecreatives
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 mt-4 text-xs leading-relaxed">
                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-[10px] font-black">1</span>
                    <span>Lapis 1: Whitelist Email Terpusat</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Sistem menolak segala bentuk pendaftaran mandiri liar. Hanya email yang telah dimasukkan oleh PM/Admin/Web Developer di Tab Pengaturan ini yang memiliki izin login dan mengakses board.
                  </p>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-black">2</span>
                    <span>Lapis 2: Password Standar Awal Otomatis</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Setiap email baru otomatis dibekali password default awal (8888 / 1234 atau hasil kustomisasi). Admin dapat langsung menyalin teks kredensial untuk diserahkan ke staf bersangkutan.
                  </p>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[10px] font-black">3</span>
                    <span>Fitur Ganti Password Mandiri</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Setelah login pertama kali, staf sangat dianjurkan untuk mengganti password/PIN mandiri via Subtab Ganti Password atau Modal Profil di pojok atas agar akun tetap aman di perangkat pribadi.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>Full Access: <b>loehendra@gmail.com</b>, <b>obeetools@gmail.com</b>, <b>obeecreatives@gmail.com</b>.</span>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Self-Service Password Change */}
      {subTab === 'self_service' && (
        <div className="max-w-xl mx-auto">
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Ganti Password Mandiri
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Akun aktif saat ini: <b className="text-red-400">{currentUser?.name}</b> ({currentUser?.email})
              </p>
            </div>

            <form onSubmit={handleSelfPasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-300">
                  Password / PIN Saat Ini
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={selfShowPassword ? 'text' : 'password'}
                    value={selfOldPassword}
                    onChange={(e) => setSelfOldPassword(e.target.value)}
                    placeholder="Masukkan password lama Anda..."
                    className={`w-full pl-10 pr-10 py-3 text-xs font-mono rounded-xl border focus:outline-none focus:border-red-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setSelfShowPassword(!selfShowPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                  >
                    {selfShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-300">
                  Password Baru (Min 4 Karakter)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={selfShowPassword ? 'text' : 'password'}
                    value={selfNewPassword}
                    onChange={(e) => setSelfNewPassword(e.target.value)}
                    placeholder="Masukkan password baru Anda..."
                    className={`w-full pl-10 pr-4 py-3 text-xs font-mono rounded-xl border focus:outline-none focus:border-red-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-300">
                  Ulangi Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <CheckCircle2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={selfShowPassword ? 'text' : 'password'}
                    value={selfConfirmPassword}
                    onChange={(e) => setSelfConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru Anda..."
                    className={`w-full pl-10 pr-4 py-3 text-xs font-mono rounded-xl border focus:outline-none focus:border-red-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {selfFeedback && (
                <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                  selfFeedback.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {selfFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{selfFeedback.text}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#E30000] hover:bg-[#c00000] text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/40 transition-all cursor-pointer active:scale-[0.98]"
              >
                Perbarui Password Akun Saya
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Subtab 4: Security Audit Logs */}
      {subTab === 'logs' && (
        <div className={`border rounded-2xl overflow-hidden shadow-lg ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Riwayat Audit Keamanan & Akses
              </h3>
              <p className="text-[11px] text-slate-400">
                Pencatatan real-time pendaftaran whitelist, pergantian password mandiri, dan reset standar developer.
              </p>
            </div>
            <button
              onClick={refreshAll}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Segarkan Log</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <tr>
                  <th className="py-3 px-4">Waktu & Tanggal</th>
                  <th className="py-3 px-4">Aksi Keamanan</th>
                  <th className="py-3 px-4">Pelaku (Actor)</th>
                  <th className="py-3 px-4">Target Akun</th>
                  <th className="py-3 px-4">Rincian Perubahan</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {securityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada log aktivitas keamanan tercatat.
                    </td>
                  </tr>
                ) : (
                  securityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          log.action === 'WHITELIST_ADD'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : log.action === 'WHITELIST_REMOVE'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : log.action === 'PASSWORD_CHANGE'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : log.action === 'PASSWORD_RESET'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{log.actorEmail}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {log.targetEmail || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-md truncate">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Register New Admin / Curator / Staff to Whitelist */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 relative ${
            isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Daftarkan Akun ke Whitelist</h3>
                  <p className="text-[11px] text-slate-400">
                    Otomatis mendapatkan Password Default Awal yang siap digunakan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterUser} className="space-y-4 mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-300">
                    Email Gmail / Kerja *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-red-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-300">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nama Lengkap Staf"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-red-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-300">
                  Peran & Hak Akses Kanban *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setNewRole(r);
                    if (r === 'admin') {
                      setNewJabatan('Admin Kurator Konten');
                      setNewDivisi('Manajemen');
                    } else if (r === 'staff_creator') {
                      setNewJabatan('Content Creator & Designer');
                      setNewDivisi('Kreatif');
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-red-500 font-medium ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="admin">Admin / Kurator (Berhak pindah ke Approved/RtP, Scheduling, Publish & Penentu Fee)</option>
                  <option value="staff_creator">Staff / Creator / Freelancer (Draft: New Idea - Request Approval, & geser RtP onwards)</option>
                  <option value="project_manager">Project Manager / Site Engineer (Lalu Mahendra - Full Access)</option>
                  <option value="web_developer">Web Developer (obeetools / obeecreatives - Full Access)</option>
                  <option value="client">Client / Brand Owner (Read Only Tanpa Fee)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-300">
                    Divisi
                  </label>
                  <input
                    type="text"
                    value={newDivisi}
                    onChange={(e) => setNewDivisi(e.target.value)}
                    placeholder="cth: Manajemen / Kreatif"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-red-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-300">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    value={newJabatan}
                    onChange={(e) => setNewJabatan(e.target.value)}
                    placeholder="cth: Kurator Konten"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-red-500 ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Password Default Preview & Option */}
              <div className={`p-4 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              } space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    <span>Password Default Awal Otomatis</span>
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {['admin', 'project_manager', 'web_developer', 'site_engineer'].includes(newRole)
                      ? defaultPasswords.adminDefault
                      : defaultPasswords.staffDefault}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useDefaultCheck"
                    checked={useDefaultPassword}
                    onChange={(e) => setUseDefaultPassword(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="useDefaultCheck" className="text-[11px] text-slate-300 cursor-pointer">
                    Gunakan Password Default Standar Developer Otomatis
                  </label>
                </div>

                {!useDefaultPassword && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Kustomisasi Password Awal Khusus (Min 4 Karakter):
                    </label>
                    <input
                      type="text"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      placeholder="Masukkan password khusus..."
                      className={`w-full px-3 py-2 text-xs font-mono rounded-xl border focus:outline-none focus:border-red-500 ${
                        isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                )}
              </div>

              {registrationFeedback && (
                <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                  registrationFeedback.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{registrationFeedback.message}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className={`flex-1 py-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#E30000] hover:bg-[#c00000] text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/40 transition-all cursor-pointer"
                >
                  Daftarkan ke Whitelist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Account Credential Card (Ready to Copy/Share) */}
      {credentialModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 text-center relative ${
            isDarkMode ? 'bg-[#0f172a] border-emerald-500/40 text-slate-100' : 'bg-white border-emerald-500/40 text-slate-900'
          }`}>
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black">Akun Berhasil Didaftarkan!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Email telah masuk ke Whitelist resmi dan otomatis dibekali Password Default Awal.
            </p>

            <div className={`mt-5 p-4 rounded-2xl border text-left space-y-2 font-mono text-xs ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between">
                <span className="text-slate-400">Nama:</span>
                <span className="font-bold text-white">{credentialModalData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-bold text-emerald-400">{credentialModalData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Peran:</span>
                <span className="font-bold text-amber-400">{credentialModalData.role}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">Password Awal:</span>
                <span className="font-black text-red-500 text-sm">{credentialModalData.password}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 italic">
              Salin informasi di atas untuk diserahkan ke staf/admin. Pengguna disarankan mengganti password mandiri setelah masuk.
            </p>

            <div className="mt-5 space-y-2">
              <button
                onClick={handleCopyCredentials}
                className="w-full py-3 bg-[#E30000] hover:bg-[#c00000] text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedCredential ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCredential ? 'Teks Kredensial Berhasil Disalin!' : 'Salin Kredensial Akses'}</span>
              </button>

              <button
                onClick={() => setCredentialModalData(null)}
                className={`w-full py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Set Custom Password for specific staff */}
      {targetStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-sm rounded-3xl border shadow-2xl p-6 relative ${
            isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="font-bold text-base">Atur Password Baru</h3>
            <p className="text-xs text-slate-400 mt-1">
              Untuk akun: <b>{targetStaff.name}</b> ({targetStaff.email})
            </p>

            <form onSubmit={handleSaveCustomPassword} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-300">
                  Password Baru (Min 4 Karakter)
                </label>
                <input
                  type="text"
                  required
                  value={targetNewPassword}
                  onChange={(e) => setTargetNewPassword(e.target.value)}
                  placeholder="Masukkan password baru..."
                  className={`w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border focus:outline-none focus:border-red-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {resetModalMessage && (
                <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                  resetModalMessage.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resetModalMessage.text}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetStaff(null)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold ${
                    isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E30000] hover:bg-[#c00000] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
