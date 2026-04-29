import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: number;
  email: string;
}

export async function registerUser(email: string, password: string): Promise<User | null> {
  const hashed = await bcrypt.hash(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
    const result = stmt.run(email, hashed);
    return { id: result.lastInsertRowid as number, email };
  } catch (err) {
    return null;
  }
}

export async function loginUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
  const stmt = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?');
  const user = stmt.get(email) as any;
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { user: { id: user.id, email: user.email }, token };
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch {
    return null;
  }
}
