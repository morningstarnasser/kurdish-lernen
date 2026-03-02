import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import db from '@/lib/db';
import { translateWithAzure } from '@/lib/api-clients';

// Verify translation quality using Azure Translator (Admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 });
    }

    const { word_id } = await req.json();
    if (!word_id) {
      return NextResponse.json({ error: 'word_id ist erforderlich.' }, { status: 400 });
    }

    const existing = await db.execute({
      sql: 'SELECT id, de, ku FROM words WHERE id = ?',
      args: [word_id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Wort nicht gefunden.' }, { status: 404 });
    }

    const word = existing.rows[0];

    // Translate DE -> KU and compare
    const translated = await translateWithAzure(String(word.de), 'de', 'ku');

    return NextResponse.json({
      word_id: word.id,
      original_de: word.de,
      original_ku: word.ku,
      azure_translation: translated || null,
      match: translated
        ? String(word.ku).toLowerCase().includes(translated.toLowerCase()) ||
          translated.toLowerCase().includes(String(word.ku).toLowerCase())
        : null,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Verifizierungs-Fehler.' }, { status: 500 });
  }
}
