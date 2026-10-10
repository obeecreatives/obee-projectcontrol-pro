import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateAiText, setCorsHeaders } from '../_lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
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

    const text = await generateAiText(prompt);
    return res.status(200).json({ success: true, text });
  } catch (error: any) {
    console.error('Error in /api/ai/summarize-revisi:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Gagal merangkum revisi dengan AI.',
    });
  }
}
