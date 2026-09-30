import React, { useState } from 'react';
import { GasApiService } from '../services/gasApiService';
import { storageService } from '../services/storageService';
import { liveSyncService } from '../services/liveSyncService';
import { authService } from '../services/authService';
import { parseSpreadsheetCsv } from '../data/seedData';
import {
  Cpu,
  Globe,
  Copy,
  CheckCircle2,
  RefreshCw,
  Terminal,
  ExternalLink,
  ShieldAlert,
  Zap,
  Download,
  RotateCcw,
  Building2,
  Users,
  Check,
  FileSpreadsheet,
  AlertCircle,
  Database,
  ArrowRight,
  Code,
  UploadCloud,
} from 'lucide-react';

interface HeadlessGasViewProps {
  gasUrl: string;
  onUpdateGasUrl: (url: string) => void;
  onResetData: () => void;
  onSyncSuccess?: (count: number) => void;
  isDarkMode?: boolean;
}

export const HeadlessGasView: React.FC<HeadlessGasViewProps> = ({
  gasUrl,
  onUpdateGasUrl,
  onResetData,
  onSyncSuccess,
  isDarkMode = true,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'all_sync' | 'crm_sync' | 'staff_sync' | 'content_sync'>('all_sync');

  // Unified / Global Sync State
  const [isGlobalSyncing, setIsGlobalSyncing] = useState(false);
  const [globalSyncFeedback, setGlobalSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // CRM Gateway State
  const [crmGasUrl, setCrmGasUrl] = useState(() => liveSyncService.getCrmGasUrl());
  const [isTestingCrm, setIsTestingCrm] = useState(false);
  const [crmTestResult, setCrmTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSyncingCrm, setIsSyncingCrm] = useState(false);
  const [crmSyncFeedback, setCrmSyncFeedback] = useState<string | null>(null);
  const [crmCsvInput, setCrmCsvInput] = useState('');
  const [copiedCrmCode, setCopiedCrmCode] = useState(false);

  // Staff Gateway State
  const [staffGasUrl, setStaffGasUrl] = useState(() => liveSyncService.getStaffGasUrl());
  const [isTestingStaff, setIsTestingStaff] = useState(false);
  const [staffTestResult, setStaffTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSyncingStaff, setIsSyncingStaff] = useState(false);
  const [staffSyncFeedback, setStaffSyncFeedback] = useState<string | null>(null);
  const [staffCsvInput, setStaffCsvInput] = useState('');
  const [copiedStaffCode, setCopiedStaffCode] = useState(false);

  // Content Tracker State
  const [contentGasUrl, setContentGasUrl] = useState(gasUrl);
  const [spreadsheetId, setSpreadsheetId] = useState('1el1tK4NGhoslMWECWzIo-7nBAEox6KZ-2TjlJ6WLIV8');
  const [testContentResult, setTestContentResult] = useState<{ ok: boolean; message: string; latencyMs: number } | null>(null);
  const [isTestingContent, setIsTestingContent] = useState(false);
  const [isSyncingContent, setIsSyncingContent] = useState(false);
  const [syncContentResult, setSyncContentResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isCopiedContentCode, setIsCopiedContentCode] = useState(false);

  // Data Counters
  const crmClients = storageService.getCrmClients();
  const staffDirectory = authService.getDirectory();
  const lastSyncTime = liveSyncService.getLastSyncTime();

  // Unified Sync Handler
  const handleSyncAll = async () => {
    setIsGlobalSyncing(true);
    setGlobalSyncFeedback(null);
    try {
      const stats = await liveSyncService.syncAll();
      setGlobalSyncFeedback({
        success: stats.success,
        message: stats.message,
      });
      if (stats.success && onSyncSuccess) {
        onSyncSuccess(stats.crmAdded + stats.staffAdded);
      }
    } catch (err: any) {
      setGlobalSyncFeedback({
        success: false,
        message: err?.message || 'Gagal sinkronisasi data',
      });
    } finally {
      setIsGlobalSyncing(false);
    }
  };

  // CRM Actions
  const handleSaveCrmUrl = () => {
    liveSyncService.setCrmGasUrl(crmGasUrl);
    setCrmSyncFeedback('URL Web App GAS CRM berhasil disimpan!');
    setTimeout(() => setCrmSyncFeedback(null), 3000);
  };

  const handleTestCrmConnection = async () => {
    if (!crmGasUrl.trim()) {
      setCrmTestResult({ ok: false, message: 'URL Spreadsheet / Web App GAS CRM belum diisi.' });
      return;
    }
    setIsTestingCrm(true);
    setCrmTestResult(null);
    try {
      if (crmGasUrl.includes('spreadsheets/d/')) {
        const res = await liveSyncService.fetchRemoteCrm(crmGasUrl.trim());
        if (res.success) {
          setCrmTestResult({ ok: true, message: `Koneksi Google Spreadsheet CRM Berhasil! Data klien tersinkron.` });
        } else {
          setCrmTestResult({ ok: false, message: res.error || 'Google Spreadsheet tidak dapat diakses.' });
        }
      } else {
        const res = await GasApiService.testConnection(crmGasUrl.trim());
        setCrmTestResult({ ok: res.ok, message: res.message });
      }
    } catch (e: any) {
      setCrmTestResult({ ok: false, message: e?.message || 'Koneksi gagal' });
    } finally {
      setIsTestingCrm(false);
    }
  };

  const handleFetchCrm = async () => {
    setIsSyncingCrm(true);
    setCrmSyncFeedback(null);
    try {
      const res = await liveSyncService.fetchRemoteCrm(crmGasUrl);
      if (res.success) {
        setCrmSyncFeedback(`Berhasil! Tersinkron ${res.added} klien baru & ${res.updated} diperbarui dari CRM.`);
      } else {
        setCrmSyncFeedback(`Gagal: ${res.error || 'Periksa URL GAS CRM.'}`);
      }
    } finally {
      setIsSyncingCrm(false);
    }
  };

  const handlePasteCrmCsv = () => {
    if (!crmCsvInput.trim()) {
      alert('Tempelkan teks CSV terlebih dahulu.');
      return;
    }
    const res = liveSyncService.syncCrmFromCsv(crmCsvInput);
    setCrmSyncFeedback(`Sukses Impor CSV! ${res.added} klien baru ditambahkan, ${res.updated} diperbarui.`);
    setCrmCsvInput('');
  };

  // Staff Actions
  const handleSaveStaffUrl = () => {
    liveSyncService.setStaffGasUrl(staffGasUrl);
    setStaffSyncFeedback('URL Web App GAS Database Staff berhasil disimpan!');
    setTimeout(() => setStaffSyncFeedback(null), 3000);
  };

  const handleTestStaffConnection = async () => {
    if (!staffGasUrl.trim()) {
      setStaffTestResult({ ok: false, message: 'URL Spreadsheet / Web App GAS Database Staff belum diisi.' });
      return;
    }
    setIsTestingStaff(true);
    setStaffTestResult(null);
    try {
      if (staffGasUrl.includes('spreadsheets/d/')) {
        const res = await liveSyncService.fetchRemoteStaff(staffGasUrl.trim());
        if (res.success) {
          setStaffTestResult({ ok: true, message: `Koneksi Google Spreadsheet Database Staff Berhasil! Data staf tersinkron.` });
        } else {
          setStaffTestResult({ ok: false, message: res.error || 'Google Spreadsheet tidak dapat diakses.' });
        }
      } else {
        const res = await GasApiService.testConnection(staffGasUrl.trim());
        setStaffTestResult({ ok: res.ok, message: res.message });
      }
    } catch (e: any) {
      setStaffTestResult({ ok: false, message: e?.message || 'Koneksi gagal' });
    } finally {
      setIsTestingStaff(false);
    }
  };

  const handleFetchStaff = async () => {
    setIsSyncingStaff(true);
    setStaffSyncFeedback(null);
    try {
      const res = await liveSyncService.fetchRemoteStaff(staffGasUrl);
      if (res.success) {
        setStaffSyncFeedback(`Berhasil! Tersinkron ${res.added} staf baru & ${res.updated} diperbarui dari Database Staff.`);
      } else {
        setStaffSyncFeedback(`Gagal: ${res.error || 'Periksa URL GAS Database Staff.'}`);
      }
    } finally {
      setIsSyncingStaff(false);
    }
  };

  const handlePasteStaffCsv = () => {
    if (!staffCsvInput.trim()) {
      alert('Tempelkan teks CSV terlebih dahulu.');
      return;
    }
    const res = liveSyncService.syncStaffFromCsv(staffCsvInput);
    setStaffSyncFeedback(`Sukses Impor CSV! ${res.added} staf baru ditambahkan, ${res.updated} diperbarui. Total staf: ${res.total}`);
    setStaffCsvInput('');
  };

  // Content Tracker Actions
  const handleTestContentConnection = async () => {
    let clean = (contentGasUrl || '').trim();
    while (clean.endsWith('/')) clean = clean.slice(0, -1);
    if (clean.includes('/macros/s/') && !clean.endsWith('/exec') && !clean.endsWith('/dev')) clean += '/exec';
    setContentGasUrl(clean);

    setIsTestingContent(true);
    setTestContentResult(null);
    try {
      const res = await GasApiService.testConnection(clean, spreadsheetId.trim());
      setTestContentResult(res);
    } catch (e: any) {
      setTestContentResult({
        ok: false,
        message: e?.message || 'Gagal terhubung ke GAS',
        latencyMs: 0,
      });
    } finally {
      setIsTestingContent(false);
    }
  };

  const handleSyncContent = async () => {
    let cleanUrl = (contentGasUrl || '').trim();
    if (!cleanUrl) {
      alert('Masukkan URL Web App GAS terlebih dahulu!');
      return;
    }
    setIsSyncingContent(true);
    setSyncContentResult(null);

    const sId = spreadsheetId.trim() || '1el1tK4NGhoslMWECWzIo-7nBAEox6KZ-2TjlJ6WLIV8';

    try {
      let res = await GasApiService.fetchContentFromGas(cleanUrl, sId);
      if (res && res.ok && res.data) {
        storageService.saveContent(res.data);
        if (res.rateCards && res.rateCards.length > 0) {
          localStorage.setItem('obee_pcs_rate_card_v1', JSON.stringify(res.rateCards));
        }
        setSyncContentResult({
          ok: true,
          message: `Sukses! ${res.data.length} baris data konten berhasil disinkronkan.`,
        });
        if (onSyncSuccess) onSyncSuccess(res.data.length);
      } else {
        setSyncContentResult({
          ok: false,
          message: `Gagal menarik data: ${res?.error || 'Periksa endpoint GAS.'}`,
        });
      }
    } catch (err: any) {
      setSyncContentResult({
        ok: false,
        message: `Gagal menarik data: ${err?.message || String(err)}`,
      });
    } finally {
      setIsSyncingContent(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl pb-12">
      {/* Intro Panel */}
      <div className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-3xl p-6 flex flex-col gap-4 shadow-xl`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Live Sync Engine: CRM & Database Staff
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  Real-Time Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Tiap ada update klien di CRM atau staf di Database Staff, data langsung ditarik otomatis ke Project Control.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSyncAll}
              disabled={isGlobalSyncing}
              className="px-4 py-2.5 bg-[#E30000] hover:bg-[#c00000] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/40 transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <RefreshCw className={`w-4 h-4 ${isGlobalSyncing ? 'animate-spin' : ''}`} />
              <span>{isGlobalSyncing ? 'Menarik Data...' : 'Tarik Semua Data Sekarang'}</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {globalSyncFeedback && (
          <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 animate-in fade-in ${
            globalSyncFeedback.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            {globalSyncFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            )}
            <span>{globalSyncFeedback.message}</span>
          </div>
        )}

        {/* Quick Sync Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Klien Komersil (CRM)</span>
              <Building2 className="w-4 h-4 text-red-500" />
            </div>
            <div className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {crmClients.length} Klien
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>10 Klien Master Terhubung</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Database Tim & Staf</span>
              <Users className="w-4 h-4 text-sky-500" />
            </div>
            <div className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {staffDirectory.length} Anggota
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Data Rekening & Kontak Aktif</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Terakhir Sinkron</span>
              <RefreshCw className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xs font-mono font-bold mt-2 text-emerald-400">
              {lastSyncTime
                ? new Date(lastSyncTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : 'Belum pernah'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Status: Siap Sinkron</div>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className={`flex items-center gap-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-2 text-xs font-semibold overflow-x-auto`}>
        <button
          onClick={() => setActiveSubTab('all_sync')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'all_sync'
              ? 'bg-[#E30000] text-white shadow-md shadow-red-950/40 font-bold'
              : isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Pusat Sinkronisasi Langsung</span>
        </button>

        <button
          onClick={() => setActiveSubTab('crm_sync')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'crm_sync'
              ? 'bg-[#E30000] text-white shadow-md shadow-red-950/40 font-bold'
              : isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Gateway CRM Spreadsheet</span>
        </button>

        <button
          onClick={() => setActiveSubTab('staff_sync')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'staff_sync'
              ? 'bg-[#E30000] text-white shadow-md shadow-red-950/40 font-bold'
              : isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Gateway Database Staff</span>
        </button>

        <button
          onClick={() => setActiveSubTab('content_sync')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'content_sync'
              ? 'bg-[#E30000] text-white shadow-md shadow-red-950/40 font-bold'
              : isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Gateway Tracker Konten</span>
        </button>
      </div>

      {/* Tab 1: Pusat Sinkronisasi Terpadu */}
      {activeSubTab === 'all_sync' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CRM Quick Box */}
            <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'} shadow-lg space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Spreadsheet CRM (Klien Komersil)</h4>
                    <p className="text-[11px] text-slate-400">Master Brand & PIC Klien</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400">
                  {crmClients.length} Klien
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">URL Web App GAS CRM:</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={crmGasUrl}
                    onChange={(e) => setCrmGasUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border font-mono ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                  <button
                    onClick={handleSaveCrmUrl}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleTestCrmConnection}
                  disabled={isTestingCrm}
                  className="flex-1 py-2 rounded-xl border text-xs font-semibold hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  {isTestingCrm ? 'Menguji...' : 'Uji Koneksi'}
                </button>
                <button
                  onClick={handleFetchCrm}
                  disabled={isSyncingCrm}
                  className="flex-1 py-2 bg-[#E30000] hover:bg-[#c00000] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {isSyncingCrm ? 'Menarik...' : 'Tarik CRM'}
                </button>
              </div>

              {crmTestResult && (
                <div className={`p-2.5 rounded-xl border text-[11px] ${
                  crmTestResult.ok ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {crmTestResult.message}
                </div>
              )}
            </div>

            {/* Database Staff Quick Box */}
            <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'} shadow-lg space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Spreadsheet Database Staff</h4>
                    <p className="text-[11px] text-slate-400">Master Staf, Rekening & Fee</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                  {staffDirectory.length} Staf
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">URL Web App GAS Staff:</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={staffGasUrl}
                    onChange={(e) => setStaffGasUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border font-mono ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                  <button
                    onClick={handleSaveStaffUrl}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleTestStaffConnection}
                  disabled={isTestingStaff}
                  className="flex-1 py-2 rounded-xl border text-xs font-semibold hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  {isTestingStaff ? 'Menguji...' : 'Uji Koneksi'}
                </button>
                <button
                  onClick={handleFetchStaff}
                  disabled={isSyncingStaff}
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {isSyncingStaff ? 'Menarik...' : 'Tarik Staf'}
                </button>
              </div>

              {staffTestResult && (
                <div className={`p-2.5 rounded-xl border text-[11px] ${
                  staffTestResult.ok ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {staffTestResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Fallback Tool: Direct CSV Paste for CRM & Staff */}
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'} shadow-lg space-y-4`}>
            <div className="flex items-center gap-2.5">
              <UploadCloud className="w-5 h-5 text-amber-500" />
              <div>
                <h4 className="font-bold text-sm">Metode Cepat: Tempel Data CSV Langsung</h4>
                <p className="text-[11px] text-slate-400">
                  Jika Anda belum sempat men-deploy skrip Google Apps Script, cukup copy-paste seluruh baris CSV dari spreadsheet ke kotak di bawah ini untuk sinkronisasi seketika (0.01 detik).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Tempel CSV Klien CRM:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Header: id, name, company, phone, ...</span>
                </div>
                <textarea
                  rows={4}
                  value={crmCsvInput}
                  onChange={(e) => setCrmCsvInput(e.target.value)}
                  placeholder="Tempel baris teks CSV CRM di sini..."
                  className={`w-full p-3 text-xs font-mono rounded-xl border focus:outline-none focus:border-red-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
                <button
                  onClick={handlePasteCrmCsv}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
                >
                  Terapkan & Sinkronkan Data CRM
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Tempel CSV Database Staff:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Header: ID, Nama, Divisi, Email, Rekening...</span>
                </div>
                <textarea
                  rows={4}
                  value={staffCsvInput}
                  onChange={(e) => setStaffCsvInput(e.target.value)}
                  placeholder="Tempel baris teks CSV Database Staff di sini..."
                  className={`w-full p-3 text-xs font-mono rounded-xl border focus:outline-none focus:border-red-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
                <button
                  onClick={handlePasteStaffCsv}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
                >
                  Terapkan & Sinkronkan Data Staf
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Gateway CRM Details & GAS Code */}
      {activeSubTab === 'crm_sync' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'} shadow-lg space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base">Skrip Google Apps Script untuk Spreadsheet CRM</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Pasang skrip ini di spreadsheet CRM Anda melalui menu <b>Extensions &gt; Apps Script</b>, lalu klik <b>Deploy &gt; New deployment &gt; Web app</b> (Access: Anyone).
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(liveSyncService.generateCrmGasScript());
                  setCopiedCrmCode(true);
                  setTimeout(() => setCopiedCrmCode(false), 2500);
                }}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {copiedCrmCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCrmCode ? 'Tersalin!' : 'Salin Skrip GAS CRM'}</span>
              </button>
            </div>

            <pre className={`p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-80 border ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}>
              {liveSyncService.generateCrmGasScript()}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Gateway Staff Details & GAS Code */}
      {activeSubTab === 'staff_sync' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'} shadow-lg space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base">Skrip Google Apps Script untuk Database Staff</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Pasang skrip ini di spreadsheet Database Staff Anda melalui menu <b>Extensions &gt; Apps Script</b>, lalu deploy sebagai Web App (Access: Anyone).
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(liveSyncService.generateStaffGasScript());
                  setCopiedStaffCode(true);
                  setTimeout(() => setCopiedStaffCode(false), 2500);
                }}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {copiedStaffCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStaffCode ? 'Tersalin!' : 'Salin Skrip GAS Staf'}</span>
              </button>
            </div>

            <pre className={`p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-80 border ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}>
              {liveSyncService.generateStaffGasScript()}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 4: Content Tracker Gateway (Legacy) */}
      {activeSubTab === 'content_sync' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'} shadow-lg space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base">Skrip Google Apps Script Tracker Konten</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Menghubungkan Kanban kartu konten dan tarif Rate Card ke spreadsheet utama.
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(GasApiService.getHeadlessGasTemplateCode());
                  setIsCopiedContentCode(true);
                  setTimeout(() => setIsCopiedContentCode(false), 2500);
                }}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {isCopiedContentCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedContentCode ? 'Tersalin!' : 'Salin Skrip GAS Konten'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <input
                type="url"
                value={contentGasUrl}
                onChange={(e) => setContentGasUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className={`p-2.5 text-xs font-mono rounded-xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestContentConnection}
                  disabled={isTestingContent}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-semibold hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  {isTestingContent ? 'Menguji...' : 'Uji Koneksi'}
                </button>
                <button
                  onClick={handleSyncContent}
                  disabled={isSyncingContent}
                  className="flex-1 py-2.5 bg-[#E30000] hover:bg-[#c00000] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {isSyncingContent ? 'Menarik...' : 'Tarik Konten'}
                </button>
              </div>
            </div>

            {testContentResult && (
              <div className={`p-3 rounded-xl border text-xs ${
                testContentResult.ok ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                {testContentResult.message} (Latency: {testContentResult.latencyMs}ms)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
