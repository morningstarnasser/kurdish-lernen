import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import db from '@/lib/db';
import { fetchForvoPronunciation, generateTTS } from '@/lib/api-clients';

// Master batch: Try Forvo first, fallback to TTS (Admin only)
export async function POST() {
  try {
    const user = await getUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 });
    }

    // Get words without audio or with only TTS audio (upgrade to Forvo if available)
    const result = await db.execute(
      `SELECT id, ku, audio_source FROM words WHERE audio_source IS NULL OR audio_source = 'tts'`
    );

    const words = result.rows;
    let forvoSuccess = 0;
    let ttsSuccess = 0;
    let failed = 0;

    for (const word of words) {
      try {
        // Priority: Try Forvo first (native speaker)
        const pronunciation = await fetchForvoPronunciation(String(word.ku));
        if (pronunciation?.audioUrl) {
          const audioRes = await fetch(pronunciation.audioUrl);
          if (audioRes.ok) {
            const arrayBuffer = await audioRes.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            const dataUrl = `data:audio/mp3;base64,${base64}`;

            await db.execute({
              sql: 'UPDATE words SET audio_url = ?, audio_source = ? WHERE id = ?',
              args: [dataUrl, 'forvo', word.id],
            });
            forvoSuccess++;
            await new Promise((r) => setTimeout(r, 300));
            continue;
          }
        }

        // Fallback: TTS
        const audioBuffer = await generateTTS(String(word.ku));
        if (audioBuffer) {
          const base64 = audioBuffer.toString('base64');
          const dataUrl = `data:audio/mp3;base64,${base64}`;

          await db.execute({
            sql: 'UPDATE words SET audio_url = ?, audio_source = ? WHERE id = ?',
            args: [dataUrl, 'tts', word.id],
          });
          ttsSuccess++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }

      await new Promise((r) => setTimeout(r, 200));
    }

    return NextResponse.json({
      success: true,
      stats: {
        total: words.length,
        forvo: forvoSuccess,
        tts: ttsSuccess,
        failed,
      },
    });
  } catch (error) {
    console.error('Audio generate error:', error);
    return NextResponse.json({ error: 'Audio-Generierungs-Fehler.' }, { status: 500 });
  }
}
