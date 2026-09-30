import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize GoogleGenAI server-side with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Robust model caller with fallback between flash-lite and flash
async function generateAiText(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });
    return response.text || '';
  } catch (err: any) {
    console.warn('Attempting secondary model gemini-3.8-flash:', err?.message);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return response.text || '';
  }
}

// AI Endpoint: Generate Caption & Copywriting
app.post('/api/ai/caption', async (req, res) => {
  try {
    const { klien, tema, ideKonten, jenisKonten, tone, platform, notes } = req.body;
    const prompt = `Anda adalah Senior Social Media Copywriter & Creative Strategist di agensi obeecreatives.
Buat draft caption media sosial profesional, menarik, dan terstruktur dalam bahasa Indonesia untuk:
- Brand / Klien: ${klien || 'Umum'}
- Tema Konten: ${tema || '-'}
- Ide Konten: ${ideKonten || '-'}
- Format: ${jenisKonten || 'Single Post'}
- Target Platform: ${platform || 'Instagram'}
- Tone of Voice: ${tone || 'Casual, Hangat, & Menarik'}
- Catatan Tambahan: ${notes || '-'}

Format output harus rapi dan terbagi menjadi bagian:
1. 💡 3 Variasi Hook Pembuka (untuk menarik perhatian di awal)
2. 📝 Draft Caption Lengkap (Body teks berjarak rapi, emoji pas, dan Call To Action yang jelas)
3. 🎬 Rekomendasi Arahan Visual / Scene (1-2 baris tips untuk tim desainer atau video editor)
4. #️⃣ Rekomendasi 8-10 Hashtag yang relevan

Gunakan gaya bahasa Indonesia yang natural, mengalir, dan bernilai jual tinggi.`;

    const text = await generateAiText(prompt);
    res.json({ success: true, text });
  } catch (error: any) {
    console.error('Error in /api/ai/caption:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal menghasilkan caption' });
  }
});

// AI Endpoint: Brainstorm Ide Konten
app.post('/api/ai/brainstorm', async (req, res) => {
  try {
    const { klien, tipeProject, jenisKonten, tema } = req.body;
    const prompt = `Anda adalah Creative Director di agensi obeecreatives.
Berikan 3 ide konsep konten media sosial yang segar, kreatif, dan bernilai engagement tinggi untuk:
- Brand / Klien: ${klien || 'Klien Studio'}
- Tipe Project: ${tipeProject || 'Komersil'}
- Format Utama: ${jenisKonten || 'Carousel'}
- Tema / Kategori: ${tema || 'Engagement & Branding'}

Untuk setiap ide, berikan dalam struktur:
- 📌 Judul Ide / Headline
- 🎨 Konsep Visual (apa yang dilihat penonton pada gambar / video)
- ✍️ Angle Copywriting (pesan inti yang disampaikan)
- 🚀 Nilai Tambah (kenapa audiens mau like/save/share)

Tulis dalam bahasa Indonesia yang ringkas, modern, dan langsung bisa dieksekusi tim.`;

    const text = await generateAiText(prompt);
    res.json({ success: true, text });
  } catch (error: any) {
    console.error('Error in /api/ai/brainstorm:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal menghasilkan ide' });
  }
});

// AI Endpoint: Summarize Action Items from Card Comments
app.post('/api/ai/summarize-revisi', async (req, res) => {
  try {
    const { comments, cardTitle, clientName } = req.body;
    if (!comments || !Array.isArray(comments) || comments.length === 0) {
      return res.status(400).json({ success: false, error: 'Belum ada komentar untuk dirangkum' });
    }

    const commentsFormatted = comments
      .map((c: any) => `[${c.authorName || 'Staf'} - ${c.category || 'Diskusi'}]: ${c.text}`)
      .join('\n');

    const prompt = `Anda adalah Project Manager di agensi obeecreatives.
Berikut adalah riwayat percakapan diskusi dan revisi pada kartu konten "${cardTitle || 'Konten'}" untuk klien "${clientName || 'Klien'}":

${commentsFormatted}

Tolong rangkum menjadi daftar tindakan (Action Items / Checklist Revisi) yang jelas dan to-the-point untuk dikerjakan tim creator/desainer/editor:
- 📌 Ringkasan Status / Fokus Utama (1-2 kalimat)
- ✅ To-Do Checklist Revisi (daftar poin perbaikan yang konkret)
- ⚠️ Catatan Penting / Deadline (jika disebutkan)`;

    const text = await generateAiText(prompt);
    res.json({ success: true, text });
  } catch (error: any) {
    console.error('Error in /api/ai/summarize-revisi:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal merangkum revisi' });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 obeecreatives OS server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
