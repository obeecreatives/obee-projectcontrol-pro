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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Gunakan POST.' });
  }

  try {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        error:
          'GEMINI_API_KEY belum terpasang di Vercel. Silakan tambahkan variabel GEMINI_API_KEY di Project Settings > Environment Variables Vercel, lalu klik Redeploy.',
      });
    }

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

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
    let text = '';
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        if (response.text) {
          text = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} gagal:`, err?.message || err);
      }
    }

    if (!text) {
      throw lastError || new Error('Gagal menghasilkan teks dengan AI.');
    }

    return res.status(200).json({ success: true, text });
  } catch (error: any) {
    console.error('Error in /api/ai/brainstorm:', error);
    return res.status(200).json({
      success: false,
      error: error?.message || 'Gagal menghasilkan ide konten dengan AI.',
    });
  }
}

