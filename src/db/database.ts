import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(__dirname, '../data/app.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
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
`);

export default db;
