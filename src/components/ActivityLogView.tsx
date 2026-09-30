import React, { useState } from 'react';
import { ActivityLog } from '../types';
import {
  History,
  Sparkles,
  RefreshCw,
  ArrowRight,
  User,
  Building2,
  MapPin,
  Home,
  Coffee,
  Compass,
} from 'lucide-react';

interface ActivityLogViewProps {
  logs: ActivityLog[];
  onRefresh: () => void;
  isDarkMode?: boolean;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs, onRefresh, isDarkMode = true }) => {
  const [filterMode, setFilterMode] = useState<string>('ALL');

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterMode === 'ALL') return true;
    return log.locationSnapshot?.mode === filterMode;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Header toolbar */}
      <div className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors`}>
        <div>
          <h3 className={`font-bold text-base flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <History className="w-5 h-5 text-amber-500" />
            <span>Riwayat Aktivitas & Perubahan Status</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Mencatat siapa, kapan, perubahan status, dan auto-geotagging lokasi staf saat bertindak.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'} border px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Filter by Work Location Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-amber-500" />
          <span>Filter Lokasi:</span>
        </span>
        <button
          onClick={() => setFilterMode('ALL')}
          className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            filterMode === 'ALL'
              ? 'bg-red-600 text-white shadow-sm'
              : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
          } border`}
        >
          Semua ({logs.length})
        </button>
        <button
          onClick={() => setFilterMode('WFO')}
          className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            filterMode === 'WFO'
              ? 'bg-emerald-600 text-white shadow-sm'
              : isDarkMode ? 'bg-slate-900 border-slate-800 text-emerald-400' : 'bg-white border-slate-200 text-emerald-600'
          } border`}
        >
          <Building2 className="w-3 h-3" />
          <span>WFO Studio</span>
        </button>
        <button
          onClick={() => setFilterMode('ON_SITE')}
          className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            filterMode === 'ON_SITE'
              ? 'bg-amber-600 text-white shadow-sm'
              : isDarkMode ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-white border-slate-200 text-amber-600'
          } border`}
        >
          <MapPin className="w-3 h-3" />
          <span>On-Site Lapangan</span>
        </button>
        <button
          onClick={() => setFilterMode('WFH')}
          className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            filterMode === 'WFH'
              ? 'bg-sky-600 text-white shadow-sm'
              : isDarkMode ? 'bg-slate-900 border-slate-800 text-sky-400' : 'bg-white border-slate-200 text-sky-600'
          } border`}
        >
          <Home className="w-3 h-3" />
          <span>WFH Remote</span>
        </button>
        <button
          onClick={() => setFilterMode('MOBILE')}
          className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            filterMode === 'MOBILE'
              ? 'bg-purple-600 text-white shadow-sm'
              : isDarkMode ? 'bg-slate-900 border-slate-800 text-purple-400' : 'bg-white border-slate-200 text-purple-600'
          } border`}
        >
          <Coffee className="w-3 h-3" />
          <span>Mobile</span>
        </button>
      </div>

      {/* Activity Timeline */}
      <div className={`${isDarkMode ? 'bg-[#0f172a]/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 flex flex-col gap-3 transition-colors`}>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            Tidak ada aktivitas yang sesuai dengan filter lokasi ini.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isCreated = log.Action === 'Konten Dibuat';
            const isDeleted = log.Action === 'Konten Dihapus';

            return (
              <div
                key={log.ID}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                  isDarkMode
                    ? 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-900'
                    : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isCreated
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                      : isDeleted
                      ? 'bg-red-500/20 text-red-500 border border-red-500/40'
                      : 'bg-blue-500/20 text-blue-500 border border-blue-500/40'
                  }`}
                >
                  {isCreated ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className={`font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.ActorName || log.UserEmail || 'User'}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatTime(log.Timestamp)}
                    </span>
                  </div>

                  <div className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isCreated ? (
                      <>
                        Menambahkan konten baru{' '}
                        <b className={isDarkMode ? 'text-white' : 'text-slate-900'}>"{log.ContentTema}"</b>{' '}
                        {log.Klien && <span className="text-[#E30000]">({log.Klien})</span>} dengan status awal{' '}
                        <span className="font-bold text-amber-500">{log.StatusBaru}</span>
                      </>
                    ) : isDeleted ? (
                      <>
                        Menghapus konten <b className={isDarkMode ? 'text-white' : 'text-slate-900'}>"{log.ContentTema}"</b>{' '}
                        {log.Klien && <span className="text-[#E30000]">({log.Klien})</span>}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>
                          Mengubah status <b className={isDarkMode ? 'text-white' : 'text-slate-900'}>"{log.ContentTema}"</b>
                          {log.Klien && <span className="text-[#E30000]"> ({log.Klien})</span>}:
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <span className="text-slate-400 line-through">{log.StatusLama}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-emerald-500 font-bold">{log.StatusBaru}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {log.locationSnapshot && (
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          log.locationSnapshot.mode === 'WFO'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : log.locationSnapshot.mode === 'ON_SITE'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                            : log.locationSnapshot.mode === 'WFH'
                            ? 'bg-sky-500/10 text-sky-500 border-sky-500/30'
                            : 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                        }`}
                      >
                        {log.locationSnapshot.mode === 'WFO' && <Building2 className="w-3 h-3 text-emerald-500" />}
                        {log.locationSnapshot.mode === 'ON_SITE' && <MapPin className="w-3 h-3 text-amber-500" />}
                        {log.locationSnapshot.mode === 'WFH' && <Home className="w-3 h-3 text-sky-500" />}
                        {log.locationSnapshot.mode === 'MOBILE' && <Coffee className="w-3 h-3 text-purple-500" />}
                        <span>{log.locationSnapshot.label}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
