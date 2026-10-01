import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  Laptop,
  CheckCircle2,
  Share2,
  PlusSquare,
  X,
  ExternalLink,
  Info,
} from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'sidebar' | 'drawer' | 'banner';
  isDarkMode?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  isDarkMode = true,
}) => {
  const { isInstallable, isInstalled, isStandalone, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');

  // If already running as an installed standalone PWA, hide install triggers
  if (isStandalone) {
    return null;
  }

  const handleTriggerClick = async () => {
    // If browser supports direct native prompt, launch it
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        // If user cancelled or dismissed, or if prompt didn't fire, show modal guide
        setShowModal(true);
      }
    } else {
      // If native beforeinstallprompt is not available (e.g. iOS Safari, or already running in browser)
      if (isIOS) {
        setActiveTab('ios');
      } else {
        // Default to device detection
        const isMobile = /android|iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
        setActiveTab(isMobile ? 'android' : 'desktop');
      }
      setShowModal(true);
    }
  };

  // Render trigger based on variant
  const renderTrigger = () => {
    if (variant === 'sidebar') {
      return (
        <button
          onClick={handleTriggerClick}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isDarkMode
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
              : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
          }`}
          title="Install Aplikasi ke HP atau Laptop/PC"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span className="truncate">Install Web App</span>
        </button>
      );
    }

    if (variant === 'drawer') {
      return (
        <button
          onClick={handleTriggerClick}
          className={`flex items-center gap-2 p-3 ${
            isDarkMode
              ? 'bg-red-950/40 border-red-800/40 text-red-400 hover:bg-red-950/60'
              : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          } border rounded-xl text-left font-semibold cursor-pointer`}
        >
          <Download className="w-4 h-4 text-red-500" />
          <div className="flex flex-col">
            <span className="text-xs font-bold">Install Aplikasi</span>
            <span className="text-[10px] text-slate-400 font-normal">Pasang di HP / Laptop</span>
          </div>
        </button>
      );
    }

    // Default: 'navbar'
    return (
      <button
        onClick={handleTriggerClick}
        className={`flex items-center gap-1.5 text-xs font-bold p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all cursor-pointer ${
          isDarkMode
            ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300'
            : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700'
        }`}
        title="Pasang aplikasi ini ke HP (Android/iOS) atau PC/Laptop"
      >
        <Download className="w-4 h-4 text-red-500" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  };

  return (
    <>
      {renderTrigger()}

      {/* Comprehensive Install Guide Modal */}
      {showModal && typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <div
              className={`w-full max-w-lg max-h-[82vh] rounded-2xl border ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              } shadow-2xl overflow-hidden flex flex-col`}
            >
              {/* Header */}
              <div className={`p-4 sm:px-5 sm:py-4 border-b shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} flex items-center justify-between`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                    oc
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold">Install obeecreatives OS</h3>
                    <p className="text-xs text-slate-400">Jalankan layaknya aplikasi native tanpa browser</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'} cursor-pointer shrink-0 ml-2`}
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Platform Selector Tabs */}
              <div className={`grid grid-cols-3 border-b text-xs font-semibold shrink-0 ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50'}`}>
                <button
                  onClick={() => setActiveTab('android')}
                  className={`py-2.5 flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
                    activeTab === 'android'
                      ? 'border-red-500 text-red-500 font-bold bg-red-500/10'
                      : isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>HP Android</span>
                </button>
                <button
                  onClick={() => setActiveTab('ios')}
                  className={`py-2.5 flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
                    activeTab === 'ios'
                      ? 'border-red-500 text-red-500 font-bold bg-red-500/10'
                      : isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>iPhone / iPad</span>
                </button>
                <button
                  onClick={() => setActiveTab('desktop')}
                  className={`py-2.5 flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
                    activeTab === 'desktop'
                      ? 'border-red-500 text-red-500 font-bold bg-red-500/10'
                      : isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>PC & Laptop</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-4 text-xs">
                {/* Direct Instant Action for supported browsers */}
                {isInstallable && (
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isDarkMode ? 'bg-red-950/30 border-red-800/40' : 'bg-red-50 border-red-200'
                  }`}>
                    <div>
                      <div className="font-bold text-red-500 text-sm">Browser Mendukung Install Otomatis!</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Klik tombol berikut untuk langsung menambahkan ke layar utama.</div>
                    </div>
                    <button
                      onClick={async () => {
                        const res = await install();
                        if (res) setShowModal(false);
                      }}
                      className="bg-[#E30000] hover:bg-[#c00000] text-white font-bold px-4 py-2 rounded-xl text-xs shrink-0 shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      Install Sekarang
                    </button>
                  </div>
                )}

                {activeTab === 'android' && (
                  <div className="space-y-3">
                    <div className={`font-bold text-sm flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      <Smartphone className="w-4 h-4 text-red-500" />
                      <span>Panduan Pasang di HP Android (Chrome / Edge / Samsung Internet):</span>
                    </div>
                    <ol className={`space-y-2.5 list-decimal list-inside pl-1 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <li className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                        Buka menu browser dengan menekan ikon <b>titik tiga (⋮)</b> di pojok kanan atas browser.
                      </li>
                      <li className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                        Pilih menu <b>"Install app"</b> atau <b>"Tambahkan ke Layar Utama" (Add to Home screen)</b>.
                      </li>
                      <li className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                        Konfirmasi dengan menekan <b>Install</b>. Ikon <b>obee OS</b> akan muncul di daftar aplikasi HP Anda layaknya aplikasi Play Store.
                      </li>
                    </ol>
                  </div>
                )}

                {activeTab === 'ios' && (
                  <div className="space-y-3">
                    <div className={`font-bold text-sm flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      <Share2 className="w-4 h-4 text-red-500" />
                      <span>Panduan Pasang di iPhone / iPad (Safari):</span>
                    </div>
                    <ol className={`space-y-2.5 list-decimal list-inside pl-1 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <li className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                        Pastikan Anda membuka aplikasi ini menggunakan browser <b>Safari</b>.
                      </li>
                      <li className={`p-2.5 rounded-lg border flex items-center gap-2 ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                        <span>Tekan tombol <b>Share</b></span>
                        <Share2 className="w-4 h-4 text-sky-400 inline" />
                        <span>di bilah bawah Safari.</span>
                      </li>
                      <li className={`p-2.5 rounded-lg border flex items-center gap-2 ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                        <span>Geser ke bawah lalu pilih</span>
                        <PlusSquare className="w-4 h-4 text-emerald-400 inline" />
                        <b>"Add to Home Screen" (Tambah ke Layar Utama)</b>.
                      </li>
                      <li className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                        Tekan <b>"Add" (Tambah)</b> di pojok kanan atas. Aplikasi akan langsung terpasang di Home Screen iPhone/iPad Anda dalam mode fullscreen native!
                      </li>
                    </ol>
                  </div>
                )}

                {activeTab === 'desktop' && (
                  <div className="space-y-3">
                    <div className={`font-bold text-sm flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      <Laptop className="w-4 h-4 text-red-500" />
                      <span>Panduan Pasang di PC & Laptop (Windows, Mac, Linux):</span>
                    </div>
                    <ol className={`space-y-2.5 list-decimal list-inside pl-1 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <li className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                        Pada browser Chrome / Edge / Brave, perhatikan <b>bilah alamat (Address bar / URL bar)</b> di bagian atas kanan.
                      </li>
                      <li className={`p-2.5 rounded-lg border flex items-center gap-2 ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                        <span>Klik ikon <b>Install / Pasang Aplikasi</b></span>
                        <Download className="w-4 h-4 text-red-500 inline" />
                        <span>di dalam kotak alamat URL.</span>
                      </li>
                      <li className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                        Atau klik menu <b>titik tiga (⋮) &gt; Simpan dan bagikan (Cast, save, and share) &gt; Install obeecreatives Workspace OS</b>.
                      </li>
                      <li className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                        Aplikasi akan terbuka di jendela mandiri (Standalone Window) tanpa bilah browser, dengan ikon di Desktop & Taskbar!
                      </li>
                    </ol>
                  </div>
                )}

                {/* Benefits badge */}
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 shrink-0 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <b>Keunggulan Mode Terpasang (PWA):</b> Lebih cepat dibuka, berjalan offline dengan cache lokal, notifikasi lebih responsif, dan tampilan layar penuh seperti aplikasi native.
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`p-4 border-t shrink-0 ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50'} flex justify-end gap-2`}>
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
