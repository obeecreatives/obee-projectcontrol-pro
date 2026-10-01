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
  const [activeSection, setActiveSection] = useState<string>('all');

  const contentItems = storageService.getContent();
  const staffList = authService.getDirectory();
  const rateCards = storageService.getRateCards();

  const handlePrint = () => {
    window.print();
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

## 3. Fitur Utama & Isi Aplikasi
1. Kanban Board (6 Alur Kolom): New Idea -> On Progress -> Request Approval -> Approved / RtP -> Scheduling -> Published.
2. Calendar View: Timeline produksi dan jadwal posting.
3. Executive KPI Widget: On-Time SLA %, Output Pace Tracker, Realisasi Omzet/Fee, Turnaround Days, Capacity Index, Overdue Monitor.
4. Presensi Geolokasi: WFO Studio (radius <= 500m), On-Site Klien, WFH, Mobile/Kafe.
5. Database Staf & Payroll: Direktori staf, gaji pokok, tunjangan, dan akumulasi fee otomatis per tanggal disetujui.
6. Rate Card: Upah standar konten desain dan video per format.
7. Headless GAS Sync: Sinkronisasi 2-arah ke Google Spreadsheet via webhook /exec.
8. Access Settings: Whitelist email, default PIN, reset PIN staf, dan audit security log.

## 4. Matriks Peran & Hak Akses (RBAC)
- Project Manager, Admin, Web Developer: Akses penuh semua modul, approval final, dan edit fee.
- Staff Creator, Site Engineer, Vendor: Dibatasi pada alur New Idea -> Request Approval, fee disembunyikan.
- Client: Hanya baca dan berikan feedback approval.

## 5. SOP Penggunaan Harian
- Alur Produksi: Buat Konten -> Garap -> Minta Approval -> Approved -> Posting.
- Presensi: Buka profil -> Set mode lokasi -> Izinkan browser GPS.
- Target KPI: Buka Dashboard -> Klik Target KPI -> Atur target bulanan -> Simpan.

## 6. Deployment Vercel & Troubleshooting
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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
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
                Dokumen resmi arsitektur teknis, panduan operasional, matriks RBAC, konfigurasi deployment, serta changelog pembaruan fitur <b>obeecreatives Workspace OS</b>.
              </p>
            </div>
          </div>

          {/* Action Buttons: Export to PDF & Copy Markdown */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 no-print">
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
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#E30000] hover:bg-[#c00000] text-white shadow-md shadow-red-500/20 cursor-pointer transition-all active:scale-95"
              title="Cetak atau simpan sebagai dokumen PDF resmi"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
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
      <section className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 sm:p-6 transition-colors print-card`}>
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
      <section className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 sm:p-6 transition-colors print-card`}>
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

      {/* Chapter 3: Modul Fitur Utama */}
      <section className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 sm:p-6 transition-colors print-card`}>
        <div className="flex items-center gap-2 mb-3">
          <Workflow className="w-5 h-5 text-emerald-500" />
          <h2 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            3. Rincian Modul &amp; Fitur Aplikasi
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

      {/* Chapter 4: Matriks Peran & Hak Akses (RBAC) */}
      <section className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 sm:p-6 transition-colors print-card`}>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-red-500" />
          <h2 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            4. Matriks Peran &amp; Hak Akses (RBAC)
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

      {/* Chapter 5: Deployment Vercel & Troubleshooting */}
      <section className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 sm:p-6 transition-colors print-card`}>
        <div className="flex items-center gap-2 mb-3">
          <GitBranch className="w-5 h-5 text-amber-500" />
          <h2 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            5. Panduan Deployment Vercel &amp; Troubleshooting
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

      {/* Chapter 6: Changelog Pembaruan Fitur */}
      <section className={`${isDarkMode ? 'bg-[#1e293b]/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5 sm:p-6 transition-colors print-card`}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <h2 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            6. Log Pembaruan Fitur (Changelog)
          </h2>
        </div>

        <div className="space-y-3 text-xs">
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
