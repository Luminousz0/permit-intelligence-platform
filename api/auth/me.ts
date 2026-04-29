import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../lib/auth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  res.json({ user });
}
