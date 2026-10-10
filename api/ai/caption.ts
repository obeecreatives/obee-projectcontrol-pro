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

    const text = await generateAiText(prompt);
    return res.status(200).json({ success: true, text });
  } catch (error: any) {
    console.error('Error in /api/ai/caption:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Gagal menghasilkan caption dengan AI.',
    });
  }
}
