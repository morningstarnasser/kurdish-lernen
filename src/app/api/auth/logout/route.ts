import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return NextResponse.json({ message: 'Erfolgreich abgemeldet.' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Abmeldung fehlgeschlagen.' },
      { status: 500 }
    );
  }
}
