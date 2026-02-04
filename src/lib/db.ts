import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export default db;

export async function initDB() {
  await db.batch([
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
      is_phrase INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
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
  ]);
}
