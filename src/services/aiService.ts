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

  if (msg.includes('FUNCTION_INVOCATION_FAILED')) {
    return 'Layanan serverless AI Vercel belum aktif sempurna. Pastikan folder api/ terbaru sudah ter-push ke GitHub dan variabel GEMINI_API_KEY sudah aktif di Vercel Settings, lalu lakukan Redeploy.';
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

async function callAiEndpointWithFallback(primaryPath: string, fallbackPath: string, body: any): Promise<any> {
  // First attempt: primary path
  try {
    const res = await fetch(primaryPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await res.json();
      return json;
    }

    const rawText = await res.text();
    // If Vercel rewrote to index.html (returns HTML), fallback to second endpoint
    if (!rawText.includes('<!DOCTYPE') && !rawText.includes('<html') && !rawText.includes('<head>')) {
      try {
        return JSON.parse(rawText);
      } catch {
        // Continue to fallback
      }
    }
  } catch {
    // Network or fetch error on primary path, try fallback path
  }

  // Second attempt: fallback path
  const fallbackRes = await fetch(fallbackPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return await parseApiResponse(fallbackRes);
}

export const aiService = {
  async checkHealth(): Promise<{ ok: boolean; geminiConfigured: boolean; message: string }> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        return {
          ok: true,
          geminiConfigured: Boolean(data.geminiConfigured),
          message: data.message || 'Server OK',
        };
      }
    } catch {}
    return { ok: false, geminiConfigured: false, message: 'Server belum terhubung' };
  },

  async generateCaption(params: GenerateCaptionParams): Promise<string> {
    try {
      const data = await callAiEndpointWithFallback('/api/ai/caption', '/api/caption', params);
      if (!data || !data.success) {
        throw new Error(cleanErrorMessage(data?.error, 'Gagal menghasilkan caption'));
      }
      return data.text;
    } catch (err: any) {
      throw new Error(cleanErrorMessage(err?.message, 'Koneksi ke server AI terganggu'));
    }
  },

  async brainstormIdeas(params: BrainstormParams): Promise<string> {
    try {
      const data = await callAiEndpointWithFallback('/api/ai/brainstorm', '/api/brainstorm', params);
      if (!data || !data.success) {
        throw new Error(cleanErrorMessage(data?.error, 'Gagal menghasilkan ide konten'));
      }
      return data.text;
    } catch (err: any) {
      throw new Error(cleanErrorMessage(err?.message, 'Koneksi ke server AI terganggu'));
    }
  },

  async summarizeRevisi(params: SummarizeRevisiParams): Promise<string> {
    try {
      const data = await callAiEndpointWithFallback('/api/ai/summarize-revisi', '/api/summarize-revisi', params);
      if (!data || !data.success) {
        throw new Error(cleanErrorMessage(data?.error, 'Gagal merangkum revisi'));
      }
      return data.text;
    } catch (err: any) {
      throw new Error(cleanErrorMessage(err?.message, 'Koneksi ke server AI terganggu'));
    }
  },
};
