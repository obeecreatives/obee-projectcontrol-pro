import React, { useState, useMemo, useRef } from 'react';
import { ContentItem, UserRole, StatusType, TipeProjectType } from '../types';
import { normalizeClientName, normalizeCreatorName } from '../data/seedData';
import { storageService } from '../services/storageService';
import { ContentCard } from './ContentCard';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Columns,
} from 'lucide-react';

interface KanbanBoardProps {
  items: ContentItem[];
  activeRole: UserRole;
  onEditItem: (item: ContentItem) => void;
  onDeleteItem: (id: string) => void;
  onStatusChange: (id: string, newStatus: StatusType) => void;
  onToggleChecklist: (id: string, field: 'ChecklistAsset' | 'ChecklistCaption', value: boolean) => void;
  onOpenNewContentModal: () => void;
  isDarkMode?: boolean;
}

const COLUMNS: { id: StatusType; label: string; color: string; dotColor: string }[] = [
  { id: 'New Idea', label: 'New Idea', color: 'border-slate-500', dotColor: 'bg-slate-400' },
  { id: 'On Progress', label: 'On Progress', color: 'border-amber-500', dotColor: 'bg-amber-400' },
  { id: 'Request Approval', label: 'Request Approval', color: 'border-blue-500', dotColor: 'bg-blue-400' },
  { id: 'Approved / RtP', label: 'Approved / RtP', color: 'border-emerald-500', dotColor: 'bg-emerald-400' },
  { id: 'Scheduling', label: 'Scheduling', color: 'border-teal-500', dotColor: 'bg-teal-400' },
  { id: 'Published', label: 'Published', color: 'border-indigo-500', dotColor: 'bg-indigo-400' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  items,
  activeRole,
  onEditItem,
  onDeleteItem,
  onStatusChange,
  onToggleChecklist,
  onOpenNewContentModal,
  isDarkMode = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKlien, setSelectedKlien] = useState<string>('ALL');
  const [selectedTipe, setSelectedTipe] = useState<'ALL' | TipeProjectType>('ALL');
  const [selectedCreator, setSelectedCreator] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState<'fit' | 'scroll'>('fit');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollPercent(Math.round((scrollLeft / maxScroll) * 100));
    }
  };

  const scrollByAmount = (px: number) => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: px, behavior: 'smooth' });
  };

  const scrollToPercent = (percent: number) => {
    if (!scrollContainerRef.current) return;
    const { scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    scrollContainerRef.current.scrollTo({
      left: (percent / 100) * maxScroll,
      behavior: 'smooth',
    });
    setScrollPercent(percent);
  };

  const clientList = useMemo(() => {
    const set = new Set<string>();
    storageService.getCrmClients().forEach((c) => {
      if (c.company) set.add(normalizeClientName(c.company));
    });
    items.forEach((it) => {
      if (it.Klien) set.add(normalizeClientName(it.Klien));
    });
    return Array.from(set).sort();
  }, [items]);

  const creatorList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.Creator) set.add(normalizeCreatorName(it.Creator));
    });
    return Array.from(set).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          it.Tema?.toLowerCase().includes(q) ||
          it.IdeKonten?.toLowerCase().includes(q) ||
          it.Detail?.toLowerCase().includes(q) ||
          it.Klien?.toLowerCase().includes(q) ||
          it.Creator?.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (selectedKlien !== 'ALL' && normalizeClientName(it.Klien) !== selectedKlien) {
        return false;
      }

      if (selectedTipe !== 'ALL' && it.TipeProject !== selectedTipe) {
        return false;
      }

      if (selectedCreator !== 'ALL' && normalizeCreatorName(it.Creator) !== selectedCreator) {
        return false;
      }

      if (startDate && it.TanggalProduksi && it.TanggalProduksi < startDate) {
        return false;
      }
      if (endDate && it.TanggalProduksi && it.TanggalProduksi > endDate) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, selectedKlien, selectedTipe, selectedCreator, startDate, endDate]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedKlien('ALL');
    setSelectedTipe('ALL');
    setSelectedCreator('ALL');
    setStartDate('');
    setEndDate('');
  };

  const isFiltered =
    Boolean(searchQuery) ||
    selectedKlien !== 'ALL' ||
    selectedTipe !== 'ALL' ||
    selectedCreator !== 'ALL' ||
    Boolean(startDate) ||
    Boolean(endDate);

  return (
    <div className="flex flex-col gap-4">
      {/* Filter and Control Toolbar */}
      <div className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-4 flex flex-col gap-3 transition-colors`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search box & Add Content button */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[240px] max-w-xl">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ide, tema, klien, atau creator..."
                className={`w-full pl-10 pr-4 py-2 text-sm ${isDarkMode ? 'bg-slate-900/90 text-slate-100 placeholder-slate-500 border-slate-700' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-300'} border rounded-xl focus:outline-none focus:border-red-500`}
              />
            </div>

            {/* + Tambah Konten Button */}
            <button
              onClick={onOpenNewContentModal}
              className="flex items-center gap-1.5 bg-[#E30000] hover:bg-[#c00000] text-white px-3 sm:px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-red-950/30 transition-all active:scale-[0.98] shrink-0 cursor-pointer"
              title="Tambah Konten Baru"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Konten</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 ml-auto">
            {/* View Mode Toggle: Fit 6 Kolom vs Mode Scroll */}
            <div className={`flex items-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'} border rounded-lg p-0.5`}>
              <button
                onClick={() => setViewMode('fit')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'fit'
                    ? 'bg-red-600 text-white shadow-sm'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilkan semua 6 kolom sekaligus dalam 1 layar"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Fit 6 Kolom</span>
              </button>
              <button
                onClick={() => setViewMode('scroll')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'scroll'
                    ? 'bg-red-600 text-white shadow-sm'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mode kolom lebar dengan bilah geser"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Mode Scroll</span>
              </button>
            </div>

            {/* Content Summary Count */}
            <div className={`text-xs ${isDarkMode ? 'text-slate-400 bg-slate-900/60 border-slate-800' : 'text-slate-600 bg-slate-100 border-slate-200'} border px-3 py-1.5 rounded-xl shrink-0 font-medium`}>
              Menampilkan <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} tabular-nums`}>{filteredItems.length}</span> dari{' '}
              <span className="tabular-nums">{items.length}</span> konten
            </div>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className={`flex flex-wrap items-center gap-2 pt-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} text-xs`}>
          {/* Klien filter */}
          <div className="flex items-center gap-1.5">
            <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} font-medium`}>Klien:</span>
            <select
              value={selectedKlien}
              onChange={(e) => setSelectedKlien(e.target.value)}
              className={`${isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500`}
            >
              <option value="ALL">Semua Klien ({clientList.length})</option>
              {clientList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Tipe Project filter */}
          <div className="flex items-center gap-1.5">
            <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} font-medium`}>Tipe:</span>
            <select
              value={selectedTipe}
              onChange={(e) => setSelectedTipe(e.target.value as 'ALL' | TipeProjectType)}
              className={`${isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500`}
            >
              <option value="ALL">Semua Tipe</option>
              <option value="Komersil">Komersil (Spreadsheet CRM)</option>
              <option value="Internal">Internal Studio (Rp0)</option>
            </select>
          </div>

          {/* Creator filter */}
          <div className="flex items-center gap-1.5">
            <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} font-medium`}>Creator:</span>
            <select
              value={selectedCreator}
              onChange={(e) => setSelectedCreator(e.target.value)}
              className={`${isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500`}
            >
              <option value="ALL">Semua Creator</option>
              {creatorList.map((cr) => (
                <option key={cr} value={cr}>
                  {cr}
                </option>
              ))}
            </select>
          </div>

          {/* Date range inputs */}
          <div className="flex items-center gap-1.5">
            <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} font-medium`}>Periode:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-lg px-2 py-1 focus:outline-none focus:border-red-500 font-mono`}
              title="Dari tanggal produksi"
            />
            <span className="text-slate-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`${isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-lg px-2 py-1 focus:outline-none focus:border-red-500 font-mono`}
              title="Sampai tanggal produksi"
            />
          </div>

          {/* Reset filter button */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300'} px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ml-auto`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Navigator Slider Bar (Visible when in Scroll Mode) */}
      {viewMode === 'scroll' && (
        <div className={`${isDarkMode ? 'bg-[#0f172a]/95 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-2.5 sm:p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md transition-colors`}>
          <div className="flex items-center gap-2 w-full md:w-auto justify-between sm:justify-start">
            <button
              onClick={() => scrollByAmount(-300)}
              className={`flex items-center gap-1.5 px-3 py-1.5 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'} text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-sm`}
              title="Geser ke kiri"
            >
              <ChevronLeft className="w-4 h-4 text-red-500" />
              <span>Geser Kiri</span>
            </button>

            <button
              onClick={() => scrollByAmount(300)}
              className={`flex items-center gap-1.5 px-3 py-1.5 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'} text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-sm`}
              title="Geser ke kanan"
            >
              <span>Geser Kanan</span>
              <ChevronRight className="w-4 h-4 text-red-500" />
            </button>
          </div>

          {/* Interactive Slider Bar */}
          <div className="flex-1 w-full max-w-md flex items-center gap-2.5 px-2">
            <span className="text-[11px] font-medium text-slate-400 shrink-0">Kolom 1</span>
            <input
              type="range"
              min="0"
              max="100"
              value={scrollPercent}
              onChange={(e) => scrollToPercent(Number(e.target.value))}
              className={`w-full h-2.5 ${isDarkMode ? 'bg-slate-800 border-slate-700/60' : 'bg-slate-200 border-slate-300'} rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400 border`}
              title="Geser untuk melihat kolom"
            />
            <span className="text-[11px] font-medium text-slate-400 shrink-0">Kolom 6</span>
          </div>

          {/* Quick Jump Shortcuts */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto w-full md:w-auto justify-center md:justify-end">
            <button
              onClick={() => scrollToPercent(0)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors border cursor-pointer ${
                scrollPercent < 25
                  ? 'bg-red-500/20 text-red-500 border-red-500/40 font-semibold'
                  : isDarkMode ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              Ide & Progress
            </button>
            <button
              onClick={() => scrollToPercent(50)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors border cursor-pointer ${
                scrollPercent >= 25 && scrollPercent <= 75
                  ? 'bg-blue-500/20 text-blue-500 border-blue-500/40 font-semibold'
                  : isDarkMode ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              Approval & RtP
            </button>
            <button
              onClick={() => scrollToPercent(100)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors border cursor-pointer ${
                scrollPercent > 75
                  ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40 font-semibold'
                  : isDarkMode ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              Publish & Selesai
            </button>
          </div>
        </div>
      )}

      {/* 6 Kanban Columns */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={
          viewMode === 'fit'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 items-start w-full'
            : 'flex gap-3.5 items-start overflow-x-auto pb-4 pt-1 select-none scroll-smooth'
        }
      >
        {COLUMNS.map((col) => {
          const colItems = filteredItems.filter((it) => it.Status === col.id);

          return (
            <div
              key={col.id}
              className={`${
                isDarkMode ? 'bg-[#0f172a]/90 border-slate-800 shadow-lg' : 'bg-slate-100/90 border-slate-200/80 shadow-sm'
              } border rounded-2xl p-2.5 min-h-[420px] flex flex-col gap-2.5 transition-colors ${
                viewMode === 'fit' ? 'w-full min-w-0' : 'w-[280px] shrink-0'
              }`}
            >
              {/* Column Header */}
              <div className={`flex flex-col gap-1 pb-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${col.dotColor}`} />
                    <h3 className={`font-bold text-xs sm:text-sm tracking-tight truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {col.label}
                    </h3>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-700 border-slate-200'}`}>
                    {colItems.length}
                  </span>
                </div>
                {col.id === 'Request Approval' && (
                  <span className="text-[10px] text-amber-500 font-semibold truncate">
                    Batas Maksimal Geser Staf
                  </span>
                )}
                {col.id === 'Approved / RtP' && (
                  <span className="text-[10px] text-emerald-500 font-semibold truncate">
                    ⭐ Kunci Nilai Fee · Hak Admin
                  </span>
                )}
              </div>

              {/* Column Cards Container */}
              <div className="flex flex-col gap-2.5">
                {colItems.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 font-medium">
                    Tidak ada konten
                  </div>
                ) : (
                  colItems.map((item) => (
                    <ContentCard
                      key={item.ID}
                      item={item}
                      activeRole={activeRole}
                      onEdit={onEditItem}
                      onDelete={onDeleteItem}
                      onStatusChange={onStatusChange}
                      onToggleChecklist={onToggleChecklist}
                      isDarkMode={isDarkMode}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
