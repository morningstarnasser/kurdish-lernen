import { NextRequest, NextResponse } from 'next/server';
import db, { initDB } from '@/lib/db';
import { createToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { jwtVerify, createRemoteJWKSet } from 'jose';

const APPLE_JWKS = createRemoteJWKSet(
  new URL('https://appleid.apple.com/auth/keys')
);

interface AppleIdTokenPayload {
  iss: string;
  sub: string;
  aud: string;
  email?: string;
  email_verified?: string | boolean;
}

async function generateAppleClientSecret(): Promise<string> {
  const teamId = process.env.APPLE_TEAM_ID!;
  const clientId = process.env.APPLE_ID!;
  const keyId = process.env.APPLE_KEY_ID!;
  const privateKeyPem = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, '\n');

  // Import the private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKeyPem),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  // Create JWT header and payload
  const header = {
    alg: 'ES256',
    kid: keyId,
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: teamId,
    iat: now,
    exp: now + 86400 * 180, // 180 days
    aud: 'https://appleid.apple.com',
    sub: clientId,
  };

  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // Sign
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(signingInput)
  );

  // Convert DER signature to raw r||s format for JWT
  const rawSignature = derToRaw(new Uint8Array(signature));
  const encodedSignature = base64UrlEncodeBytes(rawSignature);

  return `${signingInput}.${encodedSignature}`;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function derToRaw(der: Uint8Array): Uint8Array {
  // ECDSA signatures from WebCrypto are in DER format
  // We need to convert to raw r||s format (64 bytes for P-256)
  const raw = new Uint8Array(64);

  // Parse DER sequence
  let offset = 2; // Skip SEQUENCE tag and length

  // Parse r
  if (der[offset] !== 0x02) return der; // Not a valid DER integer
  offset++;
  const rLen = der[offset];
  offset++;
  const rStart = rLen === 33 ? offset + 1 : offset; // Skip leading zero if present
  const rBytes = rLen === 33 ? 32 : rLen;
  raw.set(der.slice(rStart, rStart + Math.min(rBytes, 32)), 32 - Math.min(rBytes, 32));
  offset += rLen;

  // Parse s
  if (der[offset] !== 0x02) return der;
  offset++;
  const sLen = der[offset];
  offset++;
  const sStart = sLen === 33 ? offset + 1 : offset;
  const sBytes = sLen === 33 ? 32 : sLen;
  raw.set(der.slice(sStart, sStart + Math.min(sBytes, 32)), 64 - Math.min(sBytes, 32));

  return raw;
}

export async function POST(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const formData = await request.formData();
    const code = formData.get('code') as string | null;
    const idToken = formData.get('id_token') as string | null;
    const userStr = formData.get('user') as string | null;
    const error = formData.get('error') as string | null;

    if (error || !code) {
      console.error('Apple auth error:', error);
      return NextResponse.redirect(`${appUrl}/login?error=apple_auth_failed`, 303);
    }

    let email: string | undefined;
    let userName: string | undefined;

    // Try to get user info from the user JSON (only sent on first authorization)
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        email = userData.email;
        if (userData.name) {
          userName = `${userData.name.firstName || ''} ${userData.name.lastName || ''}`.trim();
        }
      } catch {
        // ignore parse errors
      }
    }

    // If we have an id_token, verify it and extract email
    if (idToken) {
      try {
        const { payload } = await jwtVerify(idToken, APPLE_JWKS, {
          issuer: 'https://appleid.apple.com',
          audience: process.env.APPLE_ID!,
        });
        const applePayload = payload as unknown as AppleIdTokenPayload;
        if (applePayload.email) {
          email = applePayload.email;
        }
      } catch (err) {
        console.error('Apple id_token verification failed:', err);
      }
    }

    // If we still don't have email, exchange the code for tokens
    if (!email) {
      try {
        const clientSecret = await generateAppleClientSecret();
        const redirectUri = `${appUrl}/api/auth/callback/apple`;

        const tokenRes = await fetch('https://appleid.apple.com/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.APPLE_ID!,
            client_secret: clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          }),
        });

        if (tokenRes.ok) {
          const tokens = await tokenRes.json();
          if (tokens.id_token) {
            const { payload } = await jwtVerify(tokens.id_token, APPLE_JWKS, {
              issuer: 'https://appleid.apple.com',
              audience: process.env.APPLE_ID!,
            });
            const applePayload = payload as unknown as AppleIdTokenPayload;
            if (applePayload.email) {
              email = applePayload.email;
            }
          }
        } else {
          console.error('Apple token exchange failed:', await tokenRes.text());
        }
      } catch (err) {
        console.error('Apple token exchange error:', err);
      }
    }

    if (!email) {
      return NextResponse.redirect(`${appUrl}/login?error=no_email_from_apple`, 303);
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
    let finalName: string;

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      userId = row.id as number;
      userRole = row.role as string;
      finalName = row.name as string;
    } else {
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      finalName = userName || email.split('@')[0];
      const result = await db.execute({
        sql: 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        args: [email, randomPassword, finalName, 'user'],
      });
      userId = Number(result.lastInsertRowid);
      userRole = 'user';
    }

    // Create JWT token
    const token = await createToken({
      id: userId,
      email,
      name: finalName,
      role: userRole,
    });

    // Set cookie and redirect
    const response = NextResponse.redirect(`${appUrl}/dashboard`, 303);
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Apple OAuth error:', err);
    return NextResponse.redirect(`${appUrl}/login?error=server_error`, 303);
  }
}
