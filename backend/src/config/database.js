/**
 * Database Configuration & Schema Initialization
 * Uses better-sqlite3 for synchronous, high-performance SQLite operations.
 * The DB file is created at backend/veritas.db on first run.
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../veritas.db');

let db;

/**
 * Get or create the database connection singleton.
 * Enables WAL mode for better concurrent read performance.
 */
export function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    console.log(`[DB] Connected to SQLite at ${DB_PATH}`);
  }
  return db;
}

/**
 * Initialize all database tables if they don't already exist.
 * Called once on server bootstrap.
 */
export function initializeSchema() {
  const database = getDatabase();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      password      TEXT    NOT NULL,
      interests     TEXT    DEFAULT '[]',
      avatar_color  TEXT    DEFAULT '#7c83ff',
      avatar_url    TEXT    DEFAULT '',
      bio           TEXT    DEFAULT '',
      location      TEXT    DEFAULT '',
      reputation_score INTEGER DEFAULT 0,
      created_at    TEXT    DEFAULT (datetime('now'))
    );

    -- Try to add new columns if they don't exist (fails silently if they do)
    BEGIN;
    PRAGMA user_version;
    COMMIT;
  `);

  try { database.exec('ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ""'); } catch (e) {}
  try { database.exec('ALTER TABLE users ADD COLUMN location TEXT DEFAULT ""'); } catch (e) {}
  try { database.exec('ALTER TABLE users ADD COLUMN reputation_score INTEGER DEFAULT 0'); } catch (e) {}
  try { database.exec('ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT ""'); } catch (e) {}

  database.exec(`

    CREATE TABLE IF NOT EXISTS claims_history (
      id              TEXT    PRIMARY KEY,
      user_id         INTEGER NOT NULL,
      claim           TEXT    NOT NULL,
      type            TEXT    DEFAULT 'text',
      verdict         TEXT,
      confidence      INTEGER,
      summary         TEXT,
      key_findings    TEXT    DEFAULT '[]',
      sources_checked TEXT    DEFAULT '[]',
      red_flags       TEXT    DEFAULT '[]',
      advice          TEXT,
      timestamp       TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id              TEXT    PRIMARY KEY,
      user_id         INTEGER NOT NULL,
      article_id      TEXT    NOT NULL,
      title           TEXT,
      category        TEXT,
      summary         TEXT,
      full_article    TEXT,
      image_url       TEXT,
      date            TEXT,
      author          TEXT,
      verified_status TEXT,
      confidence      INTEGER,
      source          TEXT,
      created_at      TEXT    DEFAULT (datetime('now')),
      UNIQUE(user_id, article_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS community_requests (
      id                TEXT    PRIMARY KEY,
      claim             TEXT    NOT NULL,
      category          TEXT    DEFAULT 'General',
      requested_by_name TEXT,
      requested_by_id   INTEGER,
      status            TEXT    DEFAULT 'UNVERIFIED',
      created_at        TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (requested_by_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS upvotes (
      request_id  TEXT    NOT NULL,
      user_id     INTEGER NOT NULL,
      PRIMARY KEY (request_id, user_id),
      FOREIGN KEY (request_id) REFERENCES community_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER,
      claim_id    TEXT,
      summary     TEXT,
      is_positive INTEGER NOT NULL,
      created_at  TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Create indexes for performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_claims_user    ON claims_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_claims_ts      ON claims_history(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
    CREATE INDEX IF NOT EXISTS idx_community_ts   ON community_requests(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_upvotes_req    ON upvotes(request_id);
  `);

  console.log('[DB] Schema initialized successfully.');
}

/**
 * Close the database connection gracefully (for shutdown hooks).
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('[DB] Connection closed.');
  }
}
