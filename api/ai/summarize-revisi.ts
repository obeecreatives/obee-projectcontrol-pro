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
      throw lastError || new Error('Gagal merangkum revisi dengan AI.');
    }

    return res.status(200).json({ success: true, text });
  } catch (error: any) {
    console.error('Error in /api/ai/summarize-revisi:', error);
    return res.status(200).json({
      success: false,
      error: error?.message || 'Gagal merangkum revisi dengan AI.',
    });
  }
}

