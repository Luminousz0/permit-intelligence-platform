/**
 * Pure-JS user store — no native modules, works on Vercel Lambda.
 * Persists to /tmp/users.json within a single Lambda invocation.
 * NOTE: /tmp is ephemeral on Vercel (lost between cold starts).
 * For durable storage, replace readStore/writeStore with Vercel Postgres.
 */
import fs from 'fs';

const STORE_PATH = '/tmp/pi_users.json';

interface StoredUser {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: string;
}

function readStore(): StoredUser[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    }
  } catch { /* ignore parse errors */ }
  return [];
}

function writeStore(users: StoredUser[]): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(users, null, 2));
}

export function findUserByEmail(email: string): StoredUser | null {
  const users = readStore();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function createUser(email: string, passwordHash: string): StoredUser {
  const users = readStore();
  const newUser: StoredUser = {
    id: Date.now(),
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeStore(users);
  return newUser;
}
