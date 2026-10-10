import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from './_lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');

  return res.status(200).json({
    status: 'ok',
    message: 'obeecreatives Serverless API is running',
    environment: 'vercel-serverless',
    geminiConfigured: hasApiKey,
    timestamp: new Date().toISOString(),
  });
}
