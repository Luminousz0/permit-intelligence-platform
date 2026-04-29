/**
 * Auth helpers — pure JS, no native modules, works on Vercel Lambda.
 * Dependencies: bcryptjs (pure JS), jsonwebtoken (pure JS).
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from './users';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthUser {
  id: number;
  email: string;
}

export async function registerUser(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string } | null> {
  // Check duplicate
  if (findUserByEmail(email)) return null;

  const passwordHash = await bcrypt.hash(password, 10);
  const stored = createUser(email, passwordHash);

  const token = jwt.sign(
    { id: stored.id, email: stored.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  return { user: { id: stored.id, email: stored.email }, token };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string } | null> {
  const stored = findUserByEmail(email);
  if (!stored) return null;

  const valid = await bcrypt.compare(password, stored.passwordHash);
  if (!valid) return null;

  const token = jwt.sign(
    { id: stored.id, email: stored.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  return { user: { id: stored.id, email: stored.email }, token };
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}
