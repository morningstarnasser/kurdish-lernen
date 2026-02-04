export async function register() {
  // Only run on the server (Node.js runtime), not during build or on edge
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await seedDatabase();
  }
}

async function seedDatabase() {
  try {
    // Check if env vars are available
    if (!process.env.TURSO_DATABASE_URL) {
      console.log('[Ferheng] TURSO_DATABASE_URL not set, skipping DB seed.');
      return;
    }

    const { initDB } = await import('@/lib/db');
    const db = (await import('@/lib/db')).default;
    const bcrypt = (await import('bcryptjs')).default;
    const { WORDS, CATEGORIES, LEVELS } = await import('@/lib/words');

    // 1. Create tables
    console.log('[Ferheng] Initializing database tables...');
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
      console.log('[Ferheng] Creating admin user...');
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await db.execute({
        sql: 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        args: [adminEmail, hashedPassword, adminName, 'admin'],
      });
    }

    // 3. Seed categories
    for (const [id, cat] of Object.entries(CATEGORIES)) {
      if (id === 'all') continue;
      await db.execute({
        sql: 'INSERT OR IGNORE INTO categories (id, label, icon) VALUES (?, ?, ?)',
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

    console.log(`[Ferheng] Database seeded: ${Object.keys(CATEGORIES).length - 1} categories, ${LEVELS.length} levels, ${WORDS.length} words`);
  } catch (error) {
    console.error('[Ferheng] Database seed error:', error);
    // Don't throw - app should still start even if seed fails
  }
}
