import React, { useState } from 'react';
import { RateCardItem, UserRole } from '../types';
import { CreditCard, Save, CheckCircle2, Archive } from 'lucide-react';

interface RateCardViewProps {
  rates: RateCardItem[];
  onSaveRate: (rate: RateCardItem) => void;
  activeRole: UserRole;
  isDarkMode?: boolean;
}

export const RateCardView: React.FC<RateCardViewProps> = ({ rates, onSaveRate, isDarkMode = true }) => {
  const [localRates, setLocalRates] = useState<RateCardItem[]>(rates);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  React.useEffect(() => {
    setLocalRates(rates);
  }, [rates]);

  const handleRateChange = (jenisKonten: string, value: string) => {
    const num = parseInt(value, 10) || 0;
    setLocalRates((prev) =>
      prev.map((r) => (r.JenisKonten === jenisKonten ? { ...r, RatePerKonten: num } : r))
    );
  };

  const handleSave = (item: RateCardItem) => {
    onSaveRate(item);
    setSavedKey(item.JenisKonten);
    setTimeout(() => setSavedKey(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header Panel */}
      <div className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 transition-colors`}>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-500" />
          <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Rate Pembayaran per Jenis Konten</h3>
        </div>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Nominal ini otomatis diterapkan saat status konten diubah menjadi <b>Approved / RtP</b> (khusus project <b>Komersil</b>). Konten <b>Internal</b> selalu Rp0. Perubahan berlaku untuk konten yang statusnya disetujui setelahnya.
        </p>
      </div>

      {/* Rate List */}
      <div className={`${isDarkMode ? 'bg-[#0f172a]/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 flex flex-col gap-3 transition-colors`}>
        {localRates.map((rate) => {
          const isJustSaved = savedKey === rate.JenisKonten;

          return (
            <div
              key={rate.JenisKonten}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                    rate.Kategori === 'Video'
                      ? 'bg-sky-500/20 text-sky-500 border border-sky-500/40'
                      : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                  }`}
                >
                  {rate.Kategori}
                </span>
                <div>
                  <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{rate.JenisKonten}</h4>
                  <span className="text-[11px] text-slate-400">Tarif per konten disetujui</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={rate.RatePerKonten}
                    onChange={(e) => handleRateChange(rate.JenisKonten, e.target.value)}
                    className={`w-36 pl-10 pr-3 py-1.5 ${isDarkMode ? 'bg-slate-950 text-slate-100 border-slate-700' : 'bg-white text-slate-900 border-slate-300'} border rounded-xl font-mono text-sm focus:outline-none focus:border-red-500 font-bold`}
                  />
                </div>

                <button
                  onClick={() => handleSave(rate)}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-transform active:scale-[0.98] cursor-pointer"
                >
                  {isJustSaved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>Tersimpan</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Archive Policy Note */}
      <div className={`${isDarkMode ? 'bg-[#1e293b]/50 border-slate-800' : 'bg-slate-100 border-slate-200'} border rounded-2xl p-5 flex flex-col gap-3 transition-colors`}>
        <div className="flex items-center gap-2">
          <Archive className="w-5 h-5 text-amber-500" />
          <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Kebijakan Arsip Otomatis</h4>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Konten berstatus <b>Published</b> yang lebih tua dari 1 bulan otomatis diarsipkan agar performa Content Board tetap secepat kilat (0.01 detik). Data arsip tetap tersimpan aman di spreadsheet dan tetap ikut terhitung dalam laporan tahunan.
        </p>
      </div>
    </div>
  );
};
