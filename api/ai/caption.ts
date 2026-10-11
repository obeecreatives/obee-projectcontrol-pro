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
      throw lastError || new Error('Gagal menghasilkan caption dengan AI.');
    }

    return res.status(200).json({ success: true, text });
  } catch (error: any) {
    console.error('Error in /api/ai/caption:', error);
    return res.status(200).json({
      success: false,
      error: error?.message || 'Gagal menghasilkan caption dengan AI.',
    });
  }
}

