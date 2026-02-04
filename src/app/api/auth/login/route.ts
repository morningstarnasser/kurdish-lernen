import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { createToken, UserPayload } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email und Passwort sind erforderlich.' },
        { status: 400 }
      );
    }

    // Find user
    const result = await db.execute({
      sql: 'SELECT id, email, password, name, role FROM users WHERE email = ?',
      args: [email],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail oder Passwort.' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verify password
    const valid = await bcrypt.compare(password, user.password as string);
    if (!valid) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail oder Passwort.' },
        { status: 401 }
      );
    }

    const userPayload: UserPayload = {
      id: user.id as number,
      email: user.email as string,
      name: user.name as string,
      role: user.role as string,
    };

    // Create JWT token
    const token = await createToken(userPayload);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({
      user: userPayload,
      message: 'Login erfolgreich.',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login fehlgeschlagen.' },
      { status: 500 }
    );
  }
}
