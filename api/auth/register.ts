import { VercelRequest, VercelResponse } from '@vercel/node';
import { registerUser, loginUser } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const user = await registerUser(email, password);
    if (!user) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const loginResult = await loginUser(email, password);
    if (!loginResult) {
      return res.status(500).json({ error: 'Token generation failed' });
    }

    res.status(201).json(loginResult);
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
}
