/**
 * Health check endpoint — test if API is working
 */
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}
