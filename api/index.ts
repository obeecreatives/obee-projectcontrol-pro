import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}

// Generate text using Google GenAI with fallback models
async function generateAiText(prompt: string, apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      if (response.text) return response.text;
    } catch (err: any) {
      lastError = err;
      console.warn(`Fallback dari model ${model}:`, err?.message || err);
    }
  }

  throw lastError || new Error('Gagal menghasilkan teks dengan AI.');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url || '/', 'http://localhost');
  const pathname = url.pathname.replace(/\/$/, ''); // Remove trailing slash

  // Health check endpoint
  if (pathname === '/api/health' || pathname === '/api/ai/health' || pathname === '/api') {
    const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
    return res.status(200).json({
      status: 'ok',
      message: 'obeecreatives Vercel Serverless API Gateway is running',
      environment: 'vercel-serverless',
      geminiConfigured: hasApiKey,
      timestamp: new Date().toISOString(),
    });
  }

  // Google Apps Script Proxy to prevent any client-side CORS issues
  if (pathname === '/api/gas-proxy') {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed. Gunakan POST.' });
    }

    try {
      const { targetUrl, method = 'GET', body } = req.body || {};
      if (!targetUrl || typeof targetUrl !== 'string') {
        return res.status(400).json({ success: false, error: 'targetUrl wajib diisi' });
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);

      const fetchOptions: RequestInit = {
        method,
        signal: controller.signal,
      };

      if (method === 'POST' && body) {
        fetchOptions.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      const remoteRes = await fetch(targetUrl, fetchOptions);
      clearTimeout(timer);

      const text = await remoteRes.text();
      try {
        const json = JSON.parse(text);
        return res.status(200).json(json);
      } catch {
        return res.status(200).send(text);
      }
    } catch (proxyErr: any) {
      return res.status(500).json({
        success: false,
        error: `GAS Proxy Error: ${proxyErr?.message || 'Gagal menghubungi server GAS'}`,
      });
    }
  }

  // AI Endpoints
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  // AI Caption
  if (pathname === '/api/ai/caption' || pathname === '/api/caption') {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed. Gunakan POST.' });
    }

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        error:
          'GEMINI_API_KEY belum terpasang di Vercel. Silakan tambahkan variabel GEMINI_API_KEY di Project Settings > Environment Variables Vercel, lalu klik Redeploy.',
      });
    }

    try {
      const { klien, tema, ideKonten, jenisKonten, tone, platform, notes } = req.body || {};
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

      const text = await generateAiText(prompt, apiKey);
      return res.status(200).json({ success: true, text });
    } catch (err: any) {
      return res.status(200).json({
        success: false,
        error: err?.message || 'Gagal menghasilkan caption dengan AI.',
      });
    }
  }

  // AI Brainstorm
  if (pathname === '/api/ai/brainstorm' || pathname === '/api/brainstorm') {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed. Gunakan POST.' });
    }

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        error:
          'GEMINI_API_KEY belum terpasang di Vercel. Silakan tambahkan variabel GEMINI_API_KEY di Project Settings > Environment Variables Vercel, lalu klik Redeploy.',
      });
    }

    try {
      const { klien, tipeProject, jenisKonten, tema } = req.body || {};
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

      const text = await generateAiText(prompt, apiKey);
      return res.status(200).json({ success: true, text });
    } catch (err: any) {
      return res.status(200).json({
        success: false,
        error: err?.message || 'Gagal menghasilkan ide konten dengan AI.',
      });
    }
  }

  // AI Summarize Revisi
  if (pathname === '/api/ai/summarize-revisi' || pathname === '/api/summarize-revisi') {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed. Gunakan POST.' });
    }

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        error:
          'GEMINI_API_KEY belum terpasang di Vercel. Silakan tambahkan variabel GEMINI_API_KEY di Project Settings > Environment Variables Vercel, lalu klik Redeploy.',
      });
    }

    try {
      const { comments, cardTitle, clientName } = req.body || {};
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

      const text = await generateAiText(prompt, apiKey);
      return res.status(200).json({ success: true, text });
    } catch (err: any) {
      return res.status(200).json({
        success: false,
        error: err?.message || 'Gagal merangkum revisi dengan AI.',
      });
    }
  }

  // Unknown API route - Return JSON, NEVER HTML!
  return res.status(404).json({
    success: false,
    error: `Endpoint API tidak ditemukan: ${pathname}`,
  });
}
