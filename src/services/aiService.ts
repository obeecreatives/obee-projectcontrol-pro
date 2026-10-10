export interface GenerateCaptionParams {
  klien: string;
  tema?: string;
  ideKonten?: string;
  jenisKonten?: string;
  tone?: string;
  platform?: string;
  notes?: string;
}

export interface BrainstormParams {
  klien: string;
  tipeProject?: string;
  jenisKonten?: string;
  tema?: string;
}

export interface SummarizeRevisiParams {
  cardTitle: string;
  clientName: string;
  comments: Array<{
    authorName?: string;
    category?: string;
    text: string;
  }>;
}

async function parseApiResponse(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      throw new Error('Respons dari server tidak dapat dibaca (format JSON terputus).');
    }
  }

  const rawText = await res.text();
  if (rawText.includes('<!DOCTYPE') || rawText.includes('<html') || rawText.includes('<head>')) {
    throw new Error(
      'Server Vercel belum mengenali fungsi API / Serverless Function. Pastikan kode terbaru di folder api/ sudah ter-push ke GitHub dan ter-deploy di Vercel.'
    );
  }

  try {
    return JSON.parse(rawText);
  } catch {
    throw new Error(rawText || 'Respons server kosong atau tidak valid.');
  }
}

function cleanErrorMessage(rawError: any, fallback: string): string {
  if (!rawError) return fallback;
  const msg = typeof rawError === 'string' ? rawError : rawError?.message || '';

  if (msg.includes('GEMINI_API_KEY')) {
    return 'GEMINI_API_KEY belum dipasang di Vercel. Buka Project Settings > Environment Variables di Vercel, lalu tambahkan GEMINI_API_KEY.';
  }

  if (msg.includes('Unexpected end of JSON') || msg.includes('Failed to execute \'json\'')) {
    return 'Server Vercel belum merespons endpoint AI. Pastikan folder api/ sudah terdeploy dan Environment Variables GEMINI_API_KEY sudah aktif di Vercel.';
  }

  if (typeof rawError === 'string') {
    try {
      const parsed = JSON.parse(rawError);
      if (parsed?.error?.message) {
        if (parsed.error.code === 503) {
          return 'Server Gemini sedang mengalami antrian sementara. Silakan klik tombol Coba Lagi.';
        }
        return parsed.error.message;
      }
    } catch {
      // not JSON string
    }
    return rawError;
  }

  return msg || fallback;
}

export const aiService = {
  async generateCaption(params: GenerateCaptionParams): Promise<string> {
    try {
      const res = await fetch('/api/ai/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await parseApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(cleanErrorMessage(data?.error, 'Gagal menghasilkan caption'));
      }
      return data.text;
    } catch (err: any) {
      throw new Error(cleanErrorMessage(err?.message, 'Koneksi ke server AI terganggu'));
    }
  },

  async brainstormIdeas(params: BrainstormParams): Promise<string> {
    try {
      const res = await fetch('/api/ai/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await parseApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(cleanErrorMessage(data?.error, 'Gagal menghasilkan ide konten'));
      }
      return data.text;
    } catch (err: any) {
      throw new Error(cleanErrorMessage(err?.message, 'Koneksi ke server AI terganggu'));
    }
  },

  async summarizeRevisi(params: SummarizeRevisiParams): Promise<string> {
    try {
      const res = await fetch('/api/ai/summarize-revisi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await parseApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(cleanErrorMessage(data?.error, 'Gagal merangkum revisi'));
      }
      return data.text;
    } catch (err: any) {
      throw new Error(cleanErrorMessage(err?.message, 'Koneksi ke server AI terganggu'));
    }
  },
};
