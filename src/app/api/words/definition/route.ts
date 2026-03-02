import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { fetchWiktionaryDefinition } from '@/lib/api-clients';

// Get or fetch Kurdish definition for a word (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wordId = searchParams.get('word_id');

    if (!wordId) {
      return NextResponse.json({ error: 'word_id ist erforderlich.' }, { status: 400 });
    }

    const result = await db.execute({
      sql: 'SELECT id, ku, definition_ku, definition_fetched_at FROM words WHERE id = ?',
      args: [Number(wordId)],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Wort nicht gefunden.' }, { status: 404 });
    }

    const word = result.rows[0];

    // Return cached definition if we already fetched it
    if (word.definition_ku) {
      return NextResponse.json({
        word_id: word.id,
        definition: word.definition_ku,
        cached: true,
      });
    }

    // Fetch from Wiktionary
    const definition = await fetchWiktionaryDefinition(String(word.ku));

    if (definition) {
      await db.execute({
        sql: 'UPDATE words SET definition_ku = ?, definition_fetched_at = datetime(\'now\') WHERE id = ?',
        args: [definition, word.id],
      });
    }

    return NextResponse.json({
      word_id: word.id,
      definition: definition || null,
      cached: false,
    });
  } catch (error) {
    console.error('Definition error:', error);
    return NextResponse.json({ error: 'Definitions-Fehler.' }, { status: 500 });
  }
}
