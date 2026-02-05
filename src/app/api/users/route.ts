import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import db from '@/lib/db';

const SUPER_ADMIN_EMAIL = 'ali.nasser@bluewin.ch';

// GET: List all users (super admin only)
export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert.' },
        { status: 401 }
      );
    }

    if (user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Keine Berechtigung.' },
        { status: 403 }
      );
    }

    const result = await db.execute({
      sql: `SELECT id, email, name, role, xp, streak, total_correct, total_wrong, quizzes_played, created_at
            FROM users ORDER BY created_at DESC`,
      args: [],
    });

    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Benutzer.' },
      { status: 500 }
    );
  }
}

// PUT: Update user role (super admin only)
export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert.' },
        { status: 401 }
      );
    }

    if (currentUser.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Keine Berechtigung.' },
        { status: 403 }
      );
    }

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId und role sind erforderlich.' },
        { status: 400 }
      );
    }

    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Ungültige Rolle. Erlaubt: user, admin' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await db.execute({
      sql: 'SELECT id, email FROM users WHERE id = ?',
      args: [userId],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden.' },
        { status: 404 }
      );
    }

    // Don't allow changing super admin's role
    if (existing.rows[0].email === SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Super-Admin Rolle kann nicht geändert werden.' },
        { status: 403 }
      );
    }

    await db.execute({
      sql: 'UPDATE users SET role = ? WHERE id = ?',
      args: [role, userId],
    });

    return NextResponse.json({
      message: 'Rolle erfolgreich geändert.',
      userId,
      role,
    });
  } catch (error) {
    console.error('Users PUT error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Rolle.' },
      { status: 500 }
    );
  }
}

// DELETE: Delete user (super admin only)
export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert.' },
        { status: 401 }
      );
    }

    if (currentUser.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Keine Berechtigung.' },
        { status: 403 }
      );
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId ist erforderlich.' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await db.execute({
      sql: 'SELECT id, email FROM users WHERE id = ?',
      args: [userId],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden.' },
        { status: 404 }
      );
    }

    // Don't allow deleting super admin
    if (existing.rows[0].email === SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Super-Admin kann nicht gelöscht werden.' },
        { status: 403 }
      );
    }

    // Delete user progress first
    await db.execute({
      sql: 'DELETE FROM user_progress WHERE user_id = ?',
      args: [userId],
    });

    // Delete user
    await db.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [userId],
    });

    return NextResponse.json({
      message: 'Benutzer erfolgreich gelöscht.',
      userId,
    });
  } catch (error) {
    console.error('Users DELETE error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Benutzers.' },
      { status: 500 }
    );
  }
}
