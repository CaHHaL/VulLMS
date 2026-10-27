import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signJwt } from '@/lib/auth';

// Vulnerability 1: Account Enumeration (different error messages)
// Vulnerability 2: Missing Rate Limiting (Brute-force susceptible)
// Vulnerability 3: Insecure Cookie Configuration (Accessible via script, Lax/None)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // User enumeration vulnerability: explicitly notifies caller if account exists
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: `User account '${email}' does not exist in the LMS registry`,
          code: 'ACCOUNT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid credentials for user '${email}'`,
          code: 'INVALID_PASSWORD'
        },
        { status: 401 }
      );
    }

    // Generate token
    const token = signJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        is_admin: user.is_admin || user.role === 'admin'
      }
    });

    // Insecure Cookie: Set without HttpOnly flag, allowing client-side JS extraction
    response.cookies.set('vullms_session', token, {
      path: '/',
      httpOnly: false, // Insecure: allows XSS token theft
      secure: false,   // Insecure: allows transmission over HTTP
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    response.cookies.set('vullms_role', user.role, {
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'lax'
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
