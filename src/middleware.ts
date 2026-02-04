import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
}

async function hasValidToken(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('token')?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Homepage: redirect logged-in users to dashboard
  if (pathname === '/') {
    const loggedIn = await hasValidToken(request);
    if (loggedIn) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
