import React, { useState } from 'react';
import { User, X, Check } from 'lucide-react';
import { INITIAL_STAFF } from '../data/seedData';

interface IdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIdentity: string;
  onSelectIdentity: (name: string) => void;
  isDarkMode?: boolean;
}

export const IdentityModal: React.FC<IdentityModalProps> = ({
  isOpen,
  onClose,
  currentIdentity,
  onSelectIdentity,
  isDarkMode = true,
}) => {
  const [customName, setCustomName] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onSelectIdentity(customName.trim());
    setCustomName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
      <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} border w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-[#1e293b]/70' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-red-500" />
            <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Kamu Siapa? (Identitas Lokal)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Pilih namamu agar kolom <b>Creator</b> otomatis terisi dan nama tercatat di feed riwayat aktivitas pada perangkat ini.
          </p>

          <div className="flex flex-col gap-2">
            {INITIAL_STAFF.map((staffName) => {
              const isSelected = currentIdentity === staffName;

              return (
                <button
                  key={staffName}
                  onClick={() => {
                    onSelectIdentity(staffName);
                    onClose();
                  }}
                  className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-red-500/10 border-red-500 text-red-500 font-bold'
                      : isDarkMode
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm">{staffName}</span>
                  {isSelected && <Check className="w-4 h-4 text-red-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Custom name input */}
          <form onSubmit={handleCustomSubmit} className={`pt-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex flex-col gap-2`}>
            <label className="text-xs font-semibold text-slate-400">Atau ketik nama lain:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="misal: Tim Desain..."
                className={`flex-1 ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'} border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500`}
              />
              <button
                type="submit"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'}`}
              >
                Pilih
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800 bg-[#1e293b]/40' : 'border-slate-200 bg-slate-50'} flex justify-end`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} rounded-xl text-xs font-semibold cursor-pointer`}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
