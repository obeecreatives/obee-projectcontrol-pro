import React, { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, X, Wand2, ListChecks, FileText, Lightbulb, ArrowRight } from 'lucide-react';
import { aiService, GenerateCaptionParams, BrainstormParams, SummarizeRevisiParams } from '../services/aiService';
import { JenisKontenType, CardComment } from '../types';

export type AiMode = 'caption' | 'brainstorm' | 'summarize';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AiMode;
  isDarkMode?: boolean;
  // Context passed from ContentModal
  klien: string;
  tema?: string;
  ideKonten?: string;
  jenisKonten?: JenisKontenType;
  tipeProject?: string;
  comments?: CardComment[];
  // Callbacks to apply results directly
  onApplyCaption?: (captionText: string) => void;
  onApplyIdea?: (ideaText: string, temaText?: string) => void;
  onApplySummaryNote?: (summaryText: string) => void;
}

const TONE_OPTIONS = [
  { id: 'Casual, Hangat, & Menarik', label: 'Casual & Hangat (IG Feed/Story)' },
  { id: 'Storytelling & Emosional', label: 'Storytelling & Emosional' },
  { id: 'Gen-Z, Gaul, & Tren Terkini', label: 'Gen-Z & Trend (Reels/TikTok)' },
  { id: 'Profesional, Kredibel, & B2B', label: 'Profesional & B2B' },
  { id: 'Hard-Selling & Promo Mendesak', label: 'Hard-Selling & Promo' },
  { id: 'Edukatif & Informatif', label: 'Edukatif & Tips Berguna' },
];

const PLATFORM_OPTIONS = [
  'Instagram Feed / Carousel',
  'Instagram Reels / TikTok',
  'Instagram Story',
  'LinkedIn',
  'WhatsApp Broadcast',
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  mode,
  isDarkMode = true,
  klien,
  tema = '',
  ideKonten = '',
  jenisKonten = 'Single Post',
  tipeProject = 'Komersil',
  comments = [],
  onApplyCaption,
  onApplyIdea,
  onApplySummaryNote,
}) => {
  // Input settings
  const [selectedTone, setSelectedTone] = useState(TONE_OPTIONS[0].id);
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORM_OPTIONS[0]);
  const [customNotes, setCustomNotes] = useState('');

  // Execution states
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto trigger generation on open if no result yet
  React.useEffect(() => {
    if (isOpen && !resultText && !isLoading) {
      handleGenerate();
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setCopied(false);

    try {
      if (mode === 'caption') {
        const res = await aiService.generateCaption({
          klien,
          tema,
          ideKonten,
          jenisKonten,
          tone: selectedTone,
          platform: selectedPlatform,
          notes: customNotes,
        });
        setResultText(res);
      } else if (mode === 'brainstorm') {
        const res = await aiService.brainstormIdeas({
          klien,
          tipeProject,
          jenisKonten,
          tema,
        });
        setResultText(res);
      } else if (mode === 'summarize') {
        const res = await aiService.summarizeRevisi({
          cardTitle: ideKonten || tema || 'Konten',
          clientName: klien,
          comments: comments.map((c) => ({
            authorName: c.authorName,
            category: c.category,
            text: c.text,
          })),
        });
        setResultText(res);
      }
    } catch (err: any) {
      console.error('AI Error:', err);
      setErrorMsg(err.message || 'Gagal memproses permintaan AI. Pastikan server terhubung.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!resultText) return;

    if (mode === 'caption' && onApplyCaption) {
      onApplyCaption(resultText);
      onClose();
    } else if (mode === 'brainstorm' && onApplyIdea) {
      onApplyIdea(resultText, tema);
      onClose();
    } else if (mode === 'summarize' && onApplySummaryNote) {
      onApplySummaryNote(resultText);
      onClose();
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'caption':
        return 'AI Copywriter & Caption Studio';
      case 'brainstorm':
        return 'AI Creative Idea Brainstormer';
      case 'summarize':
        return 'AI Action-Items & Revisi Summarizer';
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'caption':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'brainstorm':
        return <Lightbulb className="w-5 h-5 text-amber-500" />;
      case 'summarize':
        return <ListChecks className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className={`${
          isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        } border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b ${
            isDarkMode ? 'border-slate-800 bg-[#1e293b]/70' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center shadow-inner shrink-0">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight">{getTitle()}</h3>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-red-600/20 text-red-500 border border-red-500/30">
                  Gemini Free Tier
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Klien: <span className="font-semibold text-red-400">{klien}</span> · Format: {jenisKonten}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar (for caption mode) */}
        {mode === 'caption' && (
          <div
            className={`px-5 sm:px-6 py-3 border-b flex flex-wrap items-center gap-3 text-xs ${
              isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-100/60'
            }`}
          >
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Gaya Bahasa (Tone):</label>
              <select
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className={`w-full rounded-lg px-2.5 py-1.5 border text-xs focus:outline-none focus:border-red-500 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                {TONE_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Platform:</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className={`w-full rounded-lg px-2.5 py-1.5 border text-xs focus:outline-none focus:border-red-500 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <input
                type="text"
                placeholder="Catatan tambahan (misal: tekankan promo beli 1 gratis 1)..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className={`w-full rounded-lg px-3 py-1.5 border text-xs focus:outline-none focus:border-red-500 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-[260px] max-h-[460px] flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="relative mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
                <Sparkles className="w-5 h-5 text-red-500 absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="font-bold text-sm mb-1">Gemini AI sedang berpikir...</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Menyusun copywriting kreatif dan ide strategis untuk <span className="font-semibold">{klien}</span>.
              </p>
            </div>
          ) : errorMsg ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-red-400">
              <p className="font-bold text-sm mb-1">Gagal memproses</p>
              <p className="text-xs text-slate-400 mb-4">{errorMsg}</p>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
            </div>
          ) : resultText ? (
            <div className="flex flex-col gap-3">
              <div
                className={`p-4 rounded-xl border text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans select-text ${
                  isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {resultText}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Wand2 className="w-8 h-8 text-red-500/60 mb-2" />
              <p className="text-xs">Klik tombol Generate di bawah untuk memulai bantuan AI.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`flex items-center justify-between px-5 sm:px-6 py-3.5 border-t gap-3 shrink-0 ${
            isDarkMode ? 'border-slate-800 bg-[#1e293b]/70' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGenerate}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isDarkMode
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                  : 'border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
              title="Generate ulang dengan variasi baru"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{resultText ? 'Generate Ulang' : 'Mulai Generate'}</span>
            </button>

            {resultText && (
              <button
                type="button"
                onClick={handleCopy}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  copied
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : isDarkMode
                    ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-300 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tutup
            </button>

            {resultText && (
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>
                  {mode === 'caption'
                    ? 'Gunakan Caption Ini'
                    : mode === 'brainstorm'
                    ? 'Terapkan Ide Ini'
                    : 'Sisipkan ke Diskusi'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
