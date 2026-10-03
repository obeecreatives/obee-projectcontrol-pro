import React, { useState } from 'react';
import { UserRole } from '../types';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import {
  FileText,
  Printer,
  Copy,
  Check,
  Code2,
  Cpu,
  Layers,
  ShieldCheck,
  Workflow,
  BookOpen,
  Calendar,
  BarChart3,
  Compass,
  Download,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  GitBranch,
  Palette,
} from 'lucide-react';

interface DeveloperDocsViewProps {
  activeRole: UserRole;
  isDarkMode?: boolean;
}

export const DeveloperDocsView: React.FC<DeveloperDocsViewProps> = ({
  activeRole,
  isDarkMode = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [printScope, setPrintScope] = useState<'all' | 'palette'>('all');

  const contentItems = storageService.getContent();
  const staffList = authService.getDirectory();
  const rateCards = storageService.getRateCards();

  const handlePrintAll = () => {
    setPrintScope('all');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handlePrintPalette = () => {
    setPrintScope('palette');
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintScope('all'), 1000);
    }, 100);
  };

  const handleCopyMarkdown = () => {
    const markdown = `# 📖 Buku Panduan & Dokumentasi Sistem: obeecreatives Workspace OS
Versi: v2.4.0 (Unified Workspace OS) | Terakhir Diperbarui: Oktober 2026

## 1. Ikhtisar & Arsitektur Aplikasi
obeecreatives Workspace OS adalah platform Unified Workspace & Project Control Portal untuk agensi kreatif obeecreatives.
Menangani siklus produksi konten, kalender editorial, presensi tim geolokasi, payroll fee, rate card, dan integrasi Google Sheets.

### Struktur Direktori Utama:
- public/ (PWA manifest.json, ikon 192/512)
- src/components/ (Navbar, Sidebar, KanbanBoard, CalendarView, DashboardView, KpiWidget, StaffDatabaseView, RateCardView, HeadlessGasView, AccessSettingsView, DeveloperDocsView, Modals)
- src/services/ (storageService, authService, liveSyncService, geoService)
- src/types.ts & seedData.ts
- server.ts (Express Node.js + Gemini AI Proxy + Vite Middlewares)

## 2. Aspek Teknis & Pengembangan
- Framework: React 19 + TypeScript + Vite
- Styling: Tailwind CSS v4 (Zero-Pill Discipline, Tabular Figures font-mono)
- Backend Proxy: Express (server.ts) dengan endpoint AI secure:
  - /api/ai/caption
  - /api/ai/brainstorm
  - /api/ai/summarize-revisi
- PWA Compliant: Standalone mode, service worker caching, install guide modal (Android, iOS, PC).
- Storage: Local-First (localStorage) dengan live sync on-demand ke Google Apps Script (GAS).

## 3. Identitas & Palet Warna Resmi (Design Tokens)
### Brand Utama (Signature Red):
- Primary Brand Red: #E30000 (text-[#E30000] / bg-[#E30000]) - Logo, tag komersil
- Accent Action Red: #DC2626 (bg-red-600 / hover:bg-red-700) - Tombol aksi utama, active marker
- Highlight Red: #EF4444 (selection:bg-red-500) - Teks seleksi
- Dark Commercial Badge: rgba(69, 10, 10, 0.6) (bg-red-950/60 border-red-800/40 text-red-300)
- Light Commercial Badge: #FEF2F2 (bg-red-50 border-red-200 text-red-700)

### Mode Gelap (Dark Mode - Default):
- Canvas Root: #0B0F17 (bg-[#0b0f17])
- Sidebar Background: #0B1120 (bg-[#0b1120])
- Navbar & Header: #0F172A (95% blur) (bg-[#0f172a]/95)
- Column & Containers: #0F172A (90% blur) (bg-[#0f172a]/90)
- Surface Card & Modal: #1E293B (bg-[#1e293b]/90, hover:bg-[#1e293b])
- Input & Dropdown: #0F172A (bg-slate-900 border-slate-700)
- Border Utama: #1E293B (border-slate-800)
- Border Card / Interactive: #334155 (border-slate-700/80)
- Teks Primer: #F1F5F9 / #FFFFFF (text-slate-100 / text-white)
- Teks Sekunder: #94A3B8 (text-slate-400)
- Teks Tersier / Muted: #64748B (text-slate-500)

### Mode Terang (Light Mode):
- Canvas Root: #F8FAFC (bg-[#f8fafc] - Slate 50)
- Sidebar Background: #F8FAFC (bg-slate-50 border-slate-200)
- Navbar & Header: #FFFFFF (95% blur) (bg-white/95 border-slate-200)
- Column & Containers: #F1F5F9 (bg-slate-100/90)
- Surface Card & Modal: #FFFFFF (bg-white border-slate-200)
- Card Hover: #F8FAFC (hover:bg-slate-50)
- Input & Dropdown: #F8FAFC (bg-slate-50 border-slate-300)
- Border Utama: #E2E8F0 (border-slate-200)
- Border Card / Form: #CBD5E1 (border-slate-300)
- Teks Primer: #0F172A (text-slate-900)
- Teks Sekunder: #475569 (text-slate-600 / text-slate-700)
- Teks Tersier / Muted: #94A3B8 (text-slate-400 / text-slate-500)

### Kanban Status Workflow:
- New Idea: #94A3B8 (dot bg-slate-400, border-slate-500)
- On Progress: #FBBF24 (dot bg-amber-400, border-amber-500)
- Request Approval: #60A5FA (dot bg-blue-400, border-blue-500)
- Approved / RtP: #34D399 (dot bg-emerald-400, border-emerald-500)
- Scheduling: #2DD4BF (dot bg-teal-400, border-teal-500)
- Published: #818CF8 (dot bg-indigo-400, border-indigo-500)

### Role Badges:
- PM / Site Engineer: bg-red-500/10 text-red-400 border-red-500/30
- Web Developer: bg-emerald-500/10 text-emerald-400 border-emerald-500/30
- Admin: bg-amber-500/10 text-amber-400 border-amber-500/30
- Staff Creator: bg-blue-500/10 text-blue-400 border-blue-500/30
- Client Portal: bg-purple-500/10 text-purple-400 border-purple-500/30

## 4. Fitur Utama & Isi Aplikasi
1. Kanban Board (6 Alur Kolom): New Idea -> On Progress -> Request Approval -> Approved / RtP -> Scheduling -> Published.
2. Calendar View: Timeline produksi dan jadwal posting.
3. Executive KPI Widget: On-Time SLA %, Output Pace Tracker, Realisasi Omzet/Fee, Turnaround Days, Capacity Index, Overdue Monitor.
4. Presensi Geolokasi: WFO Studio (radius <= 500m), On-Site Klien, WFH, Mobile/Kafe.
5. Database Staf & Payroll: Direktori staf, gaji pokok, tunjangan, dan akumulasi fee otomatis per tanggal disetujui.
6. Rate Card: Upah standar konten desain dan video per format.
7. Headless GAS Sync: Sinkronisasi 2-arah ke Google Spreadsheet via webhook /exec.
8. Access Settings: Whitelist email, default PIN, reset PIN staf, dan audit security log.

## 5. Matriks Peran & Hak Akses (RBAC)
- Project Manager, Admin, Web Developer: Akses penuh semua modul, approval final, dan edit fee.
- Staff Creator, Site Engineer, Vendor: Dibatasi pada alur New Idea -> Request Approval, fee disembunyikan.
- Client: Hanya baca dan berikan feedback approval.

## 6. SOP Penggunaan Harian
- Alur Produksi: Buat Konten -> Garap -> Minta Approval -> Approved -> Posting.
- Presensi: Buka profil -> Set mode lokasi -> Izinkan browser GPS.
- Target KPI: Buka Dashboard -> Klik Target KPI -> Atur target bulanan -> Simpan.

## 7. Deployment Vercel & Troubleshooting
- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist
- Env Vars: GEMINI_API_KEY
- Modal Dialog Centered: Menggunakan React Portal (document.body) dengan max-h-[82vh] agar bebas clipping di laptop.`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`flex flex-col gap-6 max-w-5xl mx-auto pb-12 ${printScope === 'palette' ? 'print-palette-only' : ''}`}>
      {/* Print Specific CSS Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
          }
          aside, header, nav, .no-print {
            display: none !important;
          }
          .print-palette-only .print-non-palette {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-card {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            background: #ffffff !important;
            color: #0f172a !important;
          }
          .swatch-box {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      ` }} />

      {/* Header Banner */}
      <div className={`${isDarkMode ? 'bg-[#1e293b]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 sm:p-6 transition-colors print-card`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className={`text-lg sm:text-xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Buku Panduan &amp; Dokumentasi Sistem
                </h1>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-500">
                  v2.4.0 (Unified OS)
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Khusus Peran Developer &amp; Manajemen
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Dokumen resmi arsitektur teknis, identitas palet warna, panduan operasional, matriks RBAC, konfigurasi deployment, serta changelog pembaruan fitur <b>obeecreatives Workspace OS</b>.
              </p>
            </div>
          </div>

          {/* Action Buttons: Export to PDF & Copy Markdown */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 no-print flex-wrap">
            <button
              onClick={handleCopyMarkdown}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : isDarkMode
                  ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                  : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-800'
              }`}
              title="Salin isi dokumen dalam format Markdown (.md)"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-sky-400" />}
              <span>{copied ? 'Disalin!' : 'Salin Markdown'}</span>
            </button>

            <button
              onClick={handlePrintPalette}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-amber-500/40'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
              }`}
              title="Cetak atau unduh dokumen PDF khusus Palet Warna (Design Tokens)"
            >
              <Palette className="w-4 h-4 text-amber-500" />
              <span>Cetak PDF Palet Warna</span>
            </button>

            <button
              onClick={handlePrintAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#E30000] hover:bg-[#c00000] text-white shadow-md shadow-red-500/20 cursor-pointer transition-all active:scale-95"
              title="Cetak atau simpan seluruh panduan sebagai dokumen PDF resmi"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Seluruh PDF</span>
            </button>
          </div>
        </div>

        {/* Real-time System Telemetry Strip */}
        <div className={`mt-5 pt-4 border-t ${isDarkMode ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-100 bg-slate-50/60'} rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs`}>
          <div>
            <span className="text-slate-400 text-[10px] block">Database Konten</span>
            <span className="font-mono font-bold text-sm text-red-500 tabular-nums">
              {contentItems.length} Konten Aktif
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Direktori Staf</span>
            <span className="font-mono font-bold text-sm text-sky-400 tabular-nums">
              {staffList.length} Akun Terdaftar
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Katalog Rate Card</span>
            <span className="font-mono font-bold text-sm text-emerald-400 tabular-nums">
              {rateCards.length} Format Harga
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Peran Aktif Pengguna</span>
            <span className="font-mono font-bold text-sm text-amber-400 uppercase">
              {activeRole}
            </span>
          </div>
        </div>
      </div>

      {/* Chapter 1: Arsitektur & Struktur Direktori */}
      <section className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 sm:p-6 transition-colors print-card print-non-palette`}>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-5 h-5 text-red-500" />
          <h2 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            1. Arsitektur &amp; Struktur Direktori Kode
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Aplikasi mengusung arsitektur <b>SPA (Single Page Application)</b> modern berbasis React 19 dan TypeScript, dengan Vite sebagai bundler dan Express sebagai middleware server untuk proxy AI aman.
        </p>

        <div className={`p-4 rounded-xl border font-mono text-[11px] leading-relaxed overflow-x-auto ${isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
          <div className="text-amber-400 font-bold mb-1">📦 obeecreatives-workspace-os/</div>
          <div>├── public/                     # Aset manifest PWA, icon 192/512, robots.txt</div>
          <div>├── src/</div>
          <div>│   ├── components/            # Komponen antarmuka modular</div>
          <div>│   │   ├── Navbar.tsx             # Bilah atas, tema, PWA Install, fullscreen</div>
          <div>│   │   ├── Sidebar.tsx            # Navigasi utama desktop & tablet</div>
          <div>│   │   ├── KanbanBoard.tsx        # Papan 6 kolom siklus produksi</div>
          <div>│   │   ├── CalendarView.tsx       # Timeline jadwal syuting & tayang</div>
          <div>│   │   ├── DashboardView.tsx      # Dashboard eksekutif & ekspor rekap fee</div>
          <div>│   │   ├── KpiWidget.tsx          # Widget KPI SLA on-time & target pace</div>
          <div>│   │   ├── StaffDatabaseView.tsx  # Direktori staf, gaji pokok & payroll</div>
          <div>│   │   ├── RateCardView.tsx       # Tarif standar upah per jenis konten</div>
          <div>│   │   ├── HeadlessGasView.tsx    # Konsol sinkronisasi Google Apps Script</div>
          <div>│   │   ├── AccessSettingsView.tsx # Whitelist email, default PIN, audit logs</div>
          <div>│   │   ├── DeveloperDocsView.tsx  # Dokumentasi living & PDF generator</div>
          <div>│   │   └── PWAInstallButton.tsx   # Modal panduan install native HP & PC</div>
          <div>│   ├── services/              # Logika data & API proxy</div>
          <div>│   │   ├── storageService.ts      # Local-First engine, export CSV, KPI target</div>
          <div>│   │   ├── authService.ts         # Autentikasi sesi staf, PIN, & hak akses</div>
          <div>│   │   ├── liveSyncService.ts     # Integrasi GAS webhook & CSV parser</div>
          <div>│   │   └── geoService.ts          # Browser GPS & penghitung jarak studio</div>
          <div>│   ├── data/seedData.ts       # Data awal (Roles, Rate Card, CRM Klien)</div>
          <div>│   ├── types.ts               # Definisi TypeScript interface & types</div>
          <div>│   ├── App.tsx                # Routing aplikasi & state manajemen global</div>
          <div>│   └── main.tsx               # Entry point React 19</div>
          <div>├── server.ts                  # Server Express backend (AI proxy & serving)</div>
          <div>└── vite.config.ts             # Konfigurasi bundler Vite & PWA plugins</div>
        </div>
      </section>

      {/* Chapter 2: Aspek Teknis & Tech Stack */}
      <section className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 sm:p-6 transition-colors print-card print-non-palette`}>
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="w-5 h-5 text-sky-400" />
          <h2 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            2. Aspek Teknis &amp; Standar Pengembangan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <h3 className="font-bold text-sm text-red-500 mb-2">Frontend &amp; UI Principles</h3>
            <ul className="space-y-2 text-slate-300 leading-relaxed list-disc list-inside">
              <li><b>React 19 + TypeScript:</b> *Strict typing* di seluruh modul komponen tanpa kompromi `any`.</li>
              <li><b>Tailwind CSS v4:</b> Desain kontras tinggi dengan palet slate netral dan aksen merah khas obeecreatives (`#E30000`).</li>
              <li><b>Zero-Pill Discipline:</b> Metadata disajikan bersih tanpa tumpukan pill badge. Angka statistik keuangan selalu menggunakan `tabular-nums` atau `font-mono`.</li>
              <li><b>Screen Clipping Prevention:</b> Seluruh modal sistem (PWA, Sync, Profile, Content) menggunakan React Portal (`document.body`) dengan batas tinggi `max-h-[82vh]` dan scroll internal.</li>
            </ul>
          </div>

          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <h3 className="font-bold text-sm text-emerald-400 mb-2">Backend &amp; Security Architecture</h3>
            <ul className="space-y-2 text-slate-300 leading-relaxed list-disc list-inside">
              <li><b>Server-Side AI Proxy:</b> Node.js Express (`server.ts`) menangani pemanggilan model Gemini (caption &amp; rangkum revisi) menggunakan `@google/genai` dengan header User-Agent resmi. API Key tidak pernah terekspos ke browser.</li>
              <li><b>Local-First Storage:</b> State persisten tersimpan di `localStorage` klien dengan mekanisme migrasi otomatis skema data bila terdapat pembaruan struktur.</li>
              <li><b>PIN Hashing &amp; Session:</b> Sesi staf tersimpan dalam sesi lokal terenkapsulasi, dengan validasi PIN 6-digit.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Chapter 3: Identitas & Palet Warna Resmi (Design Tokens) */}
      <section className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 sm:p-6 transition-colors print-card`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                3. Identitas &amp; Palet Warna Resmi (Design Tokens)
              </h2>
              <p className="text-xs text-slate-400">
                Spesifikasi warna baku untuk Mode Terang, Mode Gelap, Alur Kanban, dan Hak Akses.
              </p>
            </div>
          </div>

          <div className="no-print">
            <button
              onClick={handlePrintPalette}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Bagian Ini (PDF)</span>
            </button>
          </div>
        </div>

        {/* 3.1 Brand Signature Red */}
        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-2.5">
            A. Brand Utama &amp; Signature Red
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="w-10 h-10 rounded-lg shrink-0 shadow swatch-box flex items-center justify-center font-black text-white text-[10px]" style={{ backgroundColor: '#E30000' }}>
                oc
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-200">Primary Brand Red</div>
                <div className="font-mono text-[11px] text-red-400 font-semibold">#E30000</div>
                <div className="text-[10px] text-slate-500 truncate">text-[#E30000] · Logo</div>
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="w-10 h-10 rounded-lg shrink-0 shadow swatch-box" style={{ backgroundColor: '#DC2626' }} />
              <div className="min-w-0">
                <div className="font-bold text-slate-200">Accent Action Red</div>
                <div className="font-mono text-[11px] text-red-400 font-semibold">#DC2626</div>
                <div className="text-[10px] text-slate-500 truncate">bg-red-600 · Tombol CTA</div>
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="w-10 h-10 rounded-lg shrink-0 shadow swatch-box" style={{ backgroundColor: '#EF4444' }} />
              <div className="min-w-0">
                <div className="font-bold text-slate-200">Selection Highlight</div>
                <div className="font-mono text-[11px] text-red-400 font-semibold">#EF4444</div>
                <div className="text-[10px] text-slate-500 truncate">selection:bg-red-500</div>
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="w-10 h-10 rounded-lg shrink-0 border border-red-800/40 swatch-box" style={{ backgroundColor: '#450a0a' }} />
              <div className="min-w-0">
                <div className="font-bold text-slate-200">Commercial Badge</div>
                <div className="font-mono text-[11px] text-red-300 font-semibold">rgba(69,10,10,.6)</div>
                <div className="text-[10px] text-slate-500 truncate">bg-red-950/60 · CRM Tag</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3.2 Dual Theme Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-xs">
          {/* Dark Mode Theme */}
          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-700/80' : 'bg-slate-900 text-slate-100 border-slate-800'} swatch-box`}>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="font-bold text-amber-400">🌙 Mode Gelap (Dark Mode)</span>
              <span className="text-[10px] font-mono text-slate-400">Default System</span>
            </div>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Canvas Root:</span>
                <span className="text-white font-bold bg-[#0b0f17] px-2 py-0.5 rounded border border-slate-800">#0B0F17</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sidebar Rail:</span>
                <span className="text-white font-bold bg-[#0b1120] px-2 py-0.5 rounded border border-slate-800">#0B1120</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Navbar &amp; Columns:</span>
                <span className="text-white font-bold bg-[#0f172a] px-2 py-0.5 rounded border border-slate-800">#0F172A (95% blur)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Surface Cards &amp; Modals:</span>
                <span className="text-white font-bold bg-[#1e293b] px-2 py-0.5 rounded border border-slate-700">#1E293B</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Borders (Default):</span>
                <span className="text-slate-300 font-bold">#1E293B (border-slate-800)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Borders (Active Cards):</span>
                <span className="text-slate-300 font-bold">#334155 (border-slate-700)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Text Primer / Body:</span>
                <span className="text-slate-100 font-bold">#F1F5F9 (text-slate-100)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Text Sekunder / Muted:</span>
                <span className="text-slate-400 font-bold">#94A3B8 / #64748B</span>
              </div>
            </div>
          </div>

          {/* Light Mode Theme */}
          <div className="p-4 rounded-xl border bg-[#f8fafc] text-slate-900 border-slate-300 swatch-box">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <span className="font-bold text-blue-600">☀️ Mode Terang (Light Mode)</span>
              <span className="text-[10px] font-mono text-slate-500">Clean &amp; High-Contrast</span>
            </div>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Canvas Root:</span>
                <span className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-300">#F8FAFC (Slate-50)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Sidebar Rail:</span>
                <span className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-300">#F8FAFC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Navbar &amp; Top Header:</span>
                <span className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-300">#FFFFFF (95% blur)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Columns &amp; Containers:</span>
                <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">#F1F5F9 (Slate-100)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Surface Cards &amp; Modals:</span>
                <span className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-300">#FFFFFF (Pure White)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Borders (Default):</span>
                <span className="text-slate-800 font-bold">#E2E8F0 (border-slate-200)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Borders (Inputs/Forms):</span>
                <span className="text-slate-800 font-bold">#CBD5E1 (border-slate-300)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Text Primer / Headings:</span>
                <span className="text-slate-900 font-bold">#0F172A (text-slate-900)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Text Sekunder / Muted:</span>
                <span className="text-slate-600 font-bold">#475569 / #94A3B8</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3.3 Status Workflow & Roles */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            B. Warna Aksen Workflow &amp; Hak Akses
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="w-3 h-3 rounded-full bg-slate-400 shrink-0 swatch-box" />
              <div className="min-w-0">
                <div className="font-bold text-[11px] truncate">New Idea</div>
                <div className="text-[10px] font-mono text-slate-400">#94A3B8</div>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0 swatch-box" />
              <div className="min-w-0">
                <div className="font-bold text-[11px] truncate">On Progress</div>
                <div className="text-[10px] font-mono text-amber-400">#FBBF24</div>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="w-3 h-3 rounded-full bg-blue-400 shrink-0 swatch-box" />
              <div className="min-w-0">
                <div className="font-bold text-[11px] truncate">Req Approval</div>
                <div className="text-[10px] font-mono text-blue-400">#60A5FA</div>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0 swatch-box" />
              <div className="min-w-0">
                <div className="font-bold text-[11px] truncate">Approved / RtP</div>
                <div className="text-[10px] font-mono text-emerald-400">#34D399</div>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="w-3 h-3 rounded-full bg-teal-400 shrink-0 swatch-box" />
              <div className="min-w-0">
                <div className="font-bold text-[11px] truncate">Scheduling</div>
                <div className="text-[10px] font-mono text-teal-400">#2DD4BF</div>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="w-3 h-3 rounded-full bg-indigo-400 shrink-0 swatch-box" />
              <div className="min-w-0">
                <div className="font-bold text-[11px] truncate">Published</div>
                <div className="text-[10px] font-mono text-indigo-400">#818CF8</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 4: Modul Fitur Utama */}
      <section className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 sm:p-6 transition-colors print-card print-non-palette`}>
        <div className="flex items-center gap-2 mb-3">
          <Workflow className="w-5 h-5 text-emerald-500" />
          <h2 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            4. Rincian Modul &amp; Fitur Aplikasi
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="font-bold text-sm text-red-500 mb-1">A. Kanban Board (6 Kolom Produksi)</div>
            <p className="text-slate-400 leading-relaxed">
              Alur kerja terstandardisasi: <b>New Idea</b> (Draf ide) $\rightarrow$ <b>On Progress</b> (Tahap syuting/editing) $\rightarrow$ <b>Request Approval</b> (Menunggu review PM/Klien) $\rightarrow$ <b>Approved / RtP</b> (Disetujui siap tayang, fee terkunci) $\rightarrow$ <b>Scheduling</b> (Terjadwal di meta/sosmed) $\rightarrow$ <b>Published</b> (Sudah tayang).
            </p>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="font-bold text-sm text-amber-500 mb-1">B. Executive KPI Widget (Dashboard)</div>
            <p className="text-slate-400 leading-relaxed">
              Memantau metrik performa: <b>On-Time Delivery Rate (SLA %)</b>, <b>Target Output Konten Bulanan vs Realisasi (Pace Tracker)</b>, <b>Realisasi Omzet/Fee</b>, <b>Rata-rata Turnaround Speed</b>, <b>Creator Workload Balance</b>, dan <b>Overdue Alert Center</b>.
            </p>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="font-bold text-sm text-sky-400 mb-1">C. Presensi Tim Berbasis Geolokasi (GPS)</div>
            <p className="text-slate-400 leading-relaxed">
              Mendeteksi secara real-time posisi kerja staf: <b>WFO</b> (Studio Mataram $\le 500$m), <b>On-Site</b> (Liputan klien), <b>WFH</b> (Remote rumah), atau <b>Mobile</b> (Kafe/Nomaden) disertai penghitungan jarak meter/km.
            </p>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="font-bold text-sm text-purple-400 mb-1">D. Headless GAS Sync &amp; Database Staf</div>
            <p className="text-slate-400 leading-relaxed">
              Sinkronisasi dua arah ke Google Sheets (via Google Apps Script webhook `/exec`) untuk mengimpor/mengekstrak data klien CRM dan direktori staf, serta fitur upload CSV instan tanpa batasan kuota.
            </p>
          </div>
        </div>
      </section>

      {/* Chapter 5: Matriks Peran & Hak Akses (RBAC) */}
      <section className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 sm:p-6 transition-colors print-card print-non-palette`}>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-red-500" />
          <h2 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            5. Matriks Peran &amp; Hak Akses (RBAC)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="pb-2.5 font-bold">Peran (Role)</th>
                <th className="pb-2.5 font-bold text-center">Kolom Kanban</th>
                <th className="pb-2.5 font-bold text-center">Lihat Fee / Omzet</th>
                <th className="pb-2.5 font-bold text-center">Approve ke RtP</th>
                <th className="pb-2.5 font-bold text-center">Edit Rate Card</th>
                <th className="pb-2.5 font-bold text-center">Akses Dev &amp; Whitelist</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'} font-medium`}>
              <tr>
                <td className="py-2.5 font-bold text-red-500">Project Manager</td>
                <td className="py-2.5 text-center font-mono">Bebas Semua</td>
                <td className="py-2.5 text-center text-emerald-500 font-bold">✅ Ya</td>
                <td className="py-2.5 text-center text-emerald-500 font-bold">✅ Ya</td>
                <td className="py-2.5 text-center text-emerald-500 font-bold">✅ Ya</td>
                <td className="py-2.5 text-center text-emerald-500 font-bold">✅ Ya</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-amber-500">Admin</td>
                <td className="py-2.5 text-center font-mono">Bebas Semua</td>
                <td className="py-2.5 text-center text-emerald-500 font-bold">✅ Ya</td>
                <td className="py-2.5 text-center text-emerald-500 font-bold">✅ Ya</td>
                <td className="py-2.5 text-center text-emerald-500 font-bold">✅ Ya</td>
                <td className="py-2.5 text-center text-emerald-500 font-bold">✅ Ya</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-sky-400">Web Developer</td>
                <td className="py-2.5 text-center font-mono">Bebas Semua</td>
                <td className="py-2.5 text-center text-emerald-500 font-bold">✅ Ya</td>
                <td className="py-2.5 text-center text-emerald-500 font-bold">✅ Ya</td>
                <td className="py-2.5 text-center text-emerald-500 font-bold">✅ Ya</td>
                <td className="py-2.5 text-center text-emerald-500 font-bold">✅ Ya (Penuh)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-300">Staff Creator</td>
                <td className="py-2.5 text-center font-mono text-slate-400">Idea $\leftrightarrow$ Req Approval</td>
                <td className="py-2.5 text-center text-red-400">❌ Tidak</td>
                <td className="py-2.5 text-center text-red-400">❌ Tidak</td>
                <td className="py-2.5 text-center text-red-400">❌ Tidak</td>
                <td className="py-2.5 text-center text-red-400">❌ Tidak</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-purple-400">Site Engineer</td>
                <td className="py-2.5 text-center font-mono text-slate-400">Idea $\leftrightarrow$ Req Approval</td>
                <td className="py-2.5 text-center text-red-400">❌ Tidak</td>
                <td className="py-2.5 text-center text-red-400">❌ Tidak</td>
                <td className="py-2.5 text-center text-red-400">❌ Tidak</td>
                <td className="py-2.5 text-center text-emerald-500 font-bold">✅ GAS Saja</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-400">Client (Klien)</td>
                <td className="py-2.5 text-center font-mono text-slate-400">Review &amp; Feedback</td>
                <td className="py-2.5 text-center text-red-400">❌ Tidak</td>
                <td className="py-2.5 text-center text-emerald-500 font-bold">✅ Ya</td>
                <td className="py-2.5 text-center text-red-400">❌ Tidak</td>
                <td className="py-2.5 text-center text-red-400">❌ Tidak</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Chapter 6: Deployment Vercel & Troubleshooting */}
      <section className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 sm:p-6 transition-colors print-card print-non-palette`}>
        <div className="flex items-center gap-2 mb-3">
          <GitBranch className="w-5 h-5 text-amber-500" />
          <h2 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            6. Panduan Deployment Vercel &amp; Troubleshooting
          </h2>
        </div>

        <div className="space-y-3 text-xs leading-relaxed">
          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <h3 className="font-bold text-sm text-slate-200 mb-2">⚙️ Parameter Konfigurasi Vercel</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-mono">
              <div>• Framework Preset: <span className="text-red-500 font-bold">Vite</span></div>
              <div>• Root Directory: <span className="text-red-500 font-bold">./</span></div>
              <div>• Build Command: <span className="text-red-500 font-bold">npm run build</span></div>
              <div>• Output Directory: <span className="text-red-500 font-bold">dist</span></div>
              <div>• Node.js Version: <span className="text-red-500 font-bold">20.x / 22.x</span></div>
              <div>• Env Variable: <span className="text-red-500 font-bold">GEMINI_API_KEY</span></div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <h3 className="font-bold text-sm text-amber-400 mb-2">🔧 Tanya Jawab &amp; Troubleshooting Masalah Umum</h3>
            <div className="space-y-2.5 text-slate-300">
              <div>
                <b>1. Pop-up terpotong di layar laptop:</b>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Telah diatasi secara permanen dengan memindahkan modal ke `document.body` menggunakan `createPortal` dan batas `max-h-[82vh]` dengan scroll internal terisolasi.
                </p>
              </div>
              <div>
                <b>2. Staf lupa PIN login:</b>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Masuk dengan akun Project Manager/Admin/Web Developer $\rightarrow$ Tab <b>Pengaturan Akses</b> $\rightarrow$ Cari nama staf $\rightarrow$ Klik tombol <b>Reset PIN ke Default</b>.
                </p>
              </div>
              <div>
                <b>3. Sinkronisasi Google Sheets bermasalah (CORS / Timeout):</b>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Pastikan Web App Google Apps Script dideploy dengan hak akses: <i>"Anyone" (Siapa saja)</i>. Alternatif instan: ekspor file dari Spreadsheet menjadi format CSV lalu gunakan tombol <b>Upload CSV</b> di modal sinkronisasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 7: Changelog Pembaruan Fitur */}
      <section className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 sm:p-6 transition-colors print-card print-non-palette`}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <h2 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            7. Log Pembaruan Fitur (Changelog)
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-400">v2.4.1 — Identitas &amp; Palet Warna Resmi (Design Tokens PDF)</span>
              <span className="font-mono text-slate-500 text-[10px]">Oktober 2026</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Integrasi dokumen spesifikasi warna lengkap Mode Terang, Mode Gelap, alur status Kanban, dan hak akses dengan fitur cetak PDF khusus palet warna.
            </p>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-emerald-400">v2.4.0 — Developer PDF Manual &amp; Living Documentation</span>
              <span className="font-mono text-slate-500 text-[10px]">Oktober 2026</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Penambahan tab dokumen teknis mandiri khusus peran developer dan manajemen dengan dukungan tombol Cetak/Export ke PDF resmi dan penyalinan format Markdown.
            </p>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-red-500">v2.3.0 — Executive KPI Widget &amp; Performance Tracker</span>
              <span className="font-mono text-slate-500 text-[10px]">Oktober 2026</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Peluncuran widget metrik KPI di Dashboard: On-Time Delivery %, Target Output Konten, Realisasi Omzet/Fee, Turnaround Days, Kapasitas Tim, dan Overdue Bottleneck Monitor.
            </p>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sky-400">v2.2.0 — PWA Native Center Stacking &amp; Multi-Device Guides</span>
              <span className="font-mono text-slate-500 text-[10px]">Oktober 2026</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Penyempurnaan posisi jendela pop-up instalasi PWA di tengah layar laptop secara simetris (`max-h-[82vh]`), bebas terpotong di berbagai resolusi layar.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-500 pt-2 no-print">
        © 2026 obeecreatives Workspace OS · Dikelola secara living di dalam repositori kode aplikasi.
      </div>
    </div>
  );
};
