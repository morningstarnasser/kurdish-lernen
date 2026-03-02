import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import db from '@/lib/db';
import { generateTTS } from '@/lib/api-clients';

// Generate TTS audio for a single word (Admin only)
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

    // Check word exists and respect audio priority (never overwrite manual)
    const existing = await db.execute({
      sql: 'SELECT id, ku, audio_source FROM words WHERE id = ?',
      args: [word_id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Wort nicht gefunden.' }, { status: 404 });
    }

    const word = existing.rows[0];
    if (word.audio_source === 'manual') {
      return NextResponse.json({
        error: 'Manuelles Audio wird nicht ueberschrieben.',
        skipped: true,
      }, { status: 409 });
    }

    const audioBuffer = await generateTTS(String(word.ku));
    if (!audioBuffer) {
      return NextResponse.json({ error: 'TTS-Generierung fehlgeschlagen.' }, { status: 502 });
    }

    const base64 = audioBuffer.toString('base64');
    const dataUrl = `data:audio/mp3;base64,${base64}`;

    await db.execute({
      sql: 'UPDATE words SET audio_url = ?, audio_source = ? WHERE id = ?',
      args: [dataUrl, 'tts', word_id],
    });

    return NextResponse.json({ success: true, word_id });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json({ error: 'TTS-Fehler.' }, { status: 500 });
  }
}
