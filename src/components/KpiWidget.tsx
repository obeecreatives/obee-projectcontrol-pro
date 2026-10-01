import React, { useState, useMemo } from 'react';
import { ContentItem, UserRole, KpiTargets } from '../types';
import { ROLES, normalizeClientName, normalizeCreatorName } from '../data/seedData';
import { storageService, DEFAULT_KPI_TARGETS } from '../services/storageService';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Target,
  SlidersHorizontal,
  DollarSign,
  Copy,
  Check,
  Users,
  Calendar,
  Flame,
  X,
  Sparkles,
} from 'lucide-react';

interface KpiWidgetProps {
  items: ContentItem[];
  activeRole: UserRole;
  isDarkMode?: boolean;
}

type PeriodFilter = 'current_month' | 'last_month' | 'all_time';

export const KpiWidget: React.FC<KpiWidgetProps> = ({
  items,
  activeRole,
  isDarkMode = true,
}) => {
  const roleConfig = ROLES[activeRole] || ROLES.project_manager;

  const [period, setPeriod] = useState<PeriodFilter>('current_month');
  const [selectedClient, setSelectedClient] = useState<string>('ALL');
  const [targets, setTargets] = useState<KpiTargets>(() => storageService.getKpiTargets());
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Form states for Target Modal
  const [tempTargets, setTempTargets] = useState<KpiTargets>(targets);

  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const currentMonthIdx = today.getMonth(); // 0-indexed

  // Available unique clients for filter
  const clientOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.Klien && it.TipeProject !== 'Internal') {
        set.add(normalizeClientName(it.Klien));
      }
    });
    return Array.from(set).sort();
  }, [items]);

  // Filter items based on selected period and client
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      // Client filter
      if (selectedClient !== 'ALL') {
        const itemClient = normalizeClientName(it.Klien);
        if (itemClient !== selectedClient) return false;
      }

      // Period filter
      if (period === 'all_time') return true;

      // Extract date from TanggalProduksi or TanggalApprove or JadwalPosting
      const dateStr = it.TanggalProduksi || it.TanggalApprove || it.CreatedAt || '';
      if (!dateStr) return true;

      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return true;

      if (period === 'current_month') {
        return d.getFullYear() === currentYear && d.getMonth() === currentMonthIdx;
      }

      if (period === 'last_month') {
        const lastMonth = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1;
        const lastYear = currentMonthIdx === 0 ? currentYear - 1 : currentYear;
        return d.getFullYear() === lastYear && d.getMonth() === lastMonth;
      }

      return true;
    });
  }, [items, period, selectedClient, currentYear, currentMonthIdx]);

  // Compute Core KPI Metrics
  const metrics = useMemo(() => {
    let completedCount = 0;
    let inProgressCount = 0;
    let pendingApprovalCount = 0;
    let onTimeCount = 0;
    let overdueCount = 0;
    let totalScheduled = 0;
    let totalFeeCompleted = 0;
    let totalFeeAll = 0;
    let firstPassCount = 0;
    let totalTurnaroundDays = 0;
    let turnaroundItemsCount = 0;

    const overdueList: Array<{ item: ContentItem; daysLate: number }> = [];
    const creatorWorkload: Record<string, { active: number; completed: number; totalFee: number }> = {};

    filteredItems.forEach((it) => {
      const creator = normalizeCreatorName(it.Creator);
      if (!creatorWorkload[creator]) {
        creatorWorkload[creator] = { active: 0, completed: 0, totalFee: 0 };
      }

      const fee = Number(it.FeeAmount || 0);
      totalFeeAll += fee;

      const isDone = it.Status === 'Approved / RtP' || it.Status === 'Scheduling' || it.Status === 'Published';
      const isPending = it.Status === 'Request Approval';
      const isActive = it.Status === 'On Progress' || it.Status === 'New Idea';

      if (isDone) {
        completedCount++;
        totalFeeCompleted += fee;
        creatorWorkload[creator].completed++;
        creatorWorkload[creator].totalFee += fee;
      } else {
        creatorWorkload[creator].active++;
      }

      if (isActive) inProgressCount++;
      if (isPending) pendingApprovalCount++;

      // Check Quality: First-pass without "Revisi Klien" comments
      const clientRevisions = (it.comments || []).filter((c) => c.category === 'Revisi Klien').length;
      if (isDone && clientRevisions === 0) {
        firstPassCount++;
      }

      // Check Turnaround Speed (TanggalProduksi -> TanggalApprove)
      if (it.TanggalProduksi && it.TanggalApprove) {
        const start = new Date(it.TanggalProduksi).getTime();
        const end = new Date(it.TanggalApprove).getTime();
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
          totalTurnaroundDays += diffDays;
          turnaroundItemsCount++;
        }
      }

      // On-Time vs Overdue evaluation
      if (it.JadwalPosting) {
        totalScheduled++;
        const targetDate = new Date(it.JadwalPosting);
        targetDate.setHours(23, 59, 59, 999);

        if (isDone) {
          // If approved, check if approved on/before schedule
          const approveDate = it.TanggalApprove ? new Date(it.TanggalApprove) : today;
          if (approveDate <= targetDate) {
            onTimeCount++;
          } else {
            overdueCount++;
          }
        } else {
          // If not yet finished and target date has passed -> Overdue
          if (today > targetDate) {
            overdueCount++;
            const daysLate = Math.max(1, Math.ceil((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)));
            overdueList.push({ item: it, daysLate });
          } else {
            onTimeCount++;
          }
        }
      }
    });

    const onTimeRate = totalScheduled > 0 ? Math.round((onTimeCount / totalScheduled) * 100) : 100;
    const contentProgressPct = Math.min(100, Math.round((completedCount / (targets.monthlyContentTarget || 1)) * 100));
    const revenueProgressPct = Math.min(100, Math.round((totalFeeCompleted / (targets.monthlyRevenueTarget || 1)) * 100));
    const firstPassRate = completedCount > 0 ? Math.round((firstPassCount / completedCount) * 100) : 100;
    const avgTurnaroundDays = turnaroundItemsCount > 0 ? (totalTurnaroundDays / turnaroundItemsCount).toFixed(1) : '2.0';

    // Projected content pace for current month
    const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
    const currentDay = today.getDate();
    const projectedMonthEndContent = currentDay > 0 ? Math.round((completedCount / currentDay) * daysInMonth) : completedCount;

    return {
      completedCount,
      inProgressCount,
      pendingApprovalCount,
      onTimeCount,
      overdueCount,
      totalScheduled,
      onTimeRate,
      contentProgressPct,
      revenueProgressPct,
      totalFeeCompleted,
      totalFeeAll,
      firstPassRate,
      avgTurnaroundDays,
      projectedMonthEndContent,
      overdueList: overdueList.sort((a, b) => b.daysLate - a.daysLate),
      creatorWorkload: Object.entries(creatorWorkload).sort((a, b) => b[1].active - a[1].active),
    };
  }, [filteredItems, targets, today, currentYear, currentMonthIdx]);

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveKpiTargets(tempTargets);
    setTargets(tempTargets);
    setShowTargetModal(false);
  };

  const handleCopyReport = () => {
    const periodLabel =
      period === 'current_month'
        ? `Bulan Ini (${today.toLocaleString('id-ID', { month: 'long', year: 'numeric' })})`
        : period === 'last_month'
        ? 'Bulan Lalu'
        : 'Semua Waktu';

    const text = `📊 *OBEECREATIVES OS - KPI & PERFORMANCE SUMMARY*
Periode: ${periodLabel} | Filter Klien: ${selectedClient}

🎯 *Key Performance Indicators:*
• On-Time Delivery Rate: ${metrics.onTimeRate}% (Target: ≥${targets.onTimeGoalPercent}%)
• Output Konten: ${metrics.completedCount} / ${targets.monthlyContentTarget} (${metrics.contentProgressPct}%)
• Estimasi Akhir Bulan (Pace): ~${metrics.projectedMonthEndContent} konten
• First-Pass Approval: ${metrics.firstPassRate}%
• Avg. Turnaround Speed: ${metrics.avgTurnaroundDays} hari (SLA: ${targets.targetSlaDays} hari)
${roleConfig.showInternalFee ? `• Revenue Realization: Rp ${metrics.totalFeeCompleted.toLocaleString('id-ID')} / Rp ${targets.monthlyRevenueTarget.toLocaleString('id-ID')} (${metrics.revenueProgressPct}%)` : ''}

📌 *Status Pipeline:*
• On Progress: ${metrics.inProgressCount} konten
• Menunggu Approval: ${metrics.pendingApprovalCount} konten
• Overdue / Terlambat: ${metrics.overdueCount} konten

Generated by obeecreatives Workspace OS`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 flex flex-col gap-5 transition-colors`}>
      {/* Top Header & Interactive Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Executive KPI &amp; Performance Tracker
              </h3>
              <span className="text-[11px] font-semibold text-red-500 font-mono">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Metrik ketepatan waktu (SLA), target output konten, realisasi omzet, dan kapasitas tim
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Period Tabs */}
          <div className={`flex items-center p-1 rounded-xl border text-xs font-medium ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setPeriod('current_month')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                period === 'current_month'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setPeriod('last_month')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                period === 'last_month'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulan Lalu
            </button>
            <button
              onClick={() => setPeriod('all_time')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                period === 'all_time'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
          </div>

          {/* Client Filter Selector */}
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className={`text-xs ${isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-800' : 'bg-slate-100 text-slate-800 border-slate-200'} border rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-red-500`}
            title="Filter data KPI berdasarkan klien tertentu"
          >
            <option value="ALL">Semua Klien</option>
            {clientOptions.map((cl) => (
              <option key={cl} value={cl}>
                {cl}
              </option>
            ))}
          </select>

          {/* Set Goals Button */}
          {roleConfig.canEditRateCard && (
            <button
              onClick={() => {
                setTempTargets(targets);
                setShowTargetModal(true);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-700 hover:bg-slate-800 text-slate-200'
                  : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800'
              }`}
              title="Atur target bulanan konten dan omzet"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              <span>Target KPI</span>
            </button>
          )}

          {/* Copy Report Button */}
          <button
            onClick={handleCopyReport}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
              copiedSummary
                ? 'bg-emerald-600 text-white border-emerald-500'
                : isDarkMode
                ? 'bg-slate-900/90 border-slate-700 hover:bg-slate-800 text-slate-200'
                : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800'
            }`}
            title="Salin rekap KPI untuk laporan WhatsApp/Notion"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
            <span>{copiedSummary ? 'Disalin!' : 'Salin KPI'}</span>
          </button>
        </div>
      </div>

      {/* Main 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: On-Time Delivery Rate */}
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between gap-3 relative overflow-hidden`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>On-Time Delivery</span>
            </span>
            <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-md ${
              metrics.onTimeRate >= targets.onTimeGoalPercent
                ? isDarkMode ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-emerald-100 text-emerald-800'
                : isDarkMode ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40' : 'bg-amber-100 text-amber-800'
            }`}>
              Goal: ≥{targets.onTimeGoalPercent}%
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-emerald-500 tabular-nums">
                {metrics.onTimeRate}%
              </span>
              <span className="text-xs text-slate-400 font-medium">ketepatan SLA</span>
            </div>
            <div className="w-full bg-slate-700/30 h-1.5 rounded-full overflow-hidden mt-2.5">
              <div
                className={`h-full transition-all duration-500 ${
                  metrics.onTimeRate >= targets.onTimeGoalPercent ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, metrics.onTimeRate)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/40">
            <span>{metrics.onTimeCount} tepat waktu</span>
            <span className={metrics.overdueCount > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}>
              {metrics.overdueCount} terlambat
            </span>
          </div>
        </div>

        {/* KPI 2: Content Production Velocity */}
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between gap-3 relative overflow-hidden`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-red-500" />
              <span>Target Output Konten</span>
            </span>
            <span className="text-[11px] font-bold font-mono text-red-400 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20">
              {metrics.contentProgressPct}%
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-[#E30000] tabular-nums">
                {metrics.completedCount}
              </span>
              <span className="text-sm font-semibold text-slate-400 font-mono">
                / {targets.monthlyContentTarget} target
              </span>
            </div>
            <div className="w-full bg-slate-700/30 h-1.5 rounded-full overflow-hidden mt-2.5">
              <div
                className="h-full bg-[#E30000] transition-all duration-500"
                style={{ width: `${metrics.contentProgressPct}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/40">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Pace: ~{metrics.projectedMonthEndContent} di akhir bln</span>
            </span>
            <span>{targets.monthlyContentTarget - metrics.completedCount > 0 ? `Sisa ${targets.monthlyContentTarget - metrics.completedCount}` : 'Tercapai 🎉'}</span>
          </div>
        </div>

        {/* KPI 3: Revenue Realization or Approval Rate */}
        {roleConfig.showInternalFee ? (
          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between gap-3 relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                <span>Realisasi Fee / Omzet</span>
              </span>
              <span className="text-[11px] font-bold font-mono text-teal-400 px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20">
                {metrics.revenueProgressPct}%
              </span>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono tracking-tight text-teal-400 truncate tabular-nums">
                Rp {metrics.totalFeeCompleted.toLocaleString('id-ID')}
              </div>
              <div className="w-full bg-slate-700/30 h-1.5 rounded-full overflow-hidden mt-2.5">
                <div
                  className="h-full bg-teal-500 transition-all duration-500"
                  style={{ width: `${metrics.revenueProgressPct}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/40">
              <span className="truncate">Target: Rp {(targets.monthlyRevenueTarget / 1000000).toFixed(0)} Jt</span>
              <span className="font-mono text-teal-400 font-semibold shrink-0">
                {targets.monthlyRevenueTarget - metrics.totalFeeCompleted > 0
                  ? `-Rp ${Math.round((targets.monthlyRevenueTarget - metrics.totalFeeCompleted) / 1000).toLocaleString('id-ID')}rb`
                  : 'Target Lolos ✅'}
              </span>
            </div>
          </div>
        ) : (
          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between gap-3 relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>First-Pass Approval</span>
              </span>
              <span className="text-[11px] font-bold font-mono text-blue-400 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                Direct Pass
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono tracking-tight text-blue-400 tabular-nums">
                  {metrics.firstPassRate}%
                </span>
                <span className="text-xs text-slate-400 font-medium">tanpa revisi</span>
              </div>
              <div className="w-full bg-slate-700/30 h-1.5 rounded-full overflow-hidden mt-2.5">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${metrics.firstPassRate}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/40">
              <span>Efisiensi alur kreatif</span>
              <span className="text-slate-300 font-semibold">{metrics.completedCount} disetujui</span>
            </div>
          </div>
        )}

        {/* KPI 4: Production Turnaround & Queue Health */}
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between gap-3 relative overflow-hidden`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Turnaround Speed</span>
            </span>
            <span className="text-[11px] font-bold font-mono text-purple-400 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20">
              SLA: {targets.targetSlaDays} Hari
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-purple-400 tabular-nums">
                {metrics.avgTurnaroundDays}
              </span>
              <span className="text-xs text-slate-400 font-medium">hari rata-rata</span>
            </div>
            <div className="w-full bg-slate-700/30 h-1.5 rounded-full overflow-hidden mt-2.5">
              <div
                className="h-full bg-purple-500 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((Number(metrics.avgTurnaroundDays) / (targets.targetSlaDays * 1.5)) * 100))}%`,
                }}
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/40">
            <span>{metrics.inProgressCount} aktif digarap</span>
            <span className="text-amber-400 font-semibold">{metrics.pendingApprovalCount} antre approval</span>
          </div>
        </div>
      </div>

      {/* Two Sub-Panels: Team Capacity Balance & Overdue Warning Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        {/* Team Workload & Capacity Index */}
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/60 border-slate-200'} flex flex-col gap-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h4 className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                Creator Capacity &amp; Workload Balance
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              {metrics.creatorWorkload.length} Staf Terdata
            </span>
          </div>

          <div className="space-y-2 mt-1">
            {metrics.creatorWorkload.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">
                Belum ada data creator pada filter ini.
              </div>
            ) : (
              metrics.creatorWorkload.slice(0, 5).map(([creator, w]) => {
                // Determine capacity health tag
                const isHeavy = w.active >= 4;
                const isOptimal = w.active >= 1 && w.active < 4;
                const isIdle = w.active === 0;

                const statusColor = isHeavy
                  ? 'text-red-400 bg-red-500/10 border-red-500/20'
                  : isOptimal
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : 'text-slate-400 bg-slate-800/40 border-slate-700/40';

                const statusLabel = isHeavy
                  ? 'Padat (≥4)'
                  : isOptimal
                  ? 'Optimal'
                  : 'Standby';

                return (
                  <div
                    key={creator}
                    className={`p-2.5 rounded-lg border ${
                      isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200'
                    } flex items-center justify-between gap-3 text-xs`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-red-600/20 text-red-500 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {creator.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className={`font-semibold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                          {creator}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {w.completed} konten selesai
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-200 tabular-nums">
                          {w.active} aktif
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SLA & Production Bottleneck Center */}
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/60 border-slate-200'} flex flex-col gap-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${metrics.overdueList.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
              <h4 className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                Production Bottleneck &amp; Overdue Monitor
              </h4>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {metrics.overdueList.length > 0 ? `${metrics.overdueList.length} Lewat Target` : 'Clean ✅'}
            </span>
          </div>

          <div className="space-y-2 mt-1">
            {metrics.overdueList.length === 0 ? (
              <div className={`p-4 rounded-lg border text-center flex flex-col items-center justify-center gap-1.5 ${
                isDarkMode ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <div className="text-xs font-bold">Semua Jadwal Produksi Tepat Waktu!</div>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  Tidak ada konten yang melewati tanggal jadwal posting di board saat ini. Alur kerja tim berjalan sesuai target SLA.
                </p>
              </div>
            ) : (
              metrics.overdueList.slice(0, 4).map(({ item, daysLate }) => (
                <div
                  key={item.ID}
                  className={`p-2.5 rounded-lg border ${
                    isDarkMode ? 'bg-red-950/20 border-red-900/40 text-slate-200' : 'bg-red-50 border-red-200 text-slate-800'
                  } flex items-center justify-between gap-3 text-xs`}
                >
                  <div className="min-w-0">
                    <div className="font-bold truncate flex items-center gap-1.5">
                      <span className="text-red-500">[{item.Klien}]</span>
                      <span>{item.Tema}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      PIC: {item.Creator || 'Unassigned'} · Jadwal: {item.JadwalPosting || '-'}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-600 text-white font-mono">
                      +{daysLate} Hari Terlambat
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Target Setting Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-md rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} shadow-2xl overflow-hidden flex flex-col`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-slate-800 bg-[#1e293b]/70' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-sm">Sesuaikan Target KPI Agensi</h3>
              </div>
              <button
                onClick={() => setShowTargetModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTargets} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Target Konten Selesai per Bulan
                </label>
                <input
                  type="number"
                  min="1"
                  value={tempTargets.monthlyContentTarget}
                  onChange={(e) => setTempTargets({ ...tempTargets, monthlyContentTarget: Number(e.target.value) || 1 })}
                  className={`w-full ${isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'} border rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-red-500`}
                  placeholder="Contoh: 30"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Jumlah total konten yang ditargetkan mencapai status Approved/Published setiap bulan.
                </span>
              </div>

              {roleConfig.showInternalFee && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Target Omzet Fee Komersil Bulanan (Rp)
                  </label>
                  <input
                    type="number"
                    step="500000"
                    min="100000"
                    value={tempTargets.monthlyRevenueTarget}
                    onChange={(e) => setTempTargets({ ...tempTargets, monthlyRevenueTarget: Number(e.target.value) || 0 })}
                    className={`w-full ${isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'} border rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-red-500`}
                    placeholder="Contoh: 15000000"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Rp {tempTargets.monthlyRevenueTarget.toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Standar SLA (Hari)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={tempTargets.targetSlaDays}
                    onChange={(e) => setTempTargets({ ...tempTargets, targetSlaDays: Number(e.target.value) || 1 })}
                    className={`w-full ${isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'} border rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-red-500`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Goal On-Time (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={tempTargets.onTimeGoalPercent}
                    onChange={(e) => setTempTargets({ ...tempTargets, onTimeGoalPercent: Number(e.target.value) || 85 })}
                    className={`w-full ${isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'} border rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-red-500`}
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTargetModal(false)}
                  className={`px-4 py-2 rounded-xl font-medium cursor-pointer ${
                    isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#E30000] hover:bg-[#c00000] text-white font-bold px-4 py-2 rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
