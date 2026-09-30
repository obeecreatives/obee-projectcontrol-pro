import React, { useState } from 'react';
import { GeneralLink, UserRole } from '../types';
import { ROLES } from '../data/seedData';
import {
  Link2,
  ExternalLink,
  MessageCircle,
  Mail,
  Plus,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';

interface GeneralLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: GeneralLink[];
  onSaveLink: (link: Partial<GeneralLink>) => void;
  onDeleteLink: (id: string) => void;
  activeRole: UserRole;
  isDarkMode?: boolean;
}

export const GeneralLinksModal: React.FC<GeneralLinksModalProps> = ({
  isOpen,
  onClose,
  links,
  onSaveLink,
  onDeleteLink,
  activeRole,
  isDarkMode = true,
}) => {
  const roleConfig = ROLES[activeRole] || ROLES.project_manager;

  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartEdit = (link: GeneralLink) => {
    setEditingId(link.ID);
    setLabel(link.Label);
    setUrl(link.URL);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setLabel('');
    setUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return;

    onSaveLink({
      ...(editingId ? { ID: editingId } : {}),
      Label: label.trim(),
      URL: url.trim(),
    });

    handleCancelEdit();
  };

  const shareSingleWhatsApp = (link: GeneralLink) => {
    const text = `Link Project - ${link.Label}:\n${link.URL}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareSingleEmail = (link: GeneralLink) => {
    const subject = `Link Project: ${link.Label}`;
    const body = `${link.Label}\n${link.URL}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareAllWhatsApp = () => {
    if (links.length === 0) return;
    const text =
      `*Link Utama Project - obeecreatives*\n\n` +
      links.map((l) => `• *${l.Label}*\n${l.URL}`).join('\n\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareAllEmail = () => {
    if (links.length === 0) return;
    const subject = `Link Utama Project - obeecreatives`;
    const body = links.map((l) => `${l.Label}:\n${l.URL}`).join('\n\n');
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
      <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} border w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-[#1e293b]/70' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-sky-500" />
            <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Link Utama Project</h3>
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
            Link umum referensi seluruh project obeecreatives (folder Google Drive utama, brand guideline, template Canva & CapCut). Dapat dibagikan langsung ke WhatsApp atau Email.
          </p>

          {/* Bulk Share Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={shareAllWhatsApp}
              className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-800/60' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'} border px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Share Semua ke WhatsApp</span>
            </button>
            <button
              onClick={shareAllEmail}
              className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'} border px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Share Semua ke Email</span>
            </button>
          </div>

          {/* Links List */}
          <div className="flex flex-col gap-2.5">
            {links.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Belum ada link tersimpan. Tambahkan link baru di bawah.
              </div>
            ) : (
              links.map((link) => (
                <div
                  key={link.ID}
                  className={`p-3 rounded-xl border ${isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50'} flex items-center justify-between gap-3`}
                >
                  <div className="flex-1 min-w-0">
                    <a
                      href={link.URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`font-bold text-sm ${isDarkMode ? 'text-slate-100 hover:text-red-400' : 'text-slate-900 hover:text-red-600'} flex items-center gap-1.5 truncate`}
                    >
                      <span>{link.Label}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </a>
                    <span className="text-xs text-slate-400 truncate block mt-0.5">{link.URL}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => shareSingleWhatsApp(link)}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 transition-colors cursor-pointer"
                      title="Share ke WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => shareSingleEmail(link)}
                      className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300'} border transition-colors cursor-pointer`}
                      title="Share ke Email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(link)}
                      className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300'} border transition-colors cursor-pointer`}
                      title="Edit Link"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {roleConfig.canDelete && (
                      <button
                        onClick={() => onDeleteLink(link.ID)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors cursor-pointer"
                        title="Hapus Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add / Edit Form */}
          <form
            onSubmit={handleSubmit}
            className={`p-4 rounded-xl border ${isDarkMode ? 'border-slate-800 bg-[#1e293b]/60' : 'border-slate-200 bg-slate-50'} flex flex-col gap-3 mt-1`}
          >
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {editingId ? 'Edit Link' : 'Tambah Link Baru'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label Link (misal: Drive Master)"
                className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-white text-slate-900 border-slate-300'} border rounded-lg px-3 py-2 focus:outline-none focus:border-red-500`}
              />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-white text-slate-900 border-slate-300'} border rounded-lg px-3 py-2 focus:outline-none focus:border-red-500`}
              />
            </div>

            <div className="flex items-center gap-2 justify-end">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className={`px-3 py-1.5 text-xs ${isDarkMode ? 'text-slate-300 hover:text-white bg-slate-800' : 'text-slate-700 hover:text-slate-900 bg-slate-200'} rounded-lg transition-colors cursor-pointer`}
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-[#E30000] hover:bg-[#c00000] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-transform active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{editingId ? 'Update Link' : '+ Tambah Link'}</span>
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
