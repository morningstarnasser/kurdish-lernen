import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import db from '@/lib/db';
import { fetchWiktionaryDefinition } from '@/lib/api-clients';

// Batch fetch definitions for words without definitions (Admin only)
export async function POST() {
  try {
    const user = await getUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 });
    }

    const result = await db.execute(
      'SELECT id, ku FROM words WHERE definition_ku IS NULL'
    );

    const words = result.rows;
    let success = 0;
    let failed = 0;

    for (const word of words) {
      try {
        const definition = await fetchWiktionaryDefinition(String(word.ku));
        if (definition) {
          await db.execute({
            sql: 'UPDATE words SET definition_ku = ?, definition_fetched_at = datetime(\'now\') WHERE id = ?',
            args: [definition, word.id],
          });
          success++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }

      // Small delay to be polite to Wiktionary API
      await new Promise((r) => setTimeout(r, 300));
    }

    return NextResponse.json({
      success: true,
      stats: { total: words.length, success, failed },
    });
  } catch (error) {
    console.error('Batch definition error:', error);
    return NextResponse.json({ error: 'Batch-Definitions-Fehler.' }, { status: 500 });
  }
}
