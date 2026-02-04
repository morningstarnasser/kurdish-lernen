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

    const score = correct; // score = number of correct answers

    // Update or insert user_progress (level completion)
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

    // Only update quizzes_played count (XP, correct, wrong are saved per step)
    await db.execute({
      sql: `UPDATE users SET quizzes_played = quizzes_played + 1 WHERE id = ?`,
      args: [user.id],
    });

    // Fetch updated user data
    const updatedUser = await db.execute({
      sql: 'SELECT xp, streak, total_correct, total_wrong, quizzes_played FROM users WHERE id = ?',
      args: [user.id],
    });

    return NextResponse.json({
      message: 'Fortschritt gespeichert.',
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
