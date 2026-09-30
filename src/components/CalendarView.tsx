import React, { useState, useMemo } from 'react';
import { ContentItem, UserRole } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ExternalLink, Edit2, X } from 'lucide-react';

interface CalendarViewProps {
  items: ContentItem[];
  activeRole: UserRole;
  onEditItem: (item: ContentItem) => void;
  isDarkMode?: boolean;
}

const BULAN_NAMA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const HARI_NAMA = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const CalendarView: React.FC<CalendarViewProps> = ({ items, activeRole, onEditItem, isDarkMode = true }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // Sep 2026 as per dataset
  const [selectedKlien, setSelectedKlien] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  const clientList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.Klien) set.add(it.Klien);
    });
    return Array.from(set).sort();
  }, [items]);

  const monthCalendarItems = useMemo(() => {
    return items.filter((it) => {
      if (!it.JadwalPosting) return false;
      const d = new Date(it.JadwalPosting);
      if (isNaN(d.getTime())) return false;
      if (d.getFullYear() !== year || d.getMonth() !== month) return false;
      if (selectedKlien !== 'ALL' && it.Klien !== selectedKlien) return false;
      return true;
    });
  }, [items, year, month, selectedKlien]);

  const itemsByDay = useMemo(() => {
    const map: Record<number, ContentItem[]> = {};
    monthCalendarItems.forEach((it) => {
      if (!it.JadwalPosting) return;
      const d = new Date(it.JadwalPosting);
      const day = d.getDate();
      if (!map[day]) map[day] = [];
      map[day].push(it);
    });
    return map;
  }, [monthCalendarItems]);

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const selectedDayItems = selectedDay ? itemsByDay[selectedDay] || [] : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Calendar Header Controls */}
      <div className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 transition-colors`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`flex items-center ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'} border rounded-xl p-1`}>
            <button
              onClick={handlePrevMonth}
              className={`p-1.5 rounded-lg ${isDarkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'} transition-colors cursor-pointer`}
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className={`font-bold text-sm sm:text-base min-w-[150px] text-center px-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              {BULAN_NAMA[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className={`p-1.5 rounded-lg ${isDarkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'} transition-colors cursor-pointer`}
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className={`text-xs font-semibold px-3 py-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'} border rounded-xl transition-colors cursor-pointer`}
          >
            Hari Ini
          </button>
        </div>

        {/* Legend & Filter */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Scheduling</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Published</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} font-medium`}>Filter Klien:</span>
            <select
              value={selectedKlien}
              onChange={(e) => {
                setSelectedKlien(e.target.value);
                setSelectedDay(null);
              }}
              className={`${isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500`}
            >
              <option value="ALL">Semua Klien</option>
              {clientList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`${isDarkMode ? 'bg-[#0f172a]/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-4 overflow-hidden transition-colors`}>
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
          {HARI_NAMA.map((h, i) => (
            <div
              key={h}
              className={`text-center font-bold text-xs uppercase py-2 tracking-wider ${
                i === 0 ? 'text-red-500' : isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Month Day Cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[85px] sm:min-h-[105px] opacity-20" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayItems = itemsByDay[dayNum] || [];
            const hasContent = dayItems.length > 0;
            const schedulingCount = dayItems.filter((it) => it.Status === 'Scheduling').length;
            const publishedCount = dayItems.filter((it) => it.Status === 'Published').length;
            const otherCount = dayItems.length - schedulingCount - publishedCount;

            const isSelected = selectedDay === dayNum;

            return (
              <div
                key={dayNum}
                onClick={() => hasContent && setSelectedDay(dayNum)}
                className={`min-h-[85px] sm:min-h-[105px] rounded-xl p-2 flex flex-col justify-between border transition-all ${
                  hasContent
                    ? isDarkMode
                      ? 'cursor-pointer hover:border-red-500/80 hover:bg-slate-800/80 bg-slate-900/90'
                      : 'cursor-pointer hover:border-red-500 hover:bg-red-50/40 bg-slate-50'
                    : isDarkMode
                    ? 'bg-slate-900/30 border-slate-800/60'
                    : 'bg-slate-50/50 border-slate-200/60'
                } ${isSelected ? 'border-red-500 ring-2 ring-red-500/30' : isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs sm:text-sm font-bold ${
                      hasContent ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-slate-400'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {hasContent && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                      {dayItems.length}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  {schedulingCount > 0 && (
                    <div className="text-[10px] font-semibold bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 px-1.5 py-0.5 rounded truncate">
                      {schedulingCount} Scheduling
                    </div>
                  )}
                  {publishedCount > 0 && (
                    <div className="text-[10px] font-semibold bg-blue-950/70 border border-blue-800/60 text-blue-300 px-1.5 py-0.5 rounded truncate">
                      {publishedCount} Published
                    </div>
                  )}
                  {otherCount > 0 && (
                    <div className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded truncate">
                      {otherCount} Konten
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-[#1e293b]/70' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-red-500" />
                <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Jadwal Konten - {selectedDay} {BULAN_NAMA[month]} {year}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-3">
              {selectedDayItems.map((item) => {
                const isPub = item.Status === 'Published';
                const isSched = item.Status === 'Scheduling';

                return (
                  <div
                    key={item.ID}
                    className={`p-4 rounded-xl border ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'} flex flex-col gap-2`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-extrabold text-[#E30000]">
                        {item.Klien}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                          isPub
                            ? 'bg-blue-950 text-blue-400 border-blue-800'
                            : isSched
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {item.Status}
                      </span>
                    </div>

                    <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.Tema || item.IdeKonten}</h4>
                    {item.Detail && <p className="text-xs text-slate-400">{item.Detail}</p>}

                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                      <span>{item.Creator || 'Creator belum diset'}</span>
                      <span>·</span>
                      <span>{item.JenisKonten}</span>
                      <span>·</span>
                      <span className="font-mono text-emerald-500 font-bold">
                        Rp {Number(item.FeeAmount || 0).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className={`flex items-center justify-between pt-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} mt-1`}>
                      <div className="flex items-center gap-2">
                        {item.File && (
                          <a
                            href={item.File}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-sky-500 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Buka File</span>
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedDay(null);
                          onEditItem(item);
                        }}
                        className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-slate-200 bg-slate-800 hover:bg-slate-700 border-slate-700' : 'text-slate-700 bg-slate-200 hover:bg-slate-300 border-slate-300'} px-3 py-1.5 rounded-lg border transition-colors font-medium cursor-pointer`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Buka / Edit</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800 bg-[#1e293b]/40' : 'border-slate-200 bg-slate-50'} flex justify-end`}>
              <button
                onClick={() => setSelectedDay(null)}
                className={`px-4 py-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} rounded-xl text-xs font-semibold cursor-pointer`}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
