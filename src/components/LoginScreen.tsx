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

  const handleSelectStaff = (staff: StaffUser) => {
    setEmailInput(staff.email);
    setErrorMessage('');
    setTimeout(() => {
      pinInputRef.current?.focus();
    }, 100);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const targetEmail = emailInput.trim();
    if (!targetEmail) {
      setErrorMessage('Silakan masukkan atau pilih email akun staf Anda.');
      return;
    }

    if (!pinInput.trim()) {
      setErrorMessage('Silakan masukkan PIN keamanan Anda (bawaan: 1234 untuk staf / 8888 untuk admin).');
      pinInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    const res = authService.loginWithPin(targetEmail, pinInput.trim());
    setIsSubmitting(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.error || 'Akses ditolak. PIN keamanan tidak cocok.');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#070b12] text-slate-100' : 'bg-slate-50 text-slate-800'} flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden transition-colors`}>
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

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
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Email Akun Staf (Gmail)
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
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
                <span className={`text-[11px] font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Default: <code className="text-emerald-500 font-bold bg-slate-800/40 px-1.5 py-0.5 rounded">{defaultPasswords.staffDefault}</code> staf / <code className="text-red-500 font-bold bg-slate-800/40 px-1.5 py-0.5 rounded">{defaultPasswords.adminDefault}</code> admin
                </span>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={pinInputRef}
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Masukkan password atau PIN Anda..."
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
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-medium animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#E30000] hover:bg-[#c00000] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 active:scale-[0.99] cursor-pointer"
            >
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
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
                <span>Atau Pilih Akun Staf Resmi ({directory.length})</span>
              </button>
            </div>
          </div>

          {/* Quick Select Roster */}
          {showDirectory && (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {directory.map((staff) => {
                const isSelected = emailInput.toLowerCase() === staff.email.toLowerCase();
                return (
                  <button
                    key={staff.email}
                    type="button"
                    onClick={() => handleSelectStaff(staff)}
                    className={`w-full group text-left p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-red-500/80 bg-red-950/20 ring-1 ring-red-500/30'
                        : isDarkMode
                        ? 'border-slate-800/80 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800/70'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
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
                    </div>

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
                        {staff.role === 'project_manager'
                          ? 'PM / Full'
                          : staff.role === 'web_developer'
                          ? 'Web Dev / Full'
                          : staff.role === 'admin'
                          ? 'Admin'
                          : 'Staff Creator'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-3 mt-6 text-center">
          <div className={`p-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700'} border rounded-2xl flex flex-col items-center gap-1`}>
            <Zap className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-medium">Respons 0.01 Detik</span>
          </div>
          <div className={`p-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700'} border rounded-2xl flex flex-col items-center gap-1`}>
            <Smartphone className="w-4 h-4 text-sky-500" />
            <span className="text-[11px] font-medium">Lancar di HP</span>
          </div>
          <div className={`p-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700'} border rounded-2xl flex flex-col items-center gap-1`}>
            <Lock className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-medium">Aman dengan PIN</span>
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
