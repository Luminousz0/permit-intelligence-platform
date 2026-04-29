import { VercelRequest, VercelResponse } from '@vercel/node';
import { predictTimeline } from '../src/services/timeline-predictor';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { municipality, projectType, housingUnits } = req.body;

  if (!municipality || !projectType) {
    return res.status(400).json({ error: 'Municipality and project type required' });
  }

  try {
    const prediction = await predictTimeline(municipality, projectType, housingUnits);
    res.json(prediction);
  } catch (error: any) {
    console.error('Timeline error:', error);
    res.status(500).json({ error: error.message || 'Timeline prediction failed' });
  }
}
