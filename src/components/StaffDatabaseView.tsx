import React, { useState, useMemo } from 'react';
import { StaffUser, ContentItem, UserRole } from '../types';
import { authService } from '../services/authService';
import { staffGasService, DEFAULT_STAFF_GAS_TEMPLATE, StaffComparisonResult, RemoteDiffItem } from '../services/staffGasService';
import { ROLES } from '../data/seedData';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Sparkles,
  Database,
  BarChart3,
  Flame,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';

interface StaffDatabaseViewProps {
  contentItems: ContentItem[];
  activeRole: UserRole;
  onRefreshData?: () => void;
  isDarkMode?: boolean;
}

export const StaffDatabaseView: React.FC<StaffDatabaseViewProps> = ({
  contentItems,
  activeRole,
  isDarkMode = true,
}) => {
  const [subTab, setSubTab] = useState<'directory' | 'audit' | 'gas_setup'>('directory');
  const [directory, setDirectory] = useState<StaffUser[]>(() => authService.getDirectory());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivisi, setSelectedDivisi] = useState('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  const [gasUrlInput, setGasUrlInput] = useState(() => staffGasService.getStaffGasUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaffEmail, setEditingStaffEmail] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<StaffUser>>({
    name: '',
    email: '',
    divisi: 'Desain Grafis',
    jabatan: 'Desainer Grafis',
    role: 'vendor_lapangan',
    phone: '',
    statusKerja: 'Aktif',
    baseRate: 30000,
    namaBank: 'BCA',
    noRekening: '',
    isAdmin: false,
  });

  const [resetPinStaff, setResetPinStaff] = useState<StaffUser | null>(null);
  const [targetNewPin, setTargetNewPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedPinMessage, setCopiedPinMessage] = useState(false);

  const roleConfig = ROLES[activeRole] || ROLES.project_manager;
  const canManageStaff = roleConfig.canEditRateCard;

  const divisions = useMemo(() => {
    const set = new Set<string>();
    directory.forEach((s) => {
      if (s.divisi) set.add(s.divisi);
    });
    return Array.from(set).sort();
  }, [directory]);

  const filteredStaff = useMemo(() => {
    return directory.filter((st) => {
      if (selectedDivisi !== 'ALL' && st.divisi !== selectedDivisi) return false;
      if (selectedRoleFilter !== 'ALL' && st.role !== selectedRoleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = st.name.toLowerCase().includes(q);
        const matchEmail = st.email.toLowerCase().includes(q);
        const matchJabatan = (st.jabatan || '').toLowerCase().includes(q);
        const matchDivisi = (st.divisi || '').toLowerCase().includes(q);
        return matchName || matchEmail || matchJabatan || matchDivisi;
      }
      return true;
    });
  }, [directory, selectedDivisi, selectedRoleFilter, searchQuery]);

  const contentAudit: StaffComparisonResult = useMemo(() => {
    return staffGasService.compareStaffWithContent(directory, contentItems);
  }, [directory, contentItems]);

  const remoteDiffs: RemoteDiffItem[] = useMemo(() => {
    const remote = staffGasService.getRemoteCache();
    return staffGasService.compareLocalWithRemote(directory, remote);
  }, [directory]);

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim()) {
      alert('Nama dan Email wajib diisi.');
      return;
    }

    if (editingStaffEmail) {
      const res = authService.updateStaff(editingStaffEmail, formData);
      if (res.success) {
        setDirectory(authService.getDirectory());
        setIsModalOpen(false);
        setEditingStaffEmail(null);
      } else {
        alert(res.error || 'Gagal memperbarui data staf.');
      }
    } else {
      const newStaff: StaffUser = {
        id: 'stf-' + Math.random().toString(36).substring(2, 8),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        divisi: formData.divisi || 'Desain Grafis',
        jabatan: formData.jabatan || 'Desainer Grafis',
        role: (formData.role as UserRole) || 'vendor_lapangan',
        phone: formData.phone || '',
        statusKerja: (formData.statusKerja as any) || 'Aktif',
        baseRate: Number(formData.baseRate || 30000),
        namaBank: formData.namaBank || 'BCA',
        noRekening: formData.noRekening || '',
        isAdmin:
          formData.role === 'project_manager' ||
          formData.role === 'web_developer' ||
          formData.role === 'admin' ||
          formData.role === 'site_engineer',
        createdAt: new Date().toISOString().split('T')[0],
      };

      const res = authService.registerNewStaff(newStaff);
      if (res.success) {
        setDirectory(authService.getDirectory());
        setIsModalOpen(false);
      } else {
        alert(res.error || 'Gagal mendaftarkan staf baru.');
      }
    }
  };

  const handleOpenEdit = (staff: StaffUser) => {
    setEditingStaffEmail(staff.email);
    setFormData({ ...staff });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingStaffEmail(null);
    setFormData({
      name: '',
      email: '',
      divisi: 'Desain Grafis',
      jabatan: 'Desainer Grafis',
      role: 'vendor_lapangan',
      phone: '',
      statusKerja: 'Aktif',
      baseRate: 30000,
      namaBank: 'BCA',
      noRekening: '',
      isAdmin: false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (email: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus "${name}" (${email}) dari database staf?`)) {
      const res = authService.deleteStaff(email);
      if (res.success) {
        setDirectory(authService.getDirectory());
      } else {
        alert(res.error || 'Gagal menghapus staf.');
      }
    }
  };

  const handleOpenResetPin = (staff: StaffUser) => {
    setResetPinStaff(staff);
    setTargetNewPin('');
    setShowCurrentPin(false);
    setResetFeedback(null);
    setCopiedPinMessage(false);
  };

  const handleExecuteResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPinStaff) return;
    const cleanPin = targetNewPin.trim();
    if (cleanPin.length < 4) {
      setResetFeedback({ success: false, message: 'PIN baru minimal harus terdiri dari 4 digit.' });
      return;
    }

    const currentLoggedIn = authService.getCurrentUser();
    const adminEmail = currentLoggedIn?.email || 'obeetools@gmail.com';
    const result = authService.adminResetPin(adminEmail, resetPinStaff.email, cleanPin);

    if (result.success) {
      setResetFeedback({
        success: true,
        message: `PIN akun ${resetPinStaff.name} berhasil di-reset paksa menjadi: ${cleanPin}`,
      });
    } else {
      setResetFeedback({
        success: false,
        message: result.error || 'Gagal mereset PIN staf.',
      });
    }
  };

  const handleCopyWhatsappReset = () => {
    if (!resetPinStaff) return;
    const cleanPin = targetNewPin.trim() || authService.getStaffPin(resetPinStaff.email);
    const msg = `Halo ${resetPinStaff.name},\n\nPIN akun login obeecreatives Anda telah diperbarui oleh Admin menjadi: *${cleanPin}*.\n\nSilakan login kembali dengan email resmi Anda (${resetPinStaff.email}). Terima kasih!`;
    navigator.clipboard.writeText(msg);
    setCopiedPinMessage(true);
    setTimeout(() => setCopiedPinMessage(false), 3000);
  };

  const handleSaveGasUrl = () => {
    staffGasService.setStaffGasUrl(gasUrlInput);
    setSyncFeedback('URL Web App GAS Staf berhasil disimpan.');
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await staffGasService.testConnection();
    setIsTesting(false);
    setTestResult(res);
  };

  const handlePushToCloud = async () => {
    if (!staffGasService.isConfigured()) {
      alert('Konfigurasikan URL Web App GAS Staf terlebih dahulu di tab "Konfigurasi GAS Staf"');
      setSubTab('gas_setup');
      return;
    }

    setIsSyncing(true);
    setSyncFeedback('Mengirim data database staf ke Google Spreadsheet...');
    const res = await staffGasService.pushStaffToRemote(directory);
    setIsSyncing(false);
    if (res.success) {
      setSyncFeedback(`✅ Sukses! ${res.message}`);
    } else {
      setSyncFeedback(`❌ Gagal: ${res.error}`);
    }
  };

  const handlePullFromCloud = async () => {
    if (!staffGasService.isConfigured()) {
      alert('Konfigurasikan URL Web App GAS Staf terlebih dahulu di tab "Konfigurasi GAS Staf"');
      setSubTab('gas_setup');
      return;
    }

    setIsSyncing(true);
    setSyncFeedback('Mengambil database staf terbaru dari Google Spreadsheet...');
    const res = await staffGasService.fetchRemoteStaff();
    setIsSyncing(false);
    if (res.success && res.data) {
      authService.setDirectory(res.data);
      setDirectory(authService.getDirectory());
      setSyncFeedback(`✅ Berhasil mengimpor ${res.data.length} staf dari Google Spreadsheet!`);
    } else {
      setSyncFeedback(`❌ Gagal: ${res.error}`);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(DEFAULT_STAFF_GAS_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-colors`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Terisolasi & Aman (Independent GAS)
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Database Tim v2
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Database Tim & Staf obeecreatives
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Manajemen profil staf, divisi, nomor rekening, dan tolok ukur akurasi kreator dengan Google Spreadsheet mandiri tanpa mengganggu data Project Control.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {canManageStaff && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-red-900/30 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Staf Baru</span>
              </button>
            )}

            <button
              onClick={handlePullFromCloud}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-emerald-900/30 disabled:opacity-50 cursor-pointer"
              title="Tarik database staf asli dari Google Spreadsheet mandiri"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-white ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Tarik Data Cloud</span>
            </button>

            <button
              onClick={handlePushToCloud}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-3 py-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'} border rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer`}
              title="Kirim data database staf ke Google Spreadsheet mandiri"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Kirim ke Cloud</span>
            </button>
          </div>
        </div>

        {/* Highlight Metrics */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'} border flex flex-col justify-between`}>
            <span className="text-[11px] text-slate-400 font-medium">Total Staf Terdaftar</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-xl font-bold font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{directory.length}</span>
              <span className="text-[10px] text-slate-400">anggota</span>
            </div>
          </div>

          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'} border flex flex-col justify-between`}>
            <span className="text-[11px] text-slate-400 font-medium">Jumlah Divisi</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-emerald-500 font-mono">{divisions.length}</span>
              <span className="text-[10px] text-slate-400">divisi aktif</span>
            </div>
          </div>

          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'} border flex flex-col justify-between`}>
            <span className="text-[11px] text-slate-400 font-medium">Akurasi Kreator Konten</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-bold text-sky-500 font-mono">{contentAudit.accuracyRate}%</span>
              <span className="text-[10px] text-slate-400">terdata cocok</span>
            </div>
          </div>

          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'} border flex flex-col justify-between`}>
            <span className="text-[11px] text-slate-400 font-medium">Koneksi GAS Mandiri</span>
            <div className="flex items-center gap-1.5 mt-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  staffGasService.isConfigured() ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {staffGasService.isConfigured() ? 'Terhubung' : 'Siap Dikonfigurasi'}
              </span>
            </div>
          </div>
        </div>

        {syncFeedback && (
          <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'}`}>
            <span>{syncFeedback}</span>
            <button onClick={() => setSyncFeedback(null)} className="text-slate-400 hover:opacity-80 text-xs cursor-pointer">
              Tutup
            </button>
          </div>
        )}
      </div>

      {/* Sub Tabs Navigation */}
      <div className={`flex items-center gap-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-3 overflow-x-auto`}>
        <button
          onClick={() => setSubTab('directory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            subTab === 'directory'
              ? 'bg-red-500/10 text-red-500 border border-red-500/30'
              : isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Direktori Tim ({directory.length})</span>
        </button>

        <button
          onClick={() => setSubTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            subTab === 'audit'
              ? 'bg-red-500/10 text-red-500 border border-red-500/30'
              : isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Audit & Data Pembanding Akurasi</span>
          {contentAudit.unregisteredCreators.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-500 border border-amber-500/30">
              {contentAudit.unregisteredCreators.length} tak terdaftar
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('gas_setup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            subTab === 'gas_setup'
              ? 'bg-red-500/10 text-red-500 border border-red-500/30'
              : isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Konfigurasi GAS Staf (Terpisah)</span>
        </button>
      </div>

      {/* SUBTAB 1: DIRECTORY */}
      {subTab === 'directory' && (
        <div className="space-y-4">
          <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3`}>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama staf, email, jabatan..."
                className={`w-full pl-9 pr-3 py-1.5 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-lg text-xs focus:outline-none focus:border-red-500`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedDivisi}
                onChange={(e) => setSelectedDivisi(e.target.value)}
                className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'} border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-500`}
              >
                <option value="ALL">Semua Divisi ({divisions.length})</option>
                {divisions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'} border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-500`}
              >
                <option value="ALL">Semua Peran</option>
                <option value="project_manager">PM / Site Engineer (Full Akses)</option>
                <option value="web_developer">Web Developer (Full Akses)</option>
                <option value="admin">Admin (Approval & Fee Lock)</option>
                <option value="staff_creator">Staff / Creator / Freelancer</option>
              </select>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl overflow-hidden shadow-xl`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`${isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'} border-b font-bold uppercase tracking-wider`}>
                    <th className="py-3 px-4">Nama & Email</th>
                    <th className="py-3 px-4">Divisi & Jabatan</th>
                    <th className="py-3 px-4">Peran (Role)</th>
                    <th className="py-3 px-4">Kontak / WA</th>
                    <th className="py-3 px-4">Rekening & Bank</th>
                    <th className="py-3 px-4">Status</th>
                    {canManageStaff && <th className="py-3 px-4 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada anggota staf yang cocok dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => {
                      const roleMeta = ROLES[staff.role] || ROLES.vendor_lapangan;
                      return (
                        <tr key={staff.email} className={`${isDarkMode ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'} transition-colors`}>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-200 border-slate-300 text-slate-800'} border flex items-center justify-center font-bold text-xs shrink-0`}>
                                {staff.name.charAt(0)}
                              </div>
                              <div>
                                <div className={`font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                                  <span>{staff.name}</span>
                                  {staff.isAdmin && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">{staff.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{staff.divisi}</span>
                            <span className="text-[11px] text-slate-400">{staff.jabatan}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleMeta.badgeColor}`}>
                              {roleMeta.label}
                            </span>
                          </td>

                          <td className={`py-3.5 px-4 font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            {staff.phone ? (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{staff.phone}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {staff.noRekening ? (
                              <div>
                                <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{staff.namaBank || 'Bank'}</span>
                                <span className="block text-[11px] font-mono text-slate-400">
                                  {staff.noRekening}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                staff.statusKerja === 'Aktif'
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                              }`}
                            >
                              {staff.statusKerja || 'Aktif'}
                            </span>
                          </td>

                          {canManageStaff && (
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenResetPin(staff)}
                                  className="p-1.5 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors border border-amber-500/20 cursor-pointer"
                                  title="Reset Paksa PIN Staf"
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(staff)}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                                  title="Edit data staf"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(staff.email, staff.name)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus staf"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: AUDIT & DATA PEMBANDING */}
      {subTab === 'audit' && (
        <div className="space-y-6">
          <div className={`${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-5 flex items-start gap-4`}>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Fungsi Audit & Pengukuran Akurasi Data
              </h3>
              <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Tabel di bawah membandingkan nama-nama Creator yang tercantum pada <b>{contentAudit.totalContentAnalyzed} baris konten Project Control</b> terhadap daftar anggota tim resmi di Database Staf.
              </p>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-5 space-y-4 shadow-xl`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <span>Pencocokan Kreator Konten vs Database Staf</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    Tingkat Akurasi: {contentAudit.accuracyRate}%
                  </span>
                </h4>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'} border-b font-bold uppercase tracking-wider`}>
                    <th className="py-2.5 px-3">Nama Kreator di Konten</th>
                    <th className="py-2.5 px-3">Status Registrasi</th>
                    <th className="py-2.5 px-3">Akun Email Resmi</th>
                    <th className="py-2.5 px-3">Divisi Staf</th>
                    <th className="py-2.5 px-3 text-center">Jumlah Konten</th>
                    <th className="py-2.5 px-3 text-right">Akumulasi Fee</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                  {contentAudit.matchedCreators.map((item) => (
                    <tr key={item.creatorName} className={isDarkMode ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}>
                      <td className={`py-3 px-3 font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {item.creatorName}
                      </td>
                      <td className="py-3 px-3">
                        {item.isRegistered ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Terdaftar Cocok</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Belum Ada di DB Staf</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {item.staffEmail || <span className="italic text-slate-400">Belum dipetakan</span>}
                      </td>
                      <td className={`py-3 px-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {item.staffDivisi || '-'}
                      </td>
                      <td className={`py-3 px-3 text-center font-mono font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {item.contentCount}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-500">
                        Rp {item.totalFee.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: GAS SETUP */}
      {subTab === 'gas_setup' && (
        <div className="space-y-6">
          <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6 shadow-xl space-y-4`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Keuntungan Menggunakan Google Apps Script Baru (Terpisah)
                </h3>
                <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Dengan membuat spreadsheet dan script GAS baru khusus untuk Database Staf:
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-400 list-disc list-inside">
                  <li>
                    <b className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Keamanan Penuh:</b> Spreadsheet Project Control sama sekali tidak akan tersentuh atau berisiko rusak.
                  </li>
                  <li>
                    <b className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Data Pembanding Akurat:</b> Anda memiliki dua database independen yang dapat diaudit silang kapan saja.
                  </li>
                </ul>
              </div>
            </div>

            <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} space-y-3`}>
              <label className={`block text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                URL Web App Google Apps Script Khusus Staf
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={gasUrlInput}
                  onChange={(e) => setGasUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className={`w-full px-3.5 py-2.5 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl text-xs font-mono focus:outline-none focus:border-red-500`}
                />
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={handleSaveGasUrl}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors w-full sm:w-auto cursor-pointer"
                  >
                    Simpan URL
                  </button>
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className={`px-4 py-2.5 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'} border rounded-xl text-xs font-bold transition-colors disabled:opacity-50 w-full sm:w-auto cursor-pointer`}
                  >
                    {isTesting ? 'Menguji...' : 'Uji Koneksi'}
                  </button>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                      : 'bg-red-950/40 border-red-800/80 text-red-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

            <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>Kode Lengkap Google Apps Script (Staff Database)</span>
                </span>
                <button
                  onClick={handleCopyScript}
                  className={`flex items-center gap-1.5 px-3 py-1.5 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'} border rounded-lg text-xs font-semibold transition-colors cursor-pointer`}
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Seluruh Script'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-72 overflow-y-auto leading-relaxed select-all">
                {DEFAULT_STAFF_GAS_TEMPLATE}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: Add / Edit Staff */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} border rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'} flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {editingStaffEmail ? 'Edit Data Anggota Staf' : 'Tambah Anggota Tim Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Pastikan nama sama dengan yang digunakan pada kartu konten.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500 p-1 rounded-lg text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-400">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="cth: Aldrien Andriansyah"
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl focus:outline-none focus:border-red-500`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-400">
                    Alamat Email Akun <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    disabled={Boolean(editingStaffEmail)}
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="cth: aldrien.and@gmail.com"
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl focus:outline-none focus:border-red-500 disabled:opacity-60`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-400">Divisi Kerja</label>
                  <select
                    value={formData.divisi || 'Desain Grafis'}
                    onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl focus:outline-none focus:border-red-500`}
                  >
                    <option value="Photography">Photography</option>
                    <option value="Videography">Videography</option>
                    <option value="Desain Grafis">Desain Grafis</option>
                    <option value="Social Media Management">Social Media Management</option>
                    <option value="Manajemen">Manajemen & Operasional</option>
                    <option value="Teknologi">Teknologi & Dev</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-400">Jabatan / Posisi</label>
                  <input
                    type="text"
                    value={formData.jabatan || ''}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    placeholder="cth: Lead Videographer & Editor"
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl focus:outline-none focus:border-red-500`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-400">Peran Aplikasi (Role)</label>
                  <select
                    value={formData.role || 'staff_creator'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl focus:outline-none focus:border-red-500`}
                  >
                    <option value="staff_creator">Staff / Creator / Freelancer (Fase Draft & Pasca-Approved)</option>
                    <option value="admin">Admin (Approval Status & Kunci Fee)</option>
                    <option value="project_manager">Project Manager / Site Engineer (Full Akses)</option>
                    <option value="web_developer">Web Developer (Full Akses)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-400">Status Kerja</label>
                  <select
                    value={formData.statusKerja || 'Aktif'}
                    onChange={(e) => setFormData({ ...formData, statusKerja: e.target.value as any })}
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl focus:outline-none focus:border-red-500`}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-400">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08123456789"
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl focus:outline-none focus:border-red-500`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-400">Nama Bank</label>
                  <input
                    type="text"
                    value={formData.namaBank || 'BCA'}
                    onChange={(e) => setFormData({ ...formData, namaBank: e.target.value })}
                    placeholder="BCA / Mandiri / BRI"
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl focus:outline-none focus:border-red-500`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-400">Nomor Rekening</label>
                  <input
                    type="text"
                    value={formData.noRekening || ''}
                    onChange={(e) => setFormData({ ...formData, noRekening: e.target.value })}
                    placeholder="0561234567"
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl focus:outline-none focus:border-red-500`}
                  />
                </div>
              </div>

              <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-end gap-2`}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} rounded-xl font-semibold transition-colors cursor-pointer`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors cursor-pointer"
                >
                  {editingStaffEmail ? 'Simpan Perubahan' : 'Daftarkan Staf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FORCE RESET PIN */}
      {resetPinStaff && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${isDarkMode ? 'bg-[#0f172a] border-amber-500/30 text-slate-100' : 'bg-white border-amber-300 text-slate-800 shadow-xl'} border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl`}>
            <div className={`p-5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Reset Paksa PIN Staf
                  </h3>
                  <p className="text-[11px] text-amber-500 font-medium">
                    Akses Khusus Admin & Site Engineer
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResetPinStaff(null)}
                className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className={`p-3.5 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-xl flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-200 border-slate-300 text-slate-800'} border flex items-center justify-center font-bold text-sm`}>
                    {resetPinStaff.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{resetPinStaff.name}</h4>
                    <span className="text-xs text-slate-400 font-mono">{resetPinStaff.email}</span>
                  </div>
                </div>
              </div>

              {/* Current PIN Inspector */}
              <div className={`p-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'} border rounded-xl flex items-center justify-between`}>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">PIN Aktif Saat Ini:</span>
                  <span className={`font-mono text-xs font-bold tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {showCurrentPin ? authService.getStaffPin(resetPinStaff.email) : '••••••••'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} rounded-lg text-[11px] transition-colors cursor-pointer`}
                >
                  {showCurrentPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showCurrentPin ? 'Sembunyikan' : 'Lihat'}</span>
                </button>
              </div>

              {/* Reset Form */}
              <form onSubmit={handleExecuteResetPin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-400">
                    Masukkan PIN Baru:
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={targetNewPin}
                    onChange={(e) => setTargetNewPin(e.target.value)}
                    placeholder="Masukkan 4 digit PIN baru (cth: 1234)"
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl font-mono text-sm focus:outline-none focus:border-amber-500`}
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Minimal 4 digit angka. Staf dapat langsung login dengan PIN baru ini.
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 mr-1">Preset:</span>
                  <button
                    type="button"
                    onClick={() => setTargetNewPin('1234')}
                    className={`px-2.5 py-1 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'} border rounded-lg text-[11px] font-mono transition-colors cursor-pointer`}
                  >
                    1234 (Staf)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
                      setTargetNewPin(randomPin);
                    }}
                    className={`px-2.5 py-1 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'} border rounded-lg text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Acak 4 Digit</span>
                  </button>
                </div>

                {resetFeedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex flex-col gap-2 ${
                      resetFeedback.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                        : 'bg-red-500/10 border-red-500/30 text-red-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {resetFeedback.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span className="font-medium">{resetFeedback.message}</span>
                    </div>

                    {resetFeedback.success && (
                      <button
                        type="button"
                        onClick={handleCopyWhatsappReset}
                        className="mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        {copiedPinMessage ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Format Pesan WA Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Notifikasi WA untuk Staf</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                <div className={`pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-end gap-2`}>
                  <button
                    type="button"
                    onClick={() => setResetPinStaff(null)}
                    className={`px-4 py-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} rounded-xl text-xs font-semibold transition-colors cursor-pointer`}
                  >
                    {resetFeedback?.success ? 'Selesai' : 'Batal'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Terapkan Reset Paksa</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
