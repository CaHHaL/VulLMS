import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

// Vulnerability: Mass Assignment / Object Injection / Privilege Escalation
// Accepts user input without whitelisting editable fields (allows setting role: 'admin', is_admin: true, gpa: 4.0)
export async function PUT(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    const body = await req.json();

    // Insecure: If targetId is passed, allows modifying ANY user without authorization check
    const targetUserId = body.id || (session.user ? session.user.id : 'usr_stu_102');
    const userIndex = db.users.findIndex(u => u.id === targetUserId);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const previousRole = db.users[userIndex].role;

    // VULNERABILITY: Direct Mass Assignment!
    // Arbitrary fields from body are merged directly onto the user record
    db.users[userIndex] = {
      ...db.users[userIndex],
      ...body
    };

    const updatedUser = db.users[userIndex];

    const privilegeEscalated = previousRole !== updatedUser.role && updatedUser.role === 'admin';

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      privilegeEscalated,
      user: updatedUser
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = getSessionFromRequest(req);
  const userId = session.user?.id || 'usr_stu_102';
  const user = db.users.find(u => u.id === userId);

  return NextResponse.json({
    user
  });
}
