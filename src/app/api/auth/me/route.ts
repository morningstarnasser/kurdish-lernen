import { NextResponse } from 'next/server';
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

    // Fetch full user data from DB
    const result = await db.execute({
      sql: 'SELECT id, email, name, role, xp, streak, last_active, total_correct, total_wrong, quizzes_played, created_at FROM users WHERE id = ?',
      args: [user.id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Benutzerdaten.' },
      { status: 500 }
    );
  }
}
