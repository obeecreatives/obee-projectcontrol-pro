import React, { useState, useRef } from 'react';
import { StaffUser } from '../types';
import { authService } from '../services/authService';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  User,
  Shield,
  Sun,
  Moon,
  HelpCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: StaffUser) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

type LoginTab = 'staff' | 'admin';

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  isDarkMode = true,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<LoginTab>('staff');
  const [emailInput, setEmailInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  // Switch tab and clear inputs/errors
  const handleSwitchTab = (tab: LoginTab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setEmailInput('');
    setPinInput('');
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const targetEmail = emailInput.trim();
    const targetPin = pinInput.trim();

    if (!targetEmail) {
      setErrorMessage(
        activeTab === 'admin'
          ? 'Silakan masukkan email akun Administrator Anda.'
          : 'Silakan masukkan email akun Staf Anda.'
      );
      return;
    }

    if (!targetPin) {
      setErrorMessage('Silakan masukkan PIN keamanan akun Anda.');
      pinInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Check directory
      const cleanEmail = targetEmail.toLowerCase();
      const dir = authService.getDirectory();
      const staffUser = dir.find((s) => s.email.toLowerCase() === cleanEmail);

      if (!staffUser) {
        setIsSubmitting(false);
        setErrorMessage(
          'Email tidak terdaftar di sistem. Pastikan penulisan email sudah benar atau hubungi Admin.'
        );
        return;
      }

      // 2. Strict Role Enforcement for Admin Tab
      if (activeTab === 'admin') {
        const isAdminRole =
          staffUser.isAdmin === true ||
          staffUser.role === 'admin' ||
          staffUser.role === 'project_manager' ||
          staffUser.role === 'web_developer';

        if (!isAdminRole) {
          setIsSubmitting(false);
          setErrorMessage(
            'Akses Ditolak: Email ini terdaftar sebagai akun Staf. Silakan beralih ke tab "Login Staff" untuk masuk.'
          );
          return;
        }
      }

      // 3. Verify PIN
      const res = authService.loginWithPin(targetEmail, targetPin);
      setIsSubmitting(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(
          activeTab === 'staff'
            ? 'PIN keamanan tidak sesuai. Jika baru pertama kali login, gunakan PIN Default: 1234.'
            : 'PIN Administrator tidak sesuai. Silakan periksa kembali atau minta reset PIN.'
        );
        pinInputRef.current?.focus();
      }
    }, 250);
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? 'bg-[#070b12] text-slate-100' : 'bg-slate-50 text-slate-800'
      } flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden transition-colors`}
    >
      {/* Background ambient glow */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] ${
          activeTab === 'admin' ? 'bg-red-600/10' : 'bg-blue-600/10'
        } rounded-full blur-[140px] pointer-events-none transition-colors duration-500`}
      />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top right theme switch */}
      {onToggleTheme && (
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer ${
              isDarkMode
                ? 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 shadow-sm'
            }`}
            title="Ganti Tema Tampilan"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            <span className="hidden sm:inline">{isDarkMode ? 'Tema Terang' : 'Tema Gelap'}</span>
          </button>
        </div>
      )}

      <div className="w-full max-w-lg relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <span className={`text-3xl sm:text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              obee<span className="text-[#E30000]">creatives</span>
            </span>
            <span className="text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-500 border border-red-500/30">
              V2.0 PRO
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            Project Control & Workspace OS
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-sm mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Portal internal manajemen proyek, kanban, jadwal kalender, dan monitoring produksi.
          </p>
        </div>

        {/* Dual Login Track Switcher (Two Pathways - Seperti Referensi Anda) */}
        <div
          className={`grid grid-cols-2 p-1.5 rounded-2xl mb-4 border shadow-inner transition-colors ${
            isDarkMode
              ? 'bg-slate-900/80 border-slate-800'
              : 'bg-slate-200/80 border-slate-300'
          }`}
        >
          {/* Pathway 1: Login Staff */}
          <button
            type="button"
            onClick={() => handleSwitchTab('staff')}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
              activeTab === 'staff'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-[1.02]'
                : isDarkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <span className="block leading-none">Login Staff</span>
              <span className={`text-[10px] block mt-1 font-normal ${activeTab === 'staff' ? 'text-blue-200' : 'text-slate-500'}`}>
                Kreatif & Operasional
              </span>
            </div>
            {activeTab === 'staff' && (
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
            )}
          </button>

          {/* Pathway 2: Login Admin */}
          <button
            type="button"
            onClick={() => handleSwitchTab('admin')}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
              activeTab === 'admin'
                ? 'bg-[#E30000] text-white shadow-lg shadow-red-950/60 scale-[1.02]'
                : isDarkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <span className="block leading-none">Login Admin</span>
              <span className={`text-[10px] block mt-1 font-normal ${activeTab === 'admin' ? 'text-red-200' : 'text-slate-500'}`}>
                PM & Developer
              </span>
            </div>
            {activeTab === 'admin' && (
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-red-300 animate-pulse" />
            )}
          </button>
        </div>

        {/* Login Card */}
        <div
          className={`${
            isDarkMode ? 'bg-[#0f172a]/95 border-slate-800 shadow-black/80' : 'bg-white border-slate-200 shadow-slate-200'
          } backdrop-blur-xl border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden`}
        >
          {/* Top color indicator line */}
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 transition-colors ${
              activeTab === 'admin' ? 'bg-[#E30000]' : 'bg-blue-600'
            }`}
          />

          {/* Card Top Header */}
          <div
            className={`flex items-center justify-between pb-4 mb-5 border-b ${
              isDarkMode ? 'border-slate-800/80' : 'border-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {activeTab === 'staff' ? (
                <>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      Jalur Akses Staf Kreatif
                    </h2>
                    <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Creator, Videographer, Designer, & SMM
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 shrink-0">
                    <ShieldCheck className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      Jalur Akses Administrator
                    </h2>
                    <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Project Manager, CEO, Developer, & Operasional
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className={`text-xs flex items-center gap-1 cursor-pointer transition-colors p-1.5 rounded-lg ${
                isDarkMode
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Bantuan Login & Panduan PIN"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline font-medium">Bantuan</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Field 1: Email Input */}
            <div>
              <label
                className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {activeTab === 'admin' ? 'Email Administrator' : 'Email Akun Staf'}
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder={
                    activeTab === 'admin'
                      ? 'cth: loehendra@gmail.com / admin@obeecreatives.com'
                      : 'cth: dissaraulia@gmail.com / aldrien.and@gmail.com'
                  }
                  autoComplete="email"
                  className={`w-full ${
                    isDarkMode ? 'bg-[#1e293b]/90 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  } border rounded-xl pl-11 pr-4 py-3 text-sm placeholder-slate-400 focus:outline-none ${
                    activeTab === 'admin'
                      ? 'focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  } transition-all font-medium`}
                />
              </div>
            </div>

            {/* Field 2: PIN Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  <KeyRound className={`w-3.5 h-3.5 ${activeTab === 'admin' ? 'text-red-500' : 'text-blue-500'}`} />
                  <span>PIN Keamanan</span>
                </label>
              </div>

              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={pinInputRef}
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder={
                    activeTab === 'staff'
                      ? 'Masukkan PIN akun Anda'
                      : 'Masukkan PIN rahasia Admin'
                  }
                  maxLength={15}
                  autoComplete="current-password"
                  className={`w-full ${
                    isDarkMode ? 'bg-[#1e293b]/90 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  } border rounded-xl pl-11 pr-12 py-3 text-sm placeholder-slate-400 focus:outline-none ${
                    activeTab === 'admin'
                      ? 'focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  } transition-all font-mono tracking-wider`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                  title={showPin ? 'Sembunyikan PIN' : 'Lihat PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Requirement #3: Staff ONLY: Small default PIN notice for first-time login */}
              {activeTab === 'staff' && (
                <div
                  className={`mt-2.5 p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                    isDarkMode
                      ? 'bg-blue-950/40 border-blue-800/50 text-blue-200'
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <span className="font-semibold">Pin Default:</span>{' '}
                    <code className="bg-blue-600/20 px-1.5 py-0.5 rounded font-mono font-bold text-blue-600 dark:text-blue-300">
                      1234
                    </code>
                    <span className="block mt-0.5 opacity-90">
                      PIN ini dapat diganti oleh masing-masing staff setelah berhasil login melalui menu Profil.
                    </span>
                  </div>
                </div>
              )}

              {/* Requirement #4: Admin Tab: STRICT NO DEFAULT PIN SHOWN */}
              {activeTab === 'admin' && (
                <div
                  className={`mt-2.5 p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${
                    isDarkMode
                      ? 'bg-red-950/30 border-red-900/40 text-red-300'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>
                    Jalur Akses Rahasia Administrator. PIN bersifat privasi dan tidak ditampilkan di layar.
                  </span>
                </div>
              )}
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/70 border border-red-700/80 text-red-200 text-xs font-medium animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <div className="leading-relaxed flex-1">{errorMessage}</div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${
                activeTab === 'admin'
                  ? 'bg-[#E30000] hover:bg-[#c00000] shadow-red-950/50'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-950/50'
              } active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer mt-3`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>
                    {activeTab === 'admin' ? 'Masuk sebagai Administrator' : 'Masuk sebagai Staff'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick guidance below the form */}
          <div
            className={`mt-5 pt-4 border-t flex items-center justify-between text-[11px] ${
              isDarkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-500'
            }`}
          >
            <span>
              {activeTab === 'staff' ? 'Bukan akun staf? ' : 'Bukan akun admin? '}
              <button
                type="button"
                onClick={() => handleSwitchTab(activeTab === 'staff' ? 'admin' : 'staff')}
                className="text-red-500 hover:underline font-semibold cursor-pointer"
              >
                {activeTab === 'staff' ? 'Beralih ke Login Admin' : 'Beralih ke Login Staff'}
              </button>
            </span>
            <span className="hidden sm:inline-block opacity-40">&bull;</span>
            <span className="hidden sm:inline-block opacity-60">2-Layer Auth Protected</span>
          </div>
        </div>

        {/* Security badges */}
        <div className="grid grid-cols-3 gap-3 mt-6 text-center">
          <div
            className={`p-3 ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            } border rounded-2xl flex flex-col items-center gap-1`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-medium">Privasi Terjaga</span>
          </div>
          <div
            className={`p-3 ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            } border rounded-2xl flex flex-col items-center gap-1`}
          >
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-medium">PIN Mandiri</span>
          </div>
          <div
            className={`p-3 ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            } border rounded-2xl flex flex-col items-center gap-1`}
          >
            <Lock className="w-4 h-4 text-sky-500" />
            <span className="text-[11px] font-medium">Dual Gateways</span>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-center text-[11px] text-slate-500 mt-6">
          Developed for obeecreatives &bull; Multi-Device Access Enabled
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            } border rounded-3xl p-6 shadow-2xl space-y-4`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-base">Panduan Login & Bantuan PIN</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className={`text-xs space-y-3 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <p>
                <strong>1. Login Staff:</strong> Ditujukan untuk seluruh tim kreatif dan staf operasional. Masukkan email
                terdaftar dan PIN Anda. Bagi staf yang baru pertama kali masuk, gunakan PIN default:{' '}
                <code className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded font-mono font-bold">1234</code>.
              </p>
              <p>
                <strong>2. Login Admin:</strong> Khusus untuk Project Manager (PM), CEO, Web Developer, dan Admin Operasional.
                Tidak menampilkan PIN default demi menjaga kerahasiaan hak akses tingkat tinggi.
              </p>
              <p>
                <strong>3. Ganti PIN Mandiri:</strong> Setelah berhasil login, Anda dapat mengganti PIN sewaktu-waktu di pojok kanan atas dashboard melalui menu profil Anda.
              </p>
              <p>
                <strong>4. Lupa PIN atau Email Tidak Terdaftar?</strong> Hubungi Project Manager atau Web Developer melalui WhatsApp obeecreatives untuk verifikasi dan reset PIN.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
