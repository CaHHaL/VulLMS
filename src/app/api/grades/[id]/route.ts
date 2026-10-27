import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

// Vulnerability: BOLA Write / Improper Access Control on Grade Alteration
// Allows any client to update a grade record without instructor verification
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const gradeId = params.id;
    const body = await req.json();

    const gradeIndex = db.grades.findIndex(g => g.id === gradeId);
    if (gradeIndex === -1) {
      return NextResponse.json({ error: 'Grade record not found' }, { status: 404 });
    }

    // Insecure: Fails to verify if session.user?.role === 'instructor'
    // Any student can elevate their own score to 100 or 'A+'
    const original = { ...db.grades[gradeIndex] };

    db.grades[gradeIndex] = {
      ...db.grades[gradeIndex],
      ...body,
      id: gradeId // preserve ID
    };

    return NextResponse.json({
      success: true,
      message: `Grade record '${gradeId}' updated successfully`,
      warning: 'Updated without verifying instructor credentials',
      previous: original,
      current: db.grades[gradeIndex],
      actor: session.user ? { id: session.user.id, role: session.user.role } : 'anonymous'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
