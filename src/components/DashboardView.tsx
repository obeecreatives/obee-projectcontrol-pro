import React, { useState, useMemo } from 'react';
import { ContentItem, UserRole, WorkMode } from '../types';
import { ROLES, normalizeClientName, normalizeCreatorName } from '../data/seedData';
import { storageService } from '../services/storageService';
import { geoService } from '../services/geoService';
import { KpiWidget } from './KpiWidget';
import {
  FileText,
  DollarSign,
  Users,
  Building2,
  Calendar,
  Download,
  Printer,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Home,
  Coffee,
  Compass,
  Navigation,
  Trash2,
  RotateCcw,
} from 'lucide-react';

interface DashboardViewProps {
  items: ContentItem[];
  activeRole: UserRole;
  onOpenWorkModeModal?: () => void;
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

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  activeRole,
  onOpenWorkModeModal,
  isDarkMode = true,
}) => {
  const roleConfig = ROLES[activeRole] || ROLES.project_manager;

  const today = new Date();
  const [payrollStart, setPayrollStart] = useState('2026-07-01');
  const [payrollEnd, setPayrollEnd] = useState('2026-10-31');

  const [teamPresenceList, setTeamPresenceList] = useState(() => geoService.getTeamPresence());

  const handleDeletePresence = (email: string, name: string) => {
    if (window.confirm(`Hapus kartu presensi untuk "${name}" (${email})?`)) {
      geoService.removeTeamMember(email);
      setTeamPresenceList(geoService.getTeamPresence());
    }
  };

  const handleResetPresence = () => {
    if (window.confirm('Reset daftar presensi tim ke data awal studio?')) {
      geoService.resetToDefaultPresence();
      setTeamPresenceList(geoService.getTeamPresence());
    }
  };

  const [reportMode, setReportMode] = useState<'internal' | 'client'>('internal');
  const [reportMonth, setReportMonth] = useState<number>(today.getMonth());
  const [reportYear, setReportYear] = useState<number>(today.getFullYear());
  const [reportClient, setReportClient] = useState<string>('ALL');

  const stats = useMemo(() => {
    let totalFee = 0;
    let komersilCount = 0;
    let internalCount = 0;
    const statusCounts: Record<string, number> = {
      'New Idea': 0,
      'On Progress': 0,
      'Request Approval': 0,
      'Approved / RtP': 0,
      'Scheduling': 0,
      'Published': 0,
    };

    items.forEach((it) => {
      if (it.TipeProject === 'Internal') {
        internalCount++;
      } else {
        komersilCount++;
      }

      if (statusCounts[it.Status] !== undefined) {
        statusCounts[it.Status]++;
      }

      totalFee += Number(it.FeeAmount || 0);
    });

    return {
      total: items.length,
      komersil: komersilCount,
      internal: internalCount,
      totalFee,
      statusCounts,
    };
  }, [items]);

  const creatorSummary = useMemo(() => {
    const map: Record<string, { jumlah: number; fee: number }> = {};
    items.forEach((it) => {
      const cr = normalizeCreatorName(it.Creator);
      if (!map[cr]) map[cr] = { jumlah: 0, fee: 0 };
      map[cr].jumlah++;
      map[cr].fee += Number(it.FeeAmount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1].jumlah - a[1].jumlah);
  }, [items]);

  const clientSummary = useMemo(() => {
    const map: Record<string, { jumlah: number; desain: number; video: number }> = {};
    items.forEach((it) => {
      if (it.TipeProject === 'Internal') return;
      const cl = normalizeClientName(it.Klien);
      if (!map[cl]) map[cl] = { jumlah: 0, desain: 0, video: 0 };
      map[cl].jumlah++;
      if (it.Kategori === 'Video' || it.JenisKonten === 'Reels / TikTok') {
        map[cl].video++;
      } else {
        map[cl].desain++;
      }
    });
    return Object.entries(map).sort((a, b) => b[1].jumlah - a[1].jumlah);
  }, [items]);

  const payrollFeeRecap = useMemo(() => {
    const perStaff: Record<string, { jenis: Record<string, { jumlah: number; subtotal: number }>; total: number }> = {};
    let grandTotal = 0;
    let approvedCount = 0;

    items.forEach((it) => {
      const fee = Number(it.FeeAmount || 0);
      if (fee <= 0) return;

      const appDate = it.TanggalApprove;
      if (!appDate) return;

      if (appDate >= payrollStart && appDate <= payrollEnd) {
        approvedCount++;
        grandTotal += fee;
        const staff = normalizeCreatorName(it.Creator);
        const jenis = it.JenisKonten || 'Single Post';

        if (!perStaff[staff]) perStaff[staff] = { jenis: {}, total: 0 };
        if (!perStaff[staff].jenis[jenis]) {
          perStaff[staff].jenis[jenis] = { jumlah: 0, subtotal: 0 };
        }

        perStaff[staff].jenis[jenis].jumlah++;
        perStaff[staff].jenis[jenis].subtotal += fee;
        perStaff[staff].total += fee;
      }
    });

    return {
      perStaff,
      grandTotal,
      approvedCount,
    };
  }, [items, payrollStart, payrollEnd]);

  const handleDownloadCsv = () => {
    const csvContent = storageService.exportContentCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ProjectControl_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Executive KPI Widget */}
      <KpiWidget items={items} activeRole={activeRole} isDarkMode={isDarkMode} />

      {/* Executive Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className={`${isDarkMode ? 'bg-[#1e293b]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-4 flex flex-col justify-between`}>
          <span className="text-xs font-semibold text-slate-400">Total Konten</span>
          <span className={`text-2xl sm:text-3xl font-extrabold font-mono mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {stats.total}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">Aktif di board</span>
        </div>

        <div className={`${isDarkMode ? 'bg-[#1e293b]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-4 flex flex-col justify-between`}>
          <span className="text-xs font-semibold text-slate-400">Komersil</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#E30000] font-mono mt-2">
            {stats.komersil}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">Klien Berbayar</span>
        </div>

        <div className={`${isDarkMode ? 'bg-[#1e293b]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-4 flex flex-col justify-between`}>
          <span className="text-xs font-semibold text-slate-400">Internal</span>
          <span className={`text-2xl sm:text-3xl font-extrabold font-mono mt-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            {stats.internal}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">obeecreatives</span>
        </div>

        <div className={`${isDarkMode ? 'bg-[#1e293b]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-4 flex flex-col justify-between`}>
          <span className="text-xs font-semibold text-slate-400">Approved / RtP</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-500 font-mono mt-2">
            {stats.statusCounts['Approved / RtP'] || 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">Siap tayang</span>
        </div>

        <div className={`${isDarkMode ? 'bg-[#1e293b]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-4 flex flex-col justify-between`}>
          <span className="text-xs font-semibold text-slate-400">Scheduling</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-teal-500 font-mono mt-2">
            {stats.statusCounts['Scheduling'] || 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">Terjadwal</span>
        </div>

        {roleConfig.showInternalFee ? (
          <div className={`${isDarkMode ? 'bg-[#1e293b]/80 border-emerald-900/40' : 'bg-emerald-50/60 border-emerald-200'} border rounded-2xl p-4 flex flex-col justify-between`}>
            <span className="text-xs font-semibold text-emerald-600">Total Fee Terkunci</span>
            <span className="text-lg sm:text-xl font-extrabold text-emerald-600 font-mono mt-2 truncate">
              Rp {stats.totalFee.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">Approved ke atas</span>
          </div>
        ) : (
          <div className={`${isDarkMode ? 'bg-[#1e293b]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-4 flex flex-col justify-between`}>
            <span className="text-xs font-semibold text-slate-400">Published</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-500 font-mono mt-2">
              {stats.statusCounts['Published'] || 0}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">Sudah diposting</span>
          </div>
        )}
      </div>

      {/* Real-time Team Presence & Field Tracking Widget */}
      <div className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 flex flex-col gap-4 transition-colors`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Status Presensi & Lokasi Tim Hari Ini</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring real-time staf di Studio Mataram, On-Site liputan klien, WFH, dan Mobile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {roleConfig.canEditRateCard && (
              <button
                onClick={handleResetPresence}
                className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'} border px-2.5 py-1.5 rounded-lg transition-colors font-medium cursor-pointer`}
                title="Reset daftar presensi tim ke data default studio"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Presensi</span>
              </button>
            )}

            {onOpenWorkModeModal && (
              <button
                onClick={onOpenWorkModeModal}
                className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'} border px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer`}
              >
                <Navigation className="w-3.5 h-3.5 text-red-500" />
                <span>Atur / Cek Lokasi Saya</span>
              </button>
            )}
          </div>
        </div>

        {/* Presence Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {teamPresenceList.map((st) => {
            const getBadge = (m: WorkMode) => {
              switch (m) {
                case 'WFO':
                  return {
                    icon: <Building2 className="w-3.5 h-3.5 text-emerald-500" />,
                    cls: isDarkMode ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700',
                    label: 'Di Studio (WFO)',
                  };
                case 'ON_SITE':
                  return {
                    icon: <MapPin className="w-3.5 h-3.5 text-amber-500" />,
                    cls: isDarkMode ? 'bg-amber-950/50 border-amber-800/80 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700',
                    label: 'On-Site Lapangan',
                  };
                case 'WFH':
                  return {
                    icon: <Home className="w-3.5 h-3.5 text-sky-500" />,
                    cls: isDarkMode ? 'bg-sky-950/50 border-sky-800/80 text-sky-300' : 'bg-sky-50 border-sky-200 text-sky-700',
                    label: 'WFH Remote',
                  };
                case 'MOBILE':
                  return {
                    icon: <Coffee className="w-3.5 h-3.5 text-purple-500" />,
                    cls: isDarkMode ? 'bg-purple-950/50 border-purple-800/80 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700',
                    label: 'Mobile / Kafe',
                  };
              }
            };

            const badge = getBadge(st.mode);

            return (
              <div
                key={st.email}
                className={`p-3.5 rounded-xl border ${isDarkMode ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-900' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'} transition-colors flex flex-col justify-between gap-2.5 group relative`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-200 border-slate-300 text-slate-800'} border flex items-center justify-center text-xs font-bold shrink-0`}>
                      {st.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate flex items-center gap-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                        <span>{st.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{st.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.cls}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>

                    {roleConfig.canEditRateCard && (
                      <button
                        onClick={() => handleDeletePresence(st.email, st.name)}
                        className="opacity-40 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                        title={`Hapus ${st.name} (${st.email}) dari daftar presensi`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className={`text-[11px] ${isDarkMode ? 'bg-slate-950/50 border-slate-800/80 text-slate-300' : 'bg-white border-slate-200 text-slate-700'} border rounded-lg p-2 flex items-center justify-between gap-2`}>
                  <span className="truncate">{st.locationName}</span>
                  {st.distanceKm !== undefined && (
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {st.distanceKm < 1
                        ? `${Math.round(st.distanceKm * 1000)} m`
                        : `${st.distanceKm} km`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Generator Panel */}
      <div className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 flex flex-col gap-4 transition-colors`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Export & Rekap Laporan Bulanan</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'} border px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer`}
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Download CSV Sheet</span>
            </button>
            <button
              onClick={handlePrint}
              className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'} border px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer`}
            >
              <Printer className="w-4 h-4 text-sky-500" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Mode Laporan</label>
            <select
              value={reportMode}
              onChange={(e) => setReportMode(e.target.value as 'internal' | 'client')}
              className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-lg px-2.5 py-2 focus:outline-none focus:border-red-500 font-medium`}
            >
              <option value="internal">Internal (Lengkap dengan Fee & Creator)</option>
              <option value="client">Untuk Klien (Ringkas, Tanpa Data Fee)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Bulan</label>
            <select
              value={reportMonth}
              onChange={(e) => setReportMonth(Number(e.target.value))}
              className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-lg px-2.5 py-2 focus:outline-none focus:border-red-500 font-medium`}
            >
              {BULAN_NAMA.map((b, idx) => (
                <option key={b} value={idx}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Tahun</label>
            <input
              type="number"
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
              className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-lg px-2.5 py-2 focus:outline-none focus:border-red-500 font-medium font-mono`}
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Klien Target</label>
            <select
              value={reportClient}
              onChange={(e) => setReportClient(e.target.value)}
              className={`w-full ${isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-lg px-2.5 py-2 focus:outline-none focus:border-red-500 font-medium`}
            >
              <option value="ALL">Semua Klien</option>
              {clientSummary.map(([cl]) => (
                <option key={cl} value={cl}>
                  {cl}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payroll Fee Preview Section */}
      {roleConfig.showInternalFee && (
        <div className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 flex flex-col gap-4 transition-colors`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  💰 Rekap Fee per Staff & Jenis Konten (untuk Payroll)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Preview nilai yang akan ditarik ke Payroll di <b>Database Staff</b> untuk periode terpilih.
                Dihitung berdasarkan <b>TanggalApprove</b> (tanggal saat status pertama kali disetujui, dicatat otomatis & tidak bisa diedit). Hanya konten yang fee-nya &gt;Rp0 yang dihitung.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
              <input
                type="date"
                value={payrollStart}
                onChange={(e) => setPayrollStart(e.target.value)}
                className={`${isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500 font-mono`}
              />
              <span className="text-slate-400">s/d</span>
              <input
                type="date"
                value={payrollEnd}
                onChange={(e) => setPayrollEnd(e.target.value)}
                className={`${isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-300'} border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500 font-mono`}
              />
            </div>
          </div>

          {/* Breakdown Per Staff */}
          <div className="flex flex-col gap-3 mt-1">
            {Object.keys(payrollFeeRecap.perStaff).length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Tidak ada konten yang disetujui (Approved) dengan fee &gt;Rp0 dalam rentang tanggal ini.
              </div>
            ) : (
              Object.entries(payrollFeeRecap.perStaff).map(([staffName, staffData]) => (
                <div
                  key={staffName}
                  className={`rounded-xl border ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'} overflow-hidden`}
                >
                  <div className={`${isDarkMode ? 'bg-slate-800/80 border-slate-800' : 'bg-slate-100 border-slate-200'} px-4 py-2.5 flex items-center justify-between border-b`}>
                    <span className={`font-bold text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{staffName}</span>
                    <span className="font-mono font-extrabold text-sm text-emerald-500">
                      Rp {staffData.total.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="p-3 overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className={`${isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'} border-b`}>
                          <th className="pb-2 font-medium">Jenis Konten</th>
                          <th className="pb-2 font-medium text-center">Jumlah</th>
                          <th className="pb-2 font-medium text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {Object.entries(staffData.jenis).map(([jenis, data]) => (
                          <tr key={jenis} className={`${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-100'}`}>
                            <td className={`py-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{jenis}</td>
                            <td className="py-2 text-center font-mono">{data.jumlah}</td>
                            <td className="py-2 text-right font-mono text-emerald-500 font-bold">
                              Rp {data.subtotal.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}

            {/* Grand Total */}
            <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'} border rounded-xl mt-1`}>
              <span className="font-bold text-sm">
                Grand Total Payroll Fee ({payrollFeeRecap.approvedCount} Konten):
              </span>
              <span className="font-mono text-lg font-black text-emerald-500">
                Rp {payrollFeeRecap.grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Two Columns: Creator & Client Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Creator Summary */}
        <div className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 flex flex-col gap-3 transition-colors`}>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Rekap per Creator</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className={`${isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'} border-b`}>
                  <th className="pb-2 font-semibold">Creator</th>
                  <th className="pb-2 font-semibold text-center">Jumlah Konten</th>
                  {roleConfig.showInternalFee && (
                    <th className="pb-2 font-semibold text-right">Fee (Approved/RtP)</th>
                  )}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-200'} font-medium`}>
                {creatorSummary.map(([creator, data]) => (
                  <tr key={creator} className={`${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                    <td className={`py-2.5 font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{creator}</td>
                    <td className={`py-2.5 text-center font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{data.jumlah}</td>
                    {roleConfig.showInternalFee && (
                      <td className="py-2.5 text-right font-mono text-emerald-500 font-bold">
                        Rp {data.fee.toLocaleString('id-ID')}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client Summary */}
        <div className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 flex flex-col gap-3 transition-colors`}>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#E30000]" />
            <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Rekap per Klien (Komersil)</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className={`${isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'} border-b`}>
                  <th className="pb-2 font-semibold">Klien</th>
                  <th className="pb-2 font-semibold text-center">Total</th>
                  <th className="pb-2 font-semibold text-center">Desain</th>
                  <th className="pb-2 font-semibold text-center">Video</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-200'} font-medium`}>
                {clientSummary.map(([client, data]) => (
                  <tr key={client} className={`${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                    <td className={`py-2.5 font-bold uppercase ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{client}</td>
                    <td className={`py-2.5 text-center font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{data.jumlah}</td>
                    <td className={`py-2.5 text-center font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{data.desain}</td>
                    <td className={`py-2.5 text-center font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{data.video}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
