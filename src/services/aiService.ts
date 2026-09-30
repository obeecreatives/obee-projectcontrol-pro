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

export const aiService = {
  async generateCaption(params: GenerateCaptionParams): Promise<string> {
    const res = await fetch('/api/ai/caption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal menghasilkan caption');
    }
    return data.text;
  },

  async brainstormIdeas(params: BrainstormParams): Promise<string> {
    const res = await fetch('/api/ai/brainstorm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal menghasilkan ide');
    }
    return data.text;
  },

  async summarizeRevisi(params: SummarizeRevisiParams): Promise<string> {
    const res = await fetch('/api/ai/summarize-revisi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal merangkum revisi');
    }
    return data.text;
  },
};
