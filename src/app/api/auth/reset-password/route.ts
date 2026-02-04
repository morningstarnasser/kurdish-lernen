import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token und Passwort sind erforderlich.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Das Passwort muss mindestens 6 Zeichen lang sein.' },
        { status: 400 }
      );
    }

    // Find valid token
    const result = await db.execute({
      sql: `SELECT t.id, t.user_id, t.expires_at, u.email
            FROM password_reset_tokens t
            JOIN users u ON u.id = t.user_id
            WHERE t.token = ? AND t.used = 0`,
      args: [token],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ungültiger oder abgelaufener Link.' },
        { status: 400 }
      );
    }

    const resetToken = result.rows[0];
    const expiresAt = new Date(resetToken.expires_at as string);

    if (expiresAt < new Date()) {
      // Mark as used
      await db.execute({
        sql: 'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
        args: [resetToken.id as number],
      });
      return NextResponse.json(
        { error: 'Der Link ist abgelaufen. Bitte fordere einen neuen an.' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password
    await db.execute({
      sql: 'UPDATE users SET password = ? WHERE id = ?',
      args: [hashedPassword, resetToken.user_id as number],
    });

    // Mark token as used
    await db.execute({
      sql: 'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
      args: [resetToken.id as number],
    });

    return NextResponse.json({
      message: 'Passwort erfolgreich geändert. Du kannst dich jetzt anmelden.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    );
  }
}
