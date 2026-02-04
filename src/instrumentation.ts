export async function register() {
  // Only run on the server (Node.js runtime), not during build or on edge
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await ensureTables();
  }
}

async function ensureTables() {
  try {
    if (!process.env.TURSO_DATABASE_URL) {
      console.log('[Ferheng] TURSO_DATABASE_URL not set, skipping DB init.');
      return;
    }

    const { initDB } = await import('@/lib/db');

    // Only create tables - no data seeding on cold start
    // Data seeding happens via /api/seed (called once manually)
    console.log('[Ferheng] Ensuring database tables exist...');
    await initDB();
    console.log('[Ferheng] Database tables ready.');
  } catch (error) {
    console.error('[Ferheng] Database init error:', error);
  }
}
