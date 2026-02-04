import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.APPLE_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/apple`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code id_token',
    scope: 'name email',
    response_mode: 'form_post',
    state: crypto.randomUUID(),
  });

  const appleAuthUrl = `https://appleid.apple.com/auth/authorize?${params.toString()}`;

  return NextResponse.redirect(appleAuthUrl);
}
