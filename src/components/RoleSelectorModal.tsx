import React from 'react';
import { UserRole } from '../types';
import { ROLES } from '../data/seedData';
import { ShieldCheck, X, Check } from 'lucide-react';

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  isDarkMode?: boolean;
}

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  isOpen,
  onClose,
  activeRole,
  onSelectRole,
  isDarkMode = true,
}) => {
  if (!isOpen) return null;

  const primaryRoleIds: UserRole[] = [
    'project_manager',
    'web_developer',
    'admin',
    'staff_creator',
    'client',
  ];
  const roleList = primaryRoleIds.map((id) => ROLES[id]).filter(Boolean);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
      <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} border w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-[#1e293b]/70' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Role-Based Access Control (RBAC)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles List */}
        <div className="p-6 overflow-y-auto flex flex-col gap-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            Pilih peran pengguna untuk menguji pembatasan hak akses (hak approve status, perubahan Rate Card, dan privasi angka fee).
          </p>

          <div className="flex flex-col gap-2.5">
            {roleList.map((r) => {
              const isSelected = activeRole === r.id;

              return (
                <button
                  key={r.id}
                  onClick={() => {
                    onSelectRole(r.id);
                    onClose();
                  }}
                  className={`text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-red-500/10 border-red-500 ring-2 ring-red-500/20'
                      : isDarkMode
                      ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{r.title}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${r.badgeColor}`}
                      >
                        {r.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{r.description}</p>
                  </div>

                  <div className="shrink-0 mt-1">
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
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
