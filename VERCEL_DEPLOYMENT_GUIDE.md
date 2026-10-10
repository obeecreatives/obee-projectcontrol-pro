# Panduan Konfigurasi Vercel Serverless Function & Gemini AI

Struktur Serverless Function Vercel (`api/`) dan file konfigurasi (`vercel.json`) telah selesai disiapkan.

---

## 📁 Struktur Folder yang Telah Dibuat
```
├── api/
│   ├── _lib/
│   │   └── gemini.ts           # Helper koneksi GoogleGenAI & auto-fallback model
│   ├── ai/
│   │   ├── caption.ts          # Endpoint POST /api/ai/caption
│   │   ├── brainstorm.ts       # Endpoint POST /api/ai/brainstorm
│   │   └── summarize-revisi.ts # Endpoint POST /api/ai/summarize-revisi
│   └── health.ts               # Endpoint GET /api/health (untuk tes status fungsi)
├── vercel.json                 # Konfigurasi routing Vercel Serverless & SPA
```

---

## 🚀 3 Langkah Agar Fitur AI Berjalan di Vercel

### 1. Push Perubahan Terbaru ke GitHub
Jalankan di terminal git Anda:
```bash
git add .
git commit -m "feat: tambahkan struktur Vercel serverless function api/ dan update vercel.json"
git push origin main
```

---

### 2. Tambahkan `GEMINI_API_KEY` di Dashboard Vercel
Karena Serverless Function berjalan di sisi server Vercel, ia memerlukan API Key Gemini:
1. Buka [Dashboard Vercel](https://vercel.com/dashboard).
2. Pilih project **obeecreatives** / **obee-projectcontrol-pro**.
3. Masuk ke tab **Settings** > **Environment Variables**.
4. Tambahkan variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Masukkan API Key dari [Google AI Studio](https://aistudio.google.com/apikey).
   - **Environments**: Centang *Production*, *Preview*, dan *Development*.
5. Klik **Save**.

---

### 3. Re-Deploy di Vercel
Setelah Environment Variable disimpan:
1. Buka tab **Deployments** di Vercel.
2. Klik tombol titik tiga (**...**) pada deployment terbaru, lalu klik **Redeploy**.
3. Tunggu hingga status selesai (*Ready*).

---

### 🔍 Cara Mengecek Apakah Serverless Function Sudah Aktif
Buka link browser ke:
```
https://<domain-anda>.vercel.app/api/health
```
Jika berhasil, Anda akan melihat respons:
```json
{
  "status": "ok",
  "message": "obeecreatives Serverless API is running",
  "environment": "vercel-serverless",
  "geminiConfigured": true
}
```
Jika `geminiConfigured: true`, maka tombol AI Action Items, Generate Caption, dan Brainstorming di aplikasi Anda sudah siap digunakan 100%!
