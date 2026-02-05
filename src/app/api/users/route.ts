import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

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

// POST: Create new user (super admin only)
export async function POST(req: NextRequest) {
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

    const { email, name, password, role } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, Name und Passwort sind erforderlich.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase()],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse ist bereits registriert.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'user';

    // Create user
    const result = await db.execute({
      sql: `INSERT INTO users (email, name, password, role, xp, streak, total_correct, total_wrong, quizzes_played, created_at)
            VALUES (?, ?, ?, ?, 0, 0, 0, 0, 0, datetime('now'))`,
      args: [email.toLowerCase(), name, hashedPassword, userRole],
    });

    return NextResponse.json({
      message: 'Benutzer erfolgreich erstellt.',
      user: {
        id: Number(result.lastInsertRowid),
        email: email.toLowerCase(),
        name,
        role: userRole,
        xp: 0,
        streak: 0,
        quizzes_played: 0,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Users POST error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Benutzers.' },
      { status: 500 }
    );
  }
}

// PUT: Update user (super admin only)
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

    const { userId, role, name, email, password } = await req.json();

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

    const isSuper = existing.rows[0].email === SUPER_ADMIN_EMAIL;

    // Don't allow changing super admin's role
    if (isSuper && role && role !== 'admin') {
      return NextResponse.json(
        { error: 'Super-Admin Rolle kann nicht geändert werden.' },
        { status: 403 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const args: (string | number)[] = [];

    if (name) {
      updates.push('name = ?');
      args.push(name);
    }

    if (email && !isSuper) {
      // Check if new email already exists
      const emailCheck = await db.execute({
        sql: 'SELECT id FROM users WHERE email = ? AND id != ?',
        args: [email.toLowerCase(), userId],
      });
      if (emailCheck.rows.length > 0) {
        return NextResponse.json(
          { error: 'E-Mail-Adresse ist bereits vergeben.' },
          { status: 409 }
        );
      }
      updates.push('email = ?');
      args.push(email.toLowerCase());
    }

    if (role && !isSuper) {
      if (!['user', 'admin'].includes(role)) {
        return NextResponse.json(
          { error: 'Ungültige Rolle. Erlaubt: user, admin' },
          { status: 400 }
        );
      }
      updates.push('role = ?');
      args.push(role);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      args.push(hashedPassword);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Keine Änderungen angegeben.' },
        { status: 400 }
      );
    }

    args.push(userId);
    await db.execute({
      sql: `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });

    // Get updated user data
    const updated = await db.execute({
      sql: 'SELECT id, email, name, role, xp, streak, quizzes_played, created_at FROM users WHERE id = ?',
      args: [userId],
    });

    return NextResponse.json({
      message: 'Benutzer erfolgreich aktualisiert.',
      user: updated.rows[0],
    });
  } catch (error) {
    console.error('Users PUT error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Benutzers.' },
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
