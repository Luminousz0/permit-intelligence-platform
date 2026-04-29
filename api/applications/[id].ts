/**
 * GET    /api/applications/:id   — get single application
 * PUT    /api/applications/:id   — update application (fields or completeMilestoneStage)
 * DELETE /api/applications/:id   — delete application
 */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../lib/auth';
import { getApplicationById, updateApplication, deleteApplication } from '../lib/applications';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  const id = Number(req.query.id);
  if (!id || isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    const app = getApplicationById(id, user.id);
    if (!app) return res.status(404).json({ error: 'Not found' });
    return res.json(app);
  }

  if (req.method === 'PUT') {
    const updates = req.body || {};
    const app = updateApplication(id, user.id, updates);
    if (!app) return res.status(404).json({ error: 'Not found' });
    return res.json(app);
  }

  if (req.method === 'DELETE') {
    const ok = deleteApplication(id, user.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
