import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

// Vulnerability: Broken Object Level Authorization (BOLA / IDOR)
// An authenticated user (e.g., student usr_stu_102) can request any other student's grades (e.g., usr_stu_101)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const targetStudentId = params.id;

    // VULNERABILITY: Notice that we do NOT compare session.user?.id === targetStudentId
    // Nor do we check if session.user?.role === 'instructor' or 'admin'
    // Any valid token or unauthenticated call can view any student's grades!

    const grades = db.grades.filter(g => g.studentId === targetStudentId);
    const student = db.users.find(u => u.id === targetStudentId);

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      studentId: targetStudentId,
      studentName: student.name,
      studentEmail: student.email,
      gpa: student.gpa,
      grades,
      accessAudit: {
        requestedBy: session.user ? session.user.id : 'anonymous',
        targetId: targetStudentId,
        authorized: session.user?.id === targetStudentId,
        idorVulnerabilityTriggered: session.user?.id !== targetStudentId
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
