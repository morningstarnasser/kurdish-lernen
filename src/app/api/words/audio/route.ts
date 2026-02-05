import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import db from '@/lib/db';

// Upload audio for a word (Admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert.' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Keine Berechtigung.' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const wordId = formData.get('word_id');
    const audioFile = formData.get('audio') as File;

    if (!wordId || !audioFile) {
      return NextResponse.json(
        { error: 'word_id und audio sind erforderlich.' },
        { status: 400 }
      );
    }

    // Check if word exists
    const existing = await db.execute({
      sql: 'SELECT id FROM words WHERE id = ?',
      args: [Number(wordId)],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Wort nicht gefunden.' },
        { status: 404 }
      );
    }

    // Convert audio to base64 data URL for storage
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = audioFile.type || 'audio/webm';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Update word with audio URL
    await db.execute({
      sql: 'UPDATE words SET audio_url = ? WHERE id = ?',
      args: [dataUrl, Number(wordId)],
    });

    return NextResponse.json({
      success: true,
      message: 'Audio erfolgreich hochgeladen.',
      word_id: Number(wordId),
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Hochladen des Audios.' },
      { status: 500 }
    );
  }
}

// Delete audio from a word (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert.' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Keine Berechtigung.' },
        { status: 403 }
      );
    }

    const { word_id } = await req.json();

    if (!word_id) {
      return NextResponse.json(
        { error: 'word_id ist erforderlich.' },
        { status: 400 }
      );
    }

    await db.execute({
      sql: 'UPDATE words SET audio_url = NULL WHERE id = ?',
      args: [word_id],
    });

    return NextResponse.json({
      success: true,
      message: 'Audio erfolgreich gelöscht.',
    });
  } catch (error) {
    console.error('Audio delete error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Audios.' },
      { status: 500 }
    );
  }
}
