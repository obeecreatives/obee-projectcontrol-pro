import React, { useState } from 'react';
import { liveSyncService } from '../services/liveSyncService';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { kanbanSyncService } from '../services/kanbanSyncService';
import {
  RefreshCw,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  Upload,
  ExternalLink,
  Link2,
  Sparkles,
  Info,
  Check,
  Kanban,
  Send,
  Copy,
  Zap,
} from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: (message: string) => void;
  isDarkMode?: boolean;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
  isDarkMode = true,
}) => {
  const [crmUrl, setCrmUrl] = useState(() => liveSyncService.getCrmGasUrl());
  const [staffUrl, setStaffUrl] = useState(() => liveSyncService.getStaffGasUrl());
  const [kanbanUrl, setKanbanUrl] = useState(() => kanbanSyncService.getGasUrl());

  const [isSyncingCrm, setIsSyncingCrm] = useState(false);
  const [crmStatus, setCrmStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const [isSyncingStaff, setIsSyncingStaff] = useState(false);
  const [staffStatus, setStaffStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const [isSyncingCards, setIsSyncingCards] = useState(false);
  const [cardStatus, setCardStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const [isPushingCards, setIsPushingCards] = useState(false);
  const [pushStatus, setPushStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => kanbanSyncService.getAutoSyncEnabled());
  const [copiedKanbanScript, setCopiedKanbanScript] = useState(false);

  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [allStatus, setAllStatus] = useState<{ ok: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const currentCrmClients = storageService.getCrmClients();
  const currentStaff = authService.getDirectory();
  const currentCards = storageService.getContent();
  const lastSyncTime = liveSyncService.getLastSyncTime();
  const lastCardSync = kanbanSyncService.getLastSyncTime();

  const handleSaveUrls = () => {
    liveSyncService.setCrmGasUrl(crmUrl);
    liveSyncService.setStaffGasUrl(staffUrl);
    kanbanSyncService.setGasUrl(kanbanUrl);
  };

  const handleSyncKanbanCards = async () => {
    handleSaveUrls();
    setIsSyncingCards(true);
    setCardStatus(null);
    try {
      const res = await kanbanSyncService.pullCardsFromSpreadsheet();
      if (res.success) {
        setCardStatus({
          ok: true,
          message: `Berhasil! ${res.added} kartu baru ditambahkan, ${res.updated} diperbarui. Total: ${res.total} kartu aktif.`,
        });
        if (onSyncComplete) onSyncComplete('Seluruh kartu Kanban berhasil disinkronkan!');
      } else {
        setCardStatus({
          ok: false,
          message: res.error || 'Gagal menarik data kartu dari Spreadsheet.',
        });
      }
    } catch (err: any) {
      setCardStatus({ ok: false, message: err?.message || 'Gagal sinkronisasi kartu' });
    } finally {
      setIsSyncingCards(false);
    }
  };

  const handlePushAllCards = async () => {
    handleSaveUrls();
    setIsPushingCards(true);
    setPushStatus(null);
    try {
      const res = await kanbanSyncService.pushAllCardsToSpreadsheet(storageService.getContent());
      if (res.success) {
        setPushStatus({
          ok: true,
          message: `Sukses! Seluruh ${res.count} kartu Kanban berhasil dikirim & diperbarui di baris Spreadsheet.`,
        });
        if (onSyncComplete) onSyncComplete('Seluruh kartu Kanban berhasil dikirim ke Spreadsheet!');
      } else {
        setPushStatus({
          ok: false,
          message: res.message || 'Gagal push kartu ke Spreadsheet.',
        });
      }
    } catch (err: any) {
      setPushStatus({ ok: false, message: err?.message || 'Gagal push kartu' });
    } finally {
      setIsPushingCards(false);
    }
  };

  const handleToggleAutoSync = () => {
    const nextVal = !autoSyncEnabled;
    setAutoSyncEnabled(nextVal);
    kanbanSyncService.setAutoSyncEnabled(nextVal);
  };

  const handleSyncCrm = async () => {
    handleSaveUrls();
    setIsSyncingCrm(true);
    setCrmStatus(null);
    try {
      const res = await liveSyncService.fetchRemoteCrm(crmUrl);
      if (res.success) {
        setCrmStatus({
          ok: true,
          message: `Berhasil! ${res.added} klien baru ditambahkan, ${res.updated} diperbarui. Total: ${storageService.getCrmClients().length} klien.`,
        });
        if (onSyncComplete) onSyncComplete('Data CRM berhasil disinkronkan!');
      } else {
        setCrmStatus({
          ok: false,
          message: res.error || 'Gagal menarik data CRM.',
        });
      }
    } catch (err: any) {
      setCrmStatus({ ok: false, message: err?.message || 'Gagal sinkronisasi CRM' });
    } finally {
      setIsSyncingCrm(false);
    }
  };

  const handleSyncStaff = async () => {
    handleSaveUrls();
    setIsSyncingStaff(true);
    setStaffStatus(null);
    try {
      const res = await liveSyncService.fetchRemoteStaff(staffUrl);
      if (res.success) {
        setStaffStatus({
          ok: true,
          message: `Berhasil! ${res.added} staf baru ditambahkan, ${res.updated} diperbarui. Total: ${authService.getDirectory().length} staf.`,
        });
        if (onSyncComplete) onSyncComplete('Data Database Staff berhasil disinkronkan!');
      } else {
        setStaffStatus({
          ok: false,
          message: res.error || 'Gagal menarik data staf.',
        });
      }
    } catch (err: any) {
      setStaffStatus({ ok: false, message: err?.message || 'Gagal sinkronisasi staf' });
    } finally {
      setIsSyncingStaff(false);
    }
  };

  const handleSyncBoth = async () => {
    handleSaveUrls();
    setIsSyncingAll(true);
    setAllStatus(null);
    try {
      const stats = await liveSyncService.syncAll();
      if (stats.success) {
        setAllStatus({ ok: true, message: stats.message });
        if (onSyncComplete) onSyncComplete(stats.message);
      } else {
        setAllStatus({ ok: false, message: stats.message });
      }
    } catch (err: any) {
      setAllStatus({ ok: false, message: err?.message || 'Gagal sinkronisasi data' });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'crm' | 'staff') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      if (type === 'crm') {
        const res = liveSyncService.syncCrmFromCsv(text);
        setCrmStatus({
          ok: true,
          message: `File CSV diproses: ${res.added} klien baru, ${res.updated} diperbarui. Total: ${storageService.getCrmClients().length} klien CRM aktif.`,
        });
      } else {
        const res = liveSyncService.syncStaffFromCsv(text);
        setStaffStatus({
          ok: true,
          message: `File CSV diproses: ${res.added} staf baru, ${res.updated} staf diperbarui. Total: ${res.total} staf aktif.`,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
              <RefreshCw className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                Sinkronisasi Spreadsheet Live
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Cloud & CSV
                </span>
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Hubungkan link Google Spreadsheet CRM dan Database Staff untuk update instan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Guide Banner */}
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
              isDarkMode
                ? 'bg-blue-950/40 border-blue-800/50 text-blue-200'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Format Link yang Didukung:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-blue-300">
                <li>
                  <strong className="text-white">Link Google Spreadsheet:</strong> Pastikan spreadsheet diset ke <em>"Siapa saja yang memiliki link dapat melihat"</em>.
                </li>
                <li>
                  <strong className="text-white">Link Web App GAS:</strong> URL Google Apps Script yang di-deploy (akhiran <code>/exec</code>).
                </li>
                <li>
                  <strong className="text-white">Upload File CSV:</strong> Anda juga bisa langsung mengunggah file CSV dari komputer Anda.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 1: Spreadsheet CRM */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-500" />
                <span className="font-bold text-sm">1. Spreadsheet CRM (Klien Komersil)</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400 font-mono font-bold">
                {currentCrmClients.length} Klien Terdaftar
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Link URL Spreadsheet CRM / GAS Web App
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={crmUrl}
                    onChange={(e) => setCrmUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/... atau https://script.google.com/..."
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-red-500 font-mono ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <button
                  onClick={handleSyncCrm}
                  disabled={isSyncingCrm}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-lg shadow-red-600/20 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCrm ? 'animate-spin' : ''}`} />
                  <span>{isSyncingCrm ? 'Menarik...' : 'Tarik CRM'}</span>
                </button>
              </div>
            </div>

            {/* Alternative: Upload CSV CRM */}
            <div className="flex items-center justify-between pt-1">
              <label className="text-[11px] text-slate-400 flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Atau upload file <strong>CRM PRO - API.csv</strong></span>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'crm')}
                />
              </label>
            </div>

            {/* CRM Status Feedback */}
            {crmStatus && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  crmStatus.ok
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                    : 'bg-red-950/50 border-red-800 text-red-300'
                }`}
              >
                {crmStatus.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{crmStatus.message}</span>
              </div>
            )}
          </div>

          {/* Section 2: Spreadsheet Database Staff */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-sm">2. Spreadsheet Database Tim & Staf</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 font-mono font-bold">
                {currentStaff.length} Staf Terdaftar
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Link URL Spreadsheet Staff / GAS Web App
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={staffUrl}
                    onChange={(e) => setStaffUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/... atau https://script.google.com/..."
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-blue-500 font-mono ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <button
                  onClick={handleSyncStaff}
                  disabled={isSyncingStaff}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingStaff ? 'animate-spin' : ''}`} />
                  <span>{isSyncingStaff ? 'Menarik...' : 'Tarik Staf'}</span>
                </button>
              </div>
            </div>

            {/* Alternative: Upload CSV Staff */}
            <div className="flex items-center justify-between pt-1">
              <label className="text-[11px] text-slate-400 flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Atau upload file <strong>DATABASE STAFF PRO - API.csv</strong></span>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'staff')}
                />
              </label>
            </div>

            {/* Staff Status Feedback */}
            {staffStatus && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  staffStatus.ok
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                    : 'bg-red-950/50 border-red-800 text-red-300'
                }`}
              >
                {staffStatus.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{staffStatus.message}</span>
              </div>
            )}
          </div>

          {/* Section 3: Spreadsheet Kartu Kanban (Full Otomatis 2-Arah) */}
          <div
            className={`p-4 rounded-xl border space-y-3.5 ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Kanban className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-sm">3. Spreadsheet Seluruh Kartu Kanban</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
                  2-Arah Real-Time
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-bold">
                {currentCards.length} Kartu Aktif
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Setiap kali kartu digeser (drag & drop status), diedit, dibuat baru, atau dicentang checklist-nya, data langsung terkirim dan terupdate di spreadsheet secara otomatis.
            </p>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Link URL Web App GAS Kartu Kanban
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={kanbanUrl}
                    onChange={(e) => setKanbanUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-emerald-500 font-mono ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <button
                  onClick={handleSyncKanbanCards}
                  disabled={isSyncingCards}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                  title="Tarik data terbaru dari Spreadsheet ke Kanban"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCards ? 'animate-spin' : ''}`} />
                  <span>{isSyncingCards ? 'Menarik...' : 'Tarik Kartu'}</span>
                </button>
                <button
                  onClick={handlePushAllCards}
                  disabled={isPushingCards}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  title="Kirim seluruh kartu yang ada ke Spreadsheet"
                >
                  <Send className={`w-3.5 h-3.5 ${isPushingCards ? 'animate-pulse' : ''}`} />
                  <span>{isPushingCards ? 'Mengirim...' : 'Push Seluruh Kartu'}</span>
                </button>
              </div>
            </div>

            {/* Auto-Sync Toggle & GAS Script Copy */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={autoSyncEnabled}
                  onChange={handleToggleAutoSync}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 rounded border-slate-700"
                />
                <span className="font-semibold text-[11px] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Auto-Sync Otomatis di Background (Tiap 45 detik)
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(kanbanSyncService.generateFullTwoWayGasScript());
                  setCopiedKanbanScript(true);
                  setTimeout(() => setCopiedKanbanScript(false), 2500);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {copiedKanbanScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKanbanScript ? 'Skrip GAS v3.2 Tersalin!' : 'Salin Skrip GAS 2-Arah v3.2 (Support Foto)'}</span>
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Proteksi Anti-Hapus Aktif:</strong> Cover visual kartu sekarang dikunci di local storage aman, sehingga tidak akan hilang walau sinkronisasi otomatis berjalan. Klik <strong>Push Seluruh Kartu</strong> untuk menyimpan link cover ke spreadsheet.
              </span>
            </div>

            {/* Kanban Status Feedback */}
            {cardStatus && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  cardStatus.ok
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                    : 'bg-red-950/50 border-red-800 text-red-300'
                }`}
              >
                {cardStatus.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{cardStatus.message}</span>
              </div>
            )}

            {pushStatus && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  pushStatus.ok
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                    : 'bg-red-950/50 border-red-800 text-red-300'
                }`}
              >
                {pushStatus.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{pushStatus.message}</span>
              </div>
            )}

            {lastCardSync && (
              <p className="text-[10px] text-slate-500 font-mono">
                Sinkronisasi kartu terakhir: {new Date(lastCardSync).toLocaleString('id-ID')}
              </p>
            )}
          </div>

          {/* Sync All Combined Result */}
          {allStatus && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                allStatus.ok
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                  : 'bg-red-950/60 border-red-800 text-red-200'
              }`}
            >
              {allStatus.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <div>
                <p className="font-semibold">{allStatus.ok ? 'Sinkronisasi Berhasil' : 'Pemberitahuan Sinkronisasi'}</p>
                <p className="text-[11px] mt-0.5">{allStatus.message}</p>
              </div>
            </div>
          )}

          {lastSyncTime && (
            <p className="text-[11px] text-center text-slate-500 font-mono">
              Terakhir disinkronkan: {new Date(lastSyncTime).toLocaleString('id-ID')}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-inherit flex flex-wrap items-center justify-between gap-3 bg-slate-900/30">
          <button
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
              isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleSaveUrls();
                onClose();
              }}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Simpan Link Saja
            </button>
            <button
              onClick={handleSyncBoth}
              disabled={isSyncingAll}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:opacity-95 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-red-500/25 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Sedang Menyinkronkan...' : 'Tarik Semua Data Sekarang'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
