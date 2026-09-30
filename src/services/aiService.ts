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

function cleanErrorMessage(rawError: any, fallback: string): string {
  if (!rawError) return fallback;
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
      return rawError;
    }
    return rawError;
  }
  if (rawError?.message) return rawError.message;
  return fallback;
}

export const aiService = {
  async generateCaption(params: GenerateCaptionParams): Promise<string> {
    try {
      const res = await fetch('/api/ai/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
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

      const data = await res.json();
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

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(cleanErrorMessage(data?.error, 'Gagal merangkum revisi'));
      }
      return data.text;
    } catch (err: any) {
      throw new Error(cleanErrorMessage(err?.message, 'Koneksi ke server AI terganggu'));
    }
  },
};
