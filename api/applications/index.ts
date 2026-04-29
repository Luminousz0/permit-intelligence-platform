/**
 * GET  /api/applications   — list all applications for the authenticated user
 * POST /api/applications   — create a new application
 */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../lib/auth';
import { getApplicationsByUser, createApplication } from '../lib/applications';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  if (req.method === 'GET') {
    const apps = getApplicationsByUser(user.id);
    return res.json(apps);
  }

  if (req.method === 'POST') {
    const data = req.body || {};
    if (!data.municipality || !data.projectName) {
      return res.status(400).json({ error: 'projectName and municipality are required' });
    }
    const app = createApplication(user.id, data);
    return res.status(201).json(app);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
