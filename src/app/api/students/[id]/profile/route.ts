import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

// Vulnerability: BOLA / IDOR + Sensitive Data Exposure (PII, SSN, Faculty Notes)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const targetStudentId = params.id;

    const student = db.users.find(u => u.id === targetStudentId);

    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    // Insecure: Returns private notes, SSN, and sensitive personal information without authorization check
    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
        bio: student.bio,
        avatar: student.avatar,
        phone: student.phone,
        ssn_last4: student.ssn_last4, // Insecure PII disclosure
        private_notes: student.private_notes, // Confidential instructor notes leaked
        enrolledCourses: student.enrolledCourses,
        credits: student.credits,
        gpa: student.gpa
      },
      audit: {
        sessionUser: session.user?.id || 'unauthenticated',
        isSelf: session.user?.id === targetStudentId
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
