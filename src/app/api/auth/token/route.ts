import { NextResponse } from 'next/server';
import { signJwt, getSessionFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

// Endpoint allowing token issuance and custom algorithm selection (supports alg: "none" testing)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, algorithm = 'HS256', customRole } = body;

    const user = db.users.find(u => u.id === userId) || db.users[2]; // Default to student

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: customRole || user.role
    };

    const token = signJwt(payload, algorithm);

    return NextResponse.json({
      success: true,
      algorithm,
      token,
      payload
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = getSessionFromRequest(req);
  return NextResponse.json({
    authenticated: session.authenticated,
    user: session.user,
    decoded: session.decodedToken,
    error: session.error
  });
}
