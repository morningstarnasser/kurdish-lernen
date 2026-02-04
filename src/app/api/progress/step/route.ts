import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import db from '@/lib/db';

// Save progress after each individual quiz answer
export async function POST(req: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert.' },
        { status: 401 }
      );
    }

    const { level_id, correct, wrong } = await req.json();

    if (level_id === undefined || correct === undefined || wrong === undefined) {
      return NextResponse.json(
        { error: 'level_id, correct und wrong sind erforderlich.' },
        { status: 400 }
      );
    }

    const xpEarned = correct * 10;

    // Handle streak logic
    const userResult = await db.execute({
      sql: 'SELECT last_active, streak FROM users WHERE id = ?',
      args: [user.id],
    });

    const userData = userResult.rows[0];
    const lastActive = userData.last_active as string | null;
    const currentStreak = (userData.streak as number) || 0;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let newStreak = currentStreak;

    if (lastActive) {
      const lastDateStr = lastActive.split('T')[0];

      if (lastDateStr === todayStr) {
        newStreak = currentStreak;
      } else {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDateStr === yesterdayStr) {
          newStreak = currentStreak + 1;
        } else {
          newStreak = 1;
        }
      }
    } else {
      newStreak = 1;
    }

    // Update user stats immediately
    await db.execute({
      sql: `UPDATE users SET
              xp = xp + ?,
              total_correct = total_correct + ?,
              total_wrong = total_wrong + ?,
              streak = ?,
              last_active = ?
            WHERE id = ?`,
      args: [xpEarned, correct, wrong, newStreak, todayStr, user.id],
    });

    return NextResponse.json({ ok: true, xpEarned, streak: newStreak });
  } catch (error) {
    console.error('Progress step error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern.' },
      { status: 500 }
    );
  }
}
