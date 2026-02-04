import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db, { initDB } from '@/lib/db';
import { WORDS } from '@/lib/words-data';
import { CATEGORIES, LEVELS } from '@/lib/words';

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

    // 2b. Seed second admin user
    const admin2Email = 'araz@kurdish-lernen.com';
    const admin2Password = 'Kaka2009';
    const admin2Name = 'Araz';

    const existing2 = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [admin2Email],
    });

    if (existing2.rows.length === 0) {
      const hashedPassword2 = await bcrypt.hash(admin2Password, 12);
      await db.execute({
        sql: 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        args: [admin2Email, hashedPassword2, admin2Name, 'admin'],
      });
    }

    // 2c. Seed third admin user
    const admin3Email = 'nadyar@kurdish-lernen.com';
    const admin3Password = 'admin1996';
    const admin3Name = 'Nadyar';

    const existing3 = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [admin3Email],
    });

    if (existing3.rows.length === 0) {
      const hashedPassword3 = await bcrypt.hash(admin3Password, 12);
      await db.execute({
        sql: 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        args: [admin3Email, hashedPassword3, admin3Name, 'admin'],
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

    // 5. Seed words (batch insert for speed, INSERT OR IGNORE to prevent duplicates)
    const BATCH_SIZE = 50;
    for (let i = 0; i < WORDS.length; i += BATCH_SIZE) {
      const batch = WORDS.slice(i, i + BATCH_SIZE);
      await db.batch(
        batch.map((word) => ({
          sql: `INSERT OR IGNORE INTO words (de, ku, category, note, is_phrase)
                VALUES (?, ?, ?, ?, ?)`,
          args: [word.de, word.ku, word.c, word.n || null, word.t ? 1 : 0],
        }))
      );
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
