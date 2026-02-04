import { createClient, Client } from '@libsql/client';

let _db: Client | null = null;

function getDB(): Client {
  if (!_db) {
    if (!process.env.TURSO_DATABASE_URL) {
      throw new Error('TURSO_DATABASE_URL is not set');
    }
    _db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _db;
}

const db = new Proxy({} as Client, {
  get(_target, prop) {
    const client = getDB();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default db;

export async function initDB() {
  const client = getDB();
  await client.batch([
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      xp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      last_active TEXT,
      total_correct INTEGER DEFAULT 0,
      total_wrong INTEGER DEFAULT 0,
      quizzes_played INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      de TEXT NOT NULL,
      ku TEXT NOT NULL,
      category TEXT NOT NULL,
      note TEXT,
      is_phrase INTEGER DEFAULT 0,
      UNIQUE(de, ku, category)
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      label_ku TEXT DEFAULT '',
      icon TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS levels (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      word_count INTEGER DEFAULT 10
    )`,
    `CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      level_id INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      stars INTEGER DEFAULT 0,
      best_score INTEGER DEFAULT 0,
      UNIQUE(user_id, level_id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`,
  ]);

  // Migration: add label_ku column to categories if it doesn't exist
  try {
    await client.execute(`ALTER TABLE categories ADD COLUMN label_ku TEXT DEFAULT ''`);
  } catch {
    // Column already exists, ignore
  }
}
