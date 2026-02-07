import { NextRequest, NextResponse } from 'next/server';
import db, { initDB } from '@/lib/db';
import { createToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_auth_failed`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange_failed`);
    }

    const tokens = await tokenRes.json();

    // Get user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(`${appUrl}/login?error=userinfo_failed`);
    }

    const googleUser = await userInfoRes.json();
    const { email, name } = googleUser;

    if (!email) {
      return NextResponse.redirect(`${appUrl}/login?error=no_email`);
    }

    // Ensure DB tables exist
    await initDB();

    // Check if user already exists
    const existing = await db.execute({
      sql: 'SELECT id, email, name, role FROM users WHERE email = ?',
      args: [email],
    });

    let userId: number;
    let userRole: string;
    let userName: string;

    if (existing.rows.length > 0) {
      // User exists - log them in
      const row = existing.rows[0];
      userId = row.id as number;
      userRole = row.role as string;
      userName = row.name as string;
    } else {
      // Create new user with random password (they use Google to login)
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      const result = await db.execute({
        sql: 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        args: [email, randomPassword, name || email.split('@')[0], 'user'],
      });
      userId = Number(result.lastInsertRowid);
      userRole = 'user';
      userName = name || email.split('@')[0];
    }

    // Create JWT token
    const token = await createToken({
      id: userId,
      email,
      name: userName,
      role: userRole,
    });

    // Set cookie and redirect to dashboard
    const response = NextResponse.redirect(`${appUrl}/dashboard`);
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Google OAuth error:', err);
    return NextResponse.redirect(`${appUrl}/login?error=server_error`);
  }
}
