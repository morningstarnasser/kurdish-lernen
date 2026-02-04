import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import db from '@/lib/db';

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert.' },
        { status: 401 }
      );
    }

    const result = await db.execute({
      sql: 'SELECT level_id, completed, stars, best_score FROM user_progress WHERE user_id = ?',
      args: [user.id],
    });

    return NextResponse.json({ progress: result.rows });
  } catch (error) {
    console.error('Progress GET error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Fortschritts.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert.' },
        { status: 401 }
      );
    }

    const { level_id, correct, wrong, stars } = await req.json();

    if (level_id === undefined || correct === undefined || wrong === undefined || stars === undefined) {
      return NextResponse.json(
        { error: 'level_id, correct, wrong und stars sind erforderlich.' },
        { status: 400 }
      );
    }

    const xpEarned = correct * 10;
    const score = correct; // score = number of correct answers

    // Update or insert user_progress
    await db.execute({
      sql: `INSERT INTO user_progress (user_id, level_id, completed, stars, best_score)
            VALUES (?, ?, 1, ?, ?)
            ON CONFLICT(user_id, level_id)
            DO UPDATE SET
              completed = 1,
              stars = MAX(stars, excluded.stars),
              best_score = MAX(best_score, excluded.best_score)`,
      args: [user.id, level_id, stars, score],
    });

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
      const lastDate = new Date(lastActive);
      const lastDateStr = lastActive.split('T')[0];

      if (lastDateStr === todayStr) {
        // Same day - streak stays the same
        newStreak = currentStreak;
      } else {
        // Check if last_active was yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDateStr === yesterdayStr) {
          // Yesterday - increment streak
          newStreak = currentStreak + 1;
        } else {
          // More than one day gap - reset streak
          newStreak = 1;
        }
      }
    } else {
      // First activity ever
      newStreak = 1;
    }

    // Update user stats
    await db.execute({
      sql: `UPDATE users SET
              xp = xp + ?,
              total_correct = total_correct + ?,
              total_wrong = total_wrong + ?,
              quizzes_played = quizzes_played + 1,
              streak = ?,
              last_active = ?
            WHERE id = ?`,
      args: [xpEarned, correct, wrong, newStreak, todayStr, user.id],
    });

    // Fetch updated user data
    const updatedUser = await db.execute({
      sql: 'SELECT xp, streak, total_correct, total_wrong, quizzes_played FROM users WHERE id = ?',
      args: [user.id],
    });

    return NextResponse.json({
      message: 'Fortschritt gespeichert.',
      xpEarned,
      streak: newStreak,
      user: updatedUser.rows[0],
    });
  } catch (error) {
    console.error('Progress POST error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern des Fortschritts.' },
      { status: 500 }
    );
  }
}
