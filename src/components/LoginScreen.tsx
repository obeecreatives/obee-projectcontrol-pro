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
  Smartphone,
  Zap,
  Sparkles,
  CheckCircle2,
  LogIn,
  Sun,
  Moon,
  HelpCircle,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: StaffUser) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, isDarkMode = true, onToggleTheme }) => {
  const [emailInput, setEmailInput] = useState('loehendra@gmail.com');
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDirectory, setShowDirectory] = useState(true);
  const pinInputRef = useRef<HTMLInputElement>(null);

  const directory = authService.getDirectory();
  const defaultPasswords = authService.getDefaultPasswordConfig();

  // Find if currently typed email matches a registered staff
  const cleanCurrentEmail = emailInput.trim().toLowerCase();
  const detectedStaff = directory.find((s) => s.email.toLowerCase() === cleanCurrentEmail);
  const suggestedPin = detectedStaff
    ? authService.getStaffPin(detectedStaff.email)
    : (defaultPasswords.staffDefault || '1234');

  const handleSelectStaff = (staff: StaffUser, autoLogin: boolean = false) => {
    setEmailInput(staff.email);
    const pin = authService.getStaffPin(staff.email);
    setPinInput(pin);
    setErrorMessage('');

    if (autoLogin) {
      setIsSubmitting(true);
      setTimeout(() => {
        const res = authService.loginWithPin(staff.email, pin);
        setIsSubmitting(false);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setErrorMessage(res.error || 'Akses ditolak.');
        }
      }, 150);
      return;
    }

    setTimeout(() => {
      pinInputRef.current?.focus();
    }, 100);
  };

  const handleUseDefaultPin = () => {
    setPinInput(suggestedPin);
    setErrorMessage('');
    setTimeout(() => {
      pinInputRef.current?.focus();
    }, 50);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const targetEmail = emailInput.trim();
    if (!targetEmail) {
      setErrorMessage('Silakan masukkan atau pilih email akun staf Anda.');
      return;
    }

    // Solusi: Jika user belum mengisi PIN, otomatis gunakan PIN default/terdaftar untuk akun tersebut
    let effectivePin = pinInput.trim();
    if (!effectivePin) {
      if (detectedStaff) {
        effectivePin = suggestedPin;
        setPinInput(suggestedPin);
      } else {
        // Coba periksa apakah email terdaftar
        const fallbackPin = authService.getStaffPin(targetEmail);
        if (fallbackPin) {
          effectivePin = fallbackPin;
          setPinInput(fallbackPin);
        } else {
          setErrorMessage('Email tidak terdaftar di Whitelist Sistem. Silakan pilih salah satu akun resmi di daftar bawah.');
          return;
        }
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = authService.loginWithPin(targetEmail, effectivePin);
      setIsSubmitting(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Akses ditolak. Password / PIN keamanan tidak cocok.');
        pinInputRef.current?.focus();
      }
    }, 150);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#070b12] text-slate-100' : 'bg-slate-50 text-slate-800'} flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden transition-colors`}>
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

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

      <div className="w-full max-w-xl relative z-10">
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
          <p className={`text-xs sm:text-sm mt-1 max-w-md mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Masuk dengan akun email & PIN staf Anda untuk mengakses kanban, jadwal kalender, dan monitoring produksi real-time.
          </p>
        </div>

        {/* Login Card */}
        <div className={`${isDarkMode ? 'bg-[#0f172a]/95 border-slate-800 shadow-black/80' : 'bg-white border-slate-200 shadow-slate-200'} backdrop-blur-xl border rounded-3xl p-6 sm:p-8 shadow-2xl`}>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Field 1: Email Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`block text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email Akun Staf (Gmail)
                </label>
                {detectedStaff && (
                  <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terdaftar ({detectedStaff.jabatan})</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="cth: loehendra@gmail.com / dissaraulia@gmail.com"
                  className={`w-full ${isDarkMode ? 'bg-[#1e293b]/90 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl pl-11 pr-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium`}
                />
              </div>
            </div>

            {/* Field 2: PIN Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <KeyRound className="w-3.5 h-3.5 text-red-500" />
                  <span>Password / PIN Keamanan</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Default: <code className="text-emerald-500 font-bold bg-slate-800/40 px-1 py-0.5 rounded">{defaultPasswords.staffDefault}</code> staf / <code className="text-red-500 font-bold bg-slate-800/40 px-1 py-0.5 rounded">{defaultPasswords.adminDefault}</code> admin
                  </span>
                  <button
                    type="button"
                    onClick={handleUseDefaultPin}
                    className="text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-0.5 rounded-md border border-red-500/20 transition-colors cursor-pointer"
                    title={`Isi PIN default ${suggestedPin}`}
                  >
                    Isi {suggestedPin}
                  </button>
                </div>
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
                  placeholder={`PIN otomatis: ${suggestedPin} (atau ketik PIN Anda)`}
                  maxLength={15}
                  className={`w-full ${isDarkMode ? 'bg-[#1e293b]/90 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl pl-11 pr-12 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono tracking-wider`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  title={showPin ? 'Sembunyikan PIN' : 'Lihat PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {pinInput ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> PIN telah terisi
                    </span>
                  ) : (
                    <span>💡 Kosongkan untuk masuk otomatis dengan PIN bawaan (<strong>{suggestedPin}</strong>)</span>
                  )}
                </span>
              </div>
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
              className="w-full bg-[#E30000] hover:bg-[#c00000] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Select Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`} />
            </div>
            <div className="relative flex justify-center text-xs">
              <button
                type="button"
                onClick={() => setShowDirectory(!showDirectory)}
                className={`${isDarkMode ? 'bg-[#0f172a] text-slate-400 hover:text-slate-200' : 'bg-white text-slate-600 hover:text-slate-900'} px-3 flex items-center gap-1.5 transition-colors font-medium cursor-pointer`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Pilih Akun Staf Resmi ({directory.length}) &mdash; Bisa Masuk 1-Klik</span>
              </button>
            </div>
          </div>

          {/* Quick Select Roster */}
          {showDirectory && (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {directory.map((staff) => {
                const isSelected = emailInput.toLowerCase() === staff.email.toLowerCase();
                const defaultRolePin = authService.getDefaultPasswordForRole(staff.role, !!staff.isAdmin);
                return (
                  <div
                    key={staff.email}
                    className={`w-full group text-left p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-red-500/80 bg-red-950/25 ring-1 ring-red-500/30'
                        : isDarkMode
                        ? 'border-slate-800/80 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800/70'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectStaff(staff, false)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                          staff.isAdmin
                            ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                            : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                        }`}
                      >
                        {staff.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-sm font-bold truncate ${isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-800 group-hover:text-slate-950'}`}>
                          {staff.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                          <span>{staff.email}</span>
                          <span>&middot;</span>
                          <span className="text-slate-500">{staff.divisi}</span>
                        </div>
                      </div>
                    </button>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          staff.role === 'project_manager' || staff.role === 'web_developer'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : staff.role === 'admin'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : isDarkMode
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-slate-200 text-slate-600 border border-slate-300'
                        }`}
                      >
                        PIN: {defaultRolePin}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectStaff(staff, true)}
                        className="bg-red-500/15 hover:bg-[#E30000] text-red-400 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border border-red-500/30 cursor-pointer shadow-sm active:scale-95"
                        title={`Masuk langsung sebagai ${staff.name}`}
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Masuk</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-3 mt-6 text-center">
          <div className={`p-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700'} border rounded-2xl flex flex-col items-center gap-1`}>
            <Zap className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-medium">Auto-Fill PIN</span>
          </div>
          <div className={`p-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700'} border rounded-2xl flex flex-col items-center gap-1`}>
            <Smartphone className="w-4 h-4 text-sky-500" />
            <span className="text-[11px] font-medium">1-Klik Langsung Masuk</span>
          </div>
          <div className={`p-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700'} border rounded-2xl flex flex-col items-center gap-1`}>
            <Lock className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-medium">Keamanan Terproteksi</span>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-center text-[11px] text-slate-500 mt-6">
          Developed for obeecreatives &bull; Multi-Device Access Enabled
        </div>
      </div>
    </div>
  );
};
