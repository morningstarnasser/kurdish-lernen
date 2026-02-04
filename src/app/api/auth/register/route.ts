import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { createToken, UserPayload } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, Passwort und Name sind erforderlich.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ein Konto mit dieser E-Mail existiert bereits.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user
    const result = await db.execute({
      sql: 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      args: [email, hashedPassword, name],
    });

    const userId = Number(result.lastInsertRowid);

    const userPayload: UserPayload = {
      id: userId,
      email,
      name,
      role: 'user',
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
      message: 'Registrierung erfolgreich.',
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Registrierung fehlgeschlagen.' },
      { status: 500 }
    );
  }
}
