import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

// Vulnerability: Cross-Site Request Forgery (CSRF) & State change via GET/POST without token
// An attacker page can submit a form or fetch to this endpoint and hijack user email
async function handleEmailUpdate(req: Request, newEmail: string) {
  const session = getSessionFromRequest(req);
  const targetUser = session.user || db.users[2]; // Default to student Alice if not specified

  if (!newEmail || !newEmail.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const userIndex = db.users.findIndex(u => u.id === targetUser.id);
  if (userIndex !== -1) {
    const oldEmail = db.users[userIndex].email;
    db.users[userIndex].email = newEmail;
    
    // Insecure: No confirmation token, no password re-verification, no CSRF check
    return NextResponse.json({
      success: true,
      message: `Email updated from ${oldEmail} to ${newEmail}`,
      warning: 'Action performed without CSRF token or origin validation',
      user: db.users[userIndex]
    });
  }

  return NextResponse.json({ error: 'User session not found' }, { status: 404 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email;
    return handleEmailUpdate(req, email);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Insecure: State-changing action exposed via GET request!
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Query param email required' }, { status: 400 });
  }
  return handleEmailUpdate(req, email);
}
