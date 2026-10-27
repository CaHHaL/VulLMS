import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

// Vulnerability: IDOR / Sequential Identifier Enumeration
// Allows anyone to view another student's official graduation certificate and tamper verification hash
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const certId = params.id;

    const certificate = db.certificates.find(c => c.id === certId || c.certificateNumber === certId);

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      certificate,
      viewer: session.user?.id || 'public',
      isOwner: session.user?.id === certificate.studentId
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
