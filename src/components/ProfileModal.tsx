import React, { useState } from 'react';
import { StaffUser, UserRole, WorkMode } from '../types';
import { ROLES } from '../data/seedData';
import { authService } from '../services/authService';
import { geoService } from '../services/geoService';
import {
  User,
  X,
  ShieldCheck,
  LogOut,
  Building2,
  MapPin,
  Home,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StaffUser | null;
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  currentWorkMode: WorkMode;
  onWorkModeChange: (mode: WorkMode) => void;
  onLogout: () => void;
  isDarkMode?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeRole,
  onSelectRole,
  currentWorkMode,
  onWorkModeChange,
  onLogout,
  isDarkMode = true,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'pin' | 'role'>('profile');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinText, setShowPinText] = useState(false);
  const [pinMessage, setPinMessage] = useState<{ text: string; ok: boolean } | null>(null);

  if (!isOpen) return null;

  const roleConfig = ROLES[activeRole] || ROLES.project_manager;

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);

    if (!currentUser) return;
    if (!oldPin.trim() || !newPin.trim()) {
      setPinMessage({ text: 'PIN lama dan PIN baru wajib diisi.', ok: false });
      return;
    }
    if (newPin !== confirmPin) {
      setPinMessage({ text: 'Konfirmasi PIN baru tidak cocok.', ok: false });
      return;
    }
    if (newPin.trim().length < 4) {
      setPinMessage({ text: 'PIN baru minimal 4 karakter.', ok: false });
      return;
    }

    const res = authService.changePin(currentUser.email, oldPin, newPin);
    if (res.success) {
      setPinMessage({ text: 'PIN keamanan Anda berhasil diperbarui!', ok: true });
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } else {
      setPinMessage({ text: res.error || 'Gagal mengubah PIN.', ok: false });
    }
  };

  const workModes: { mode: WorkMode; label: string; desc: string; icon: any }[] = [
    {
      mode: 'WFO',
      label: 'Studio Mataram (WFO)',
      desc: 'Hadir langsung di studio',
      icon: <Building2 className="w-4 h-4 text-emerald-500" />,
    },
    {
      mode: 'ON_SITE',
      label: 'On-Site Klien',
      desc: 'Liputan di lokasi klien',
      icon: <MapPin className="w-4 h-4 text-amber-500" />,
    },
    {
      mode: 'WFH',
      label: 'Remote / WFH',
      desc: 'Bekerja daring dari rumah',
      icon: <Home className="w-4 h-4 text-sky-500" />,
    },
    {
      mode: 'MOBILE',
      label: 'Mobile / Kafe',
      desc: 'Bekerja nomaden',
      icon: <Coffee className="w-4 h-4 text-purple-500" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} border w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-[#1e293b]/70' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-500 font-bold text-xs">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentUser?.name || 'Profil Akun'}</h3>
              <p className="text-[11px] text-slate-400">{currentUser?.email || 'Akun Staf'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex items-center border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'} px-4 pt-2 gap-2 text-xs`}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-slate-400 hover:opacity-80'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Akun & Lokasi</span>
          </button>

          <button
            onClick={() => setActiveTab('pin')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pin'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-slate-400 hover:opacity-80'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Ubah PIN</span>
          </button>

          {currentUser?.isAdmin && (
            <button
              onClick={() => setActiveTab('role')}
              className={`pb-2.5 px-3 font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'role'
                  ? 'border-red-500 text-red-500'
                  : 'border-transparent text-slate-400 hover:opacity-80'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              <span>Mode Peran</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-4">
              <div className={`p-4 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-2xl flex flex-col gap-2.5`}>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Divisi:</span>
                  <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{currentUser?.divisi || 'Kreatif'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Jabatan:</span>
                  <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{currentUser?.jabatan || 'Staff'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hak Akses:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${roleConfig.badgeColor}`}>
                    {roleConfig.label}
                  </span>
                </div>
              </div>

              {/* Work Mode Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status Presensi & Lokasi:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {workModes.map((wm) => {
                    const isSelected = currentWorkMode === wm.mode;
                    return (
                      <button
                        key={wm.mode}
                        onClick={() => onWorkModeChange(wm.mode)}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-red-500/10 border-red-500 ring-1 ring-red-500/30'
                            : isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`flex items-center gap-1.5 font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                          {wm.icon}
                          <span className="text-xs">{wm.label.split(' ')[0]}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{wm.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logout Button */}
              <div className={`pt-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-red-950/40 hover:bg-red-900/50 border border-red-900/50 text-red-400 rounded-xl font-bold transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun Ini</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pin' && (
            <form onSubmit={handleChangePin} className="flex flex-col gap-3.5">
              <p className="text-slate-400 leading-relaxed">
                Ubah PIN keamanan Anda agar tidak ada yang bisa mengakses akun staf Anda dari perangkat lain.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">PIN Lama Anda:</label>
                <input
                  type={showPinText ? 'text' : 'password'}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="PIN lama (bawaan: 1234 / 8888)"
                  className={`w-full ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl px-3.5 py-2.5 font-mono tracking-widest focus:outline-none focus:border-red-500`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">PIN Baru (Min 4 digit):</label>
                <input
                  type={showPinText ? 'text' : 'password'}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="PIN baru Anda..."
                  maxLength={10}
                  className={`w-full ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl px-3.5 py-2.5 font-mono tracking-widest focus:outline-none focus:border-red-500`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Konfirmasi PIN Baru:</label>
                <input
                  type={showPinText ? 'text' : 'password'}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Ulangi PIN baru..."
                  maxLength={10}
                  className={`w-full ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl px-3.5 py-2.5 font-mono tracking-widest focus:outline-none focus:border-red-500`}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinText(!showPinText)}
                  className="text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium cursor-pointer"
                >
                  {showPinText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPinText ? 'Sembunyikan' : 'Lihat Angka PIN'}</span>
                </button>
              </div>

              {pinMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    pinMessage.ok
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      : 'bg-red-500/10 border-red-500/30 text-red-500'
                  }`}
                >
                  {pinMessage.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <span>{pinMessage.text}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#E30000] hover:bg-[#c00000] text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-red-950/40 active:scale-[0.98] mt-2 cursor-pointer"
              >
                Simpan PIN Baru
              </button>
            </form>
          )}

          {activeTab === 'role' && currentUser?.isAdmin && (
            <div className="flex flex-col gap-2.5">
              <p className="text-slate-400 leading-relaxed">
                Sebagai <b>Admin / Project Manager</b>, Anda dapat menguji sudut pandang peran lain:
              </p>
              {Object.values(ROLES).map((r) => {
                const isSelected = activeRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelectRole(r.id);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-red-500/10 border-red-500 text-red-500 font-bold'
                        : isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className={`font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{r.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{r.description}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${r.badgeColor}`}>
                      {r.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
