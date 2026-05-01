import Database from 'better-sqlite3';
import path from 'path';
import * as fs from 'fs';

// Use file-based DB (works on Railway and local development)
const dbPath = path.join(__dirname, '../data/app.db');

// Create data directory if needed
const dataDir = path.join(__dirname, '../data');
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (error) {
  console.warn('Could not create data directory:', (error as any).message);
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    credits_remaining INTEGER NOT NULL DEFAULT 0,
    stripe_customer_id TEXT,
    subscription_status TEXT NOT NULL DEFAULT 'free',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  );

  CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    address TEXT NOT NULL,
    municipality TEXT,
    werkzaamheid TEXT,
    result_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS applications (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id        INTEGER NOT NULL,
    project_name   TEXT NOT NULL,
    address        TEXT,
    municipality   TEXT NOT NULL,
    project_type   TEXT NOT NULL,
    case_number    TEXT,
    status         TEXT NOT NULL DEFAULT 'draft',
    timeline_weeks INTEGER,
    notes          TEXT,
    housing_units  INTEGER,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS milestones (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    stage          INTEGER NOT NULL,
    stage_key      TEXT NOT NULL,
    completed_at   DATETIME,
    notes          TEXT,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            INTEGER NOT NULL,
    stripe_session_id  TEXT UNIQUE NOT NULL,
    stripe_price_id    TEXT NOT NULL,
    credits_purchased  INTEGER NOT NULL,
    amount_paid        INTEGER NOT NULL,
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Migrate existing databases: add new columns to users if they don't exist yet
const alterStatements = [
  `ALTER TABLE users ADD COLUMN credits_remaining INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE users ADD COLUMN stripe_customer_id TEXT`,
  `ALTER TABLE users ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'free'`,
];
for (const sql of alterStatements) {
  try {
    db.exec(sql);
  } catch (e: any) {
    // Ignore "duplicate column name" — column already exists from a previous run
    if (!e.message?.includes('duplicate column name')) throw e;
  }
}

// ── Credit helpers ───────────────────────────────────────────────────────────

export function getCredits(userId: number): number {
  const row = db.prepare('SELECT credits_remaining, subscription_status FROM users WHERE id = ?').get(userId) as any;
  return row ? row.credits_remaining : 0;
}

export function getSubscriptionStatus(userId: number): string {
  const row = db.prepare('SELECT subscription_status FROM users WHERE id = ?').get(userId) as any;
  return row ? row.subscription_status : 'free';
}

export function addCredits(userId: number, credits: number): void {
  db.prepare('UPDATE users SET credits_remaining = credits_remaining + ? WHERE id = ?').run(credits, userId);
}

/**
 * Atomically deduct one credit. Returns true if successful, false if no credits remain.
 */
export function useCredit(userId: number): boolean {
  const row = db.prepare('SELECT credits_remaining FROM users WHERE id = ?').get(userId) as any;
  if (!row || row.credits_remaining < 1) return false;
  db.prepare('UPDATE users SET credits_remaining = credits_remaining - 1 WHERE id = ?').run(userId);
  return true;
}

export default db;
