import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  X,
  Wand2,
  ListChecks,
  FileText,
  Lightbulb,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { JenisKontenType, CardComment } from '../types';

export type AiMode = 'caption' | 'brainstorm' | 'summarize';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AiMode;
  isDarkMode?: boolean;
  klien: string;
  tema?: string;
  ideKonten?: string;
  jenisKonten?: JenisKontenType;
  tipeProject?: string;
  comments?: CardComment[];
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

  // Trigger generation automatically whenever modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setResultText('');
      setErrorMsg('');
      setCopied(false);
      handleGenerate();
    }
  }, [isOpen, mode, klien]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setCopied(false);

    try {
      if (mode === 'caption') {
        const res = await aiService.generateCaption({
          klien: klien || 'Brand Studio',
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
          klien: klien || 'Brand Studio',
          tipeProject,
          jenisKonten,
          tema,
        });
        setResultText(res);
      } else if (mode === 'summarize') {
        const res = await aiService.summarizeRevisi({
          cardTitle: ideKonten || tema || 'Konten',
          clientName: klien || 'Klien',
          comments: comments.map((c) => ({
            authorName: c.authorName,
            category: c.category,
            text: c.text,
          })),
        });
        setResultText(res);
      }
    } catch (err: any) {
      console.error('AI Processing Error:', err);
      setErrorMsg(err.message || 'Gagal memproses permintaan AI.');
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
        return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
      case 'brainstorm':
        return <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />;
      case 'summarize':
        return <ListChecks className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />;
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div
        className={`${
          isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        } border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col h-[94vh] max-h-[94vh] sm:h-auto sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3.5 border-b shrink-0 ${
            isDarkMode ? 'border-slate-800 bg-[#1e293b]/80' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center shadow-inner shrink-0">
              {getIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="font-bold text-sm sm:text-base tracking-tight truncate">{getTitle()}</h3>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 shrink-0">
                  Gemini Free
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Klien: <span className="font-semibold text-red-400">{klien || 'Umum'}</span> · Format: {jenisKonten}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar (for caption mode) */}
        {mode === 'caption' && (
          <div
            className={`px-4 py-2 sm:px-6 sm:py-2.5 border-b flex flex-wrap items-center gap-2 text-xs shrink-0 ${
              isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-100/60'
            }`}
          >
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">Gaya Bahasa (Tone):</label>
              <select
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className={`w-full rounded-lg px-2 py-1 border text-xs focus:outline-none focus:border-red-500 ${
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

            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">Platform:</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className={`w-full rounded-lg px-2 py-1 border text-xs focus:outline-none focus:border-red-500 ${
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
                className={`w-full rounded-lg px-2.5 py-1 border text-xs focus:outline-none focus:border-red-500 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>
        )}

        {/* Content Body (Flex-1 with min-h-0 and internal scroll) */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 min-h-0 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center my-auto">
              <div className="relative mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="font-bold text-sm mb-1 text-slate-200">Gemini AI sedang menyusun ide...</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Menganalisis profil <span className="font-semibold text-red-400">{klien || 'klien'}</span> dan merancang rekomendasi kreatif.
              </p>
            </div>
          ) : errorMsg ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center my-auto">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-2">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="font-bold text-sm text-red-400 mb-1">Terjadi Kendala</p>
              <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">{errorMsg}</p>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Lagi Sekarang</span>
              </button>
            </div>
          ) : resultText ? (
            <div className="flex-1 flex flex-col">
              <div
                className={`p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans select-text flex-1 overflow-y-auto ${
                  isDarkMode
                    ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {resultText}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 my-auto">
              <Wand2 className="w-8 h-8 text-red-500/60 mb-2" />
              <p className="text-xs">Klik tombol Generate di bawah untuk memulai bantuan AI.</p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions (Always Pinned At Bottom) */}
        <div
          className={`flex items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3 border-t gap-2 shrink-0 ${
            isDarkMode ? 'border-slate-800 bg-[#1e293b]/80' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGenerate}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isDarkMode
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                  : 'border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
              title="Generate ulang dengan variasi baru"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{resultText ? 'Generate Ulang' : 'Mulai'}</span>
            </button>

            {resultText && (
              <button
                type="button"
                onClick={handleCopy}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  copied
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : isDarkMode
                    ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-300 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tutup
            </button>

            {resultText && (
              <button
                type="button"
                onClick={handleApply}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span className="truncate max-w-[150px] sm:max-w-none">
                  {mode === 'caption'
                    ? 'Gunakan Caption'
                    : mode === 'brainstorm'
                    ? 'Terapkan Ide'
                    : 'Sisipkan ke Chat'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
