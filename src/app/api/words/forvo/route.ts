import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import db from '@/lib/db';
import { fetchForvoPronunciation } from '@/lib/api-clients';

// Fetch Forvo pronunciation for a word (Admin only)
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
      sql: 'SELECT id, ku, audio_source FROM words WHERE id = ?',
      args: [word_id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Wort nicht gefunden.' }, { status: 404 });
    }

    const word = existing.rows[0];

    // Never overwrite manual audio
    if (word.audio_source === 'manual') {
      return NextResponse.json({
        error: 'Manuelles Audio wird nicht ueberschrieben.',
        skipped: true,
      }, { status: 409 });
    }

    const pronunciation = await fetchForvoPronunciation(String(word.ku));
    if (!pronunciation || !pronunciation.audioUrl) {
      return NextResponse.json({ error: 'Keine Forvo-Aussprache gefunden.' }, { status: 404 });
    }

    // Fetch the audio file and store as base64
    const audioRes = await fetch(pronunciation.audioUrl);
    if (!audioRes.ok) {
      return NextResponse.json({ error: 'Audio-Download fehlgeschlagen.' }, { status: 502 });
    }

    const arrayBuffer = await audioRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:audio/mp3;base64,${base64}`;

    // Forvo overwrites TTS but not manual
    await db.execute({
      sql: 'UPDATE words SET audio_url = ?, audio_source = ? WHERE id = ?',
      args: [dataUrl, 'forvo', word_id],
    });

    return NextResponse.json({
      success: true,
      word_id,
      username: pronunciation.username,
    });
  } catch (error) {
    console.error('Forvo error:', error);
    return NextResponse.json({ error: 'Forvo-Fehler.' }, { status: 500 });
  }
}
