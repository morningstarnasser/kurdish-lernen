import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import db from '@/lib/db';
import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse ist erforderlich.' },
        { status: 400 }
      );
    }

    // Always return success (don't reveal if email exists)
    const result = await db.execute({
      sql: 'SELECT id, name FROM users WHERE email = ?',
      args: [email],
    });

    if (result.rows.length === 0) {
      // Don't reveal that the email doesn't exist
      return NextResponse.json({
        message: 'Falls ein Konto mit dieser E-Mail existiert, wurde ein Link gesendet.',
      });
    }

    const user = result.rows[0];
    const userId = user.id as number;
    const userName = user.name as string;

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Invalidate old tokens for this user
    await db.execute({
      sql: 'UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0',
      args: [userId],
    });

    // Save new token
    await db.execute({
      sql: 'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      args: [userId, token, expiresAt],
    });

    // Send email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kurdish-lernen.vercel.app';
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    await getResend().emails.send({
      from: 'Ferheng <noreply@kurdish-lernen.com>',
      to: email,
      subject: 'Passwort zurücksetzen - Ferheng',
      html: `
        <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f7f7f7;">
          <div style="background: white; border-radius: 16px; padding: 32px; border: 2px solid #e5e5e5;">
            <h1 style="color: #58CC02; font-size: 28px; margin: 0 0 8px;">Ferheng</h1>
            <p style="color: #777; font-size: 14px; margin: 0 0 24px;">Kurdisch Lernen</p>

            <p style="color: #3c3c3c; font-size: 16px; margin: 0 0 8px;">
              Hallo <strong>${userName}</strong>,
            </p>
            <p style="color: #4b4b4b; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.
              Klicke auf den Button, um ein neues Passwort zu erstellen.
            </p>

            <a href="${resetLink}"
               style="display: inline-block; background: #58CC02; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">
              Passwort zurücksetzen
            </a>

            <p style="color: #afafaf; font-size: 13px; margin: 24px 0 0; line-height: 1.5;">
              Der Link ist 1 Stunde gültig. Falls du diese Anfrage nicht gestellt hast,
              kannst du diese E-Mail ignorieren.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      message: 'Falls ein Konto mit dieser E-Mail existiert, wurde ein Link gesendet.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' },
      { status: 500 }
    );
  }
}
