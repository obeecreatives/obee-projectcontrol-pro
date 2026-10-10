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

    const text = await generateAiText(prompt);
    return res.status(200).json({ success: true, text });
  } catch (error: any) {
    console.error('Error in /api/ai/brainstorm:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Gagal menghasilkan ide konten dengan AI.',
    });
  }
}
