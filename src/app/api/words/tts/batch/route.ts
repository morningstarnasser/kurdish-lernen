import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import db from '@/lib/db';
import { generateTTS } from '@/lib/api-clients';

// Batch TTS for all words without audio (Admin only)
export async function POST() {
  try {
    const user = await getUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 });
    }

    // Get words without audio (skip manual audio)
    const result = await db.execute(
      `SELECT id, ku FROM words WHERE audio_url IS NULL OR (audio_source != 'manual' AND audio_source != 'forvo')`
    );

    const words = result.rows;
    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (const word of words) {
      try {
        const audioBuffer = await generateTTS(String(word.ku));
        if (!audioBuffer) {
          failed++;
          continue;
        }

        const base64 = audioBuffer.toString('base64');
        const dataUrl = `data:audio/mp3;base64,${base64}`;

        await db.execute({
          sql: 'UPDATE words SET audio_url = ?, audio_source = ? WHERE id = ? AND (audio_source IS NULL OR audio_source = \'tts\')',
          args: [dataUrl, 'tts', word.id],
        });

        success++;
      } catch {
        failed++;
      }

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 200));
    }

    return NextResponse.json({
      success: true,
      stats: { total: words.length, success, failed, skipped },
    });
  } catch (error) {
    console.error('Batch TTS error:', error);
    return NextResponse.json({ error: 'Batch-TTS-Fehler.' }, { status: 500 });
  }
}
