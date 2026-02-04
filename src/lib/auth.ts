import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
}

export interface UserPayload {
  id: number;
  email: string;
  name: string;
  role: string;
}

export async function createToken(user: UserPayload): Promise<string> {
  return new SignJWT({ id: user.id, email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

export async function getUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
