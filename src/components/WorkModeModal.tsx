import React, { useState } from 'react';
import { WorkMode, StaffUser } from '../types';
import { geoService, DEFAULT_STUDIO_COORDS } from '../services/geoService';
import {
  Building2,
  MapPin,
  Home,
  Coffee,
  Navigation,
  CheckCircle2,
  X,
  Compass,
  Users,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface WorkModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StaffUser | null;
  onModeChanged?: (newMode: WorkMode, tag: string) => void;
  isDarkMode?: boolean;
}

export const WorkModeModal: React.FC<WorkModeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onModeChanged,
  isDarkMode = true,
}) => {
  const [selectedMode, setSelectedMode] = useState<WorkMode>(() => geoService.getWorkMode());
  const [placeTag, setPlaceTag] = useState<string>(() => geoService.getPlaceTag());
  const [isLocating, setIsLocating] = useState(false);
  const [gpsResult, setGpsResult] = useState<{
    coords: { lat: number; lng: number };
    distanceKm: number;
    recommendedMode: WorkMode;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'my_mode' | 'team_presence'>('my_mode');

  if (!isOpen) return null;

  const teamList = geoService.getTeamPresence();

  const handleDetectGps = async () => {
    setIsLocating(true);
    setGpsError('');
    try {
      const coords = await geoService.getBrowserPosition(6000);
      if (coords) {
        const distance = geoService.calculateDistanceKm(
          coords.lat,
          coords.lng,
          DEFAULT_STUDIO_COORDS.lat,
          DEFAULT_STUDIO_COORDS.lng
        );

        const recMode: WorkMode = distance <= DEFAULT_STUDIO_COORDS.radiusKm ? 'WFO' : 'ON_SITE';
        setGpsResult({
          coords,
          distanceKm: distance,
          recommendedMode: recMode,
        });

        setSelectedMode(recMode);
        if (recMode === 'WFO') {
          setPlaceTag('');
        }
      } else {
        setGpsError(
          'Tidak dapat mengakses GPS perangkat. Pastikan izin lokasi (Location Permission) telah diizinkan di browser Anda.'
        );
      }
    } catch {
      setGpsError('Gagal membaca koordinat GPS perangkat.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSaveMode = () => {
    const email = currentUser?.email || 'loehendra@gmail.com';
    const name = currentUser?.name || 'Lalu Mahendra Ali Akbar';

    geoService.setWorkMode(selectedMode, placeTag, email, name);
    if (onModeChanged) {
      onModeChanged(selectedMode, placeTag);
    }
    onClose();
  };

  const formatDistance = (dist?: number) => {
    if (dist === undefined) return '';
    if (dist < 1) return `${Math.round(dist * 1000)} m dari Studio`;
    return `${dist} km dari Studio`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className={`${isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800 shadow-xl'} border rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'} flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Presensi & Mode Lokasi Kerja
              </h3>
              <p className="text-[11px] text-slate-400">
                Pencatatan real-time lokasi staf obeecreatives & geotagging otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={`flex border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'} px-6 pt-3 gap-2`}>
          <button
            onClick={() => setActiveTab('my_mode')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'my_mode'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-slate-400 hover:opacity-80'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Mode Kerja Saya</span>
          </button>
          <button
            onClick={() => setActiveTab('team_presence')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'team_presence'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-slate-400 hover:opacity-80'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Lokasi Tim Hari Ini ({teamList.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'my_mode' ? (
            <>
              {/* GPS Auto-Detect Button Card */}
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gradient-to-r from-red-950/40 via-slate-900/60 to-slate-900/80 border-red-900/40' : 'bg-red-50/60 border-red-200'} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                <div>
                  <div className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Auto-Geotagging via GPS</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Deteksi koordinat posisi Anda terhadap Studio obeecreatives Mataram
                  </p>
                </div>
                <button
                  onClick={handleDetectGps}
                  disabled={isLocating}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-lg shadow-red-950/50 cursor-pointer"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Membaca GPS...' : 'Deteksi GPS Sekarang'}</span>
                </button>
              </div>

              {/* GPS Result Notice */}
              {gpsResult && (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-bold">GPS Berhasil Terdeteksi!</div>
                    <div className="text-emerald-300 text-[11px]">
                      Jarak:{' '}
                      <b className="text-white">
                        {gpsResult.distanceKm <= 0.25
                          ? 'Di dalam radius Studio Mataram (WFO)'
                          : `${gpsResult.distanceKm} km dari Studio obeecreatives`}
                      </b>
                      . Mode kerja disesuaikan ke{' '}
                      <span className="font-bold uppercase underline">
                        {gpsResult.recommendedMode}
                      </span>
                      .
                    </div>
                  </div>
                </div>
              )}

              {gpsError && (
                <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{gpsError}</span>
                </div>
              )}

              {/* 4 Work Mode Selection Grid */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Pilih Status Lokasi Anda Saat Ini:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* WFO */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMode('WFO');
                      setPlaceTag('');
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      selectedMode === 'WFO'
                        ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500'
                        : isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        <span>🏢 Di Studio (WFO)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Studio obeecreatives Mataram
                      </div>
                    </div>
                  </button>

                  {/* ON-SITE */}
                  <button
                    type="button"
                    onClick={() => setSelectedMode('ON_SITE')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      selectedMode === 'ON_SITE'
                        ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500'
                        : isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        <span>🎬 On-Site / Lapangan</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Shooting, event, meeting di klien
                      </div>
                    </div>
                  </button>

                  {/* WFH */}
                  <button
                    type="button"
                    onClick={() => setSelectedMode('WFH')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      selectedMode === 'WFH'
                        ? 'bg-sky-500/10 border-sky-500 ring-1 ring-sky-500'
                        : isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-sky-500/20 text-sky-500 shrink-0">
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        <span>🏠 Work From Home (WFH)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Bekerja remote dari rumah
                      </div>
                    </div>
                  </button>

                  {/* MOBILE */}
                  <button
                    type="button"
                    onClick={() => setSelectedMode('MOBILE')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      selectedMode === 'MOBILE'
                        ? 'bg-purple-500/10 border-purple-500 ring-1 ring-purple-500'
                        : isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-500 shrink-0">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        <span>☕ Mobile / Kafe</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Bekerja nomaden / Co-working
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Custom Location / Client Tag Input */}
              {(selectedMode === 'ON_SITE' || selectedMode === 'MOBILE') && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label className="block text-xs font-semibold text-slate-400">
                    Nama Klien / Nama Tempat Lapangan:
                  </label>
                  <input
                    type="text"
                    value={placeTag}
                    onChange={(e) => setPlaceTag(e.target.value)}
                    placeholder={
                      selectedMode === 'ON_SITE'
                        ? 'cth: Outlet KERIPIK SAYUR ID / Resto Inovasi Pangan'
                        : 'cth: Kopi Kenangan Mataram / Co-Working Space'
                    }
                    className={`w-full ${isDarkMode ? 'bg-[#1e293b]/90 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-red-500`}
                  />
                  <p className="text-[10px] text-slate-400">
                    Label ini akan otomatis disematkan pada setiap tindakan update konten yang Anda lakukan.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Team Presence Roster */
            <div className="space-y-2.5">
              <div className="text-xs text-slate-400">
                Pantau lokasi dan mode kerja tim obeecreatives yang aktif hari ini:
              </div>
              <div className="space-y-2">
                {teamList.map((st) => {
                  const getModeBadge = (m: WorkMode) => {
                    switch (m) {
                      case 'WFO':
                        return {
                          icon: <Building2 className="w-3.5 h-3.5" />,
                          cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
                          label: 'WFO Studio',
                        };
                      case 'ON_SITE':
                        return {
                          icon: <MapPin className="w-3.5 h-3.5" />,
                          cls: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
                          label: 'On-Site',
                        };
                      case 'WFH':
                        return {
                          icon: <Home className="w-3.5 h-3.5" />,
                          cls: 'bg-sky-500/10 text-sky-500 border-sky-500/30',
                          label: 'WFH Remote',
                        };
                      case 'MOBILE':
                        return {
                          icon: <Coffee className="w-3.5 h-3.5" />,
                          cls: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
                          label: 'Mobile',
                        };
                    }
                  };

                  const badge = getModeBadge(st.mode);

                  return (
                    <div
                      key={st.email}
                      className={`p-3 rounded-2xl ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'} border flex items-center justify-between gap-3`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-200 border-slate-300 text-slate-800'} border flex items-center justify-center text-xs font-bold shrink-0`}>
                          {st.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate flex items-center gap-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            <span className="truncate">{st.name}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {st.locationName}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {st.distanceKm !== undefined && (
                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                            {formatDistance(st.distanceKm)}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.cls}`}
                        >
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'} flex items-center justify-between`}>
          <div className="text-[11px] text-slate-400">
            {currentUser ? `User: ${currentUser.name}` : ''}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-red-500 cursor-pointer"
            >
              Tutup
            </button>
            {activeTab === 'my_mode' && (
              <button
                onClick={handleSaveMode}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all shadow-lg shadow-red-950/50 cursor-pointer"
              >
                Terapkan Status
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
