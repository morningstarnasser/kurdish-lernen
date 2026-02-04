import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db, { initDB } from '@/lib/db';
import { WORDS, CATEGORIES, LEVELS } from '@/lib/words';

export async function GET() {
  try {
    // 1. Create tables
    await initDB();

    // 2. Seed admin user
    const adminEmail = 'ali.nasser@bluewin.ch';
    const adminPassword = 'kurdmanX1!!??';
    const adminName = 'Ali';

    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [adminEmail],
    });

    if (existing.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await db.execute({
        sql: 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        args: [adminEmail, hashedPassword, adminName, 'admin'],
      });
    }

    // 3. Seed categories
    for (const [id, cat] of Object.entries(CATEGORIES)) {
      if (id === 'all') continue; // skip "all" meta-category
      await db.execute({
        sql: `INSERT OR IGNORE INTO categories (id, label, icon) VALUES (?, ?, ?)`,
        args: [id, cat.label, cat.icon],
      });
    }

    // 4. Seed levels
    for (const level of LEVELS) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO levels (id, name, icon, category, description, word_count)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [level.id, level.name, level.icon, level.cat, level.desc, level.count],
      });
    }

    // 5. Seed words
    for (const word of WORDS) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO words (de, ku, category, note, is_phrase)
              VALUES (?, ?, ?, ?, ?)`,
        args: [word.de, word.ku, word.c, word.n || null, word.t ? 1 : 0],
      });
    }

    return NextResponse.json({
      message: 'Datenbank erfolgreich initialisiert.',
      seeded: {
        categories: Object.keys(CATEGORIES).length - 1,
        levels: LEVELS.length,
        words: WORDS.length,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Datenbank-Initialisierung fehlgeschlagen.', details: String(error) },
      { status: 500 }
    );
  }
}
