import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Vulnerability: Sensitive Information Disclosure & Security Misconfiguration (OWASP A05)
// Exposes system environment variables, database connection strings, secret tokens, and CORS misconfiguration
export async function GET(req: Request) {
  try {
    const origin = req.headers.get('origin') || '*';

    // Vulnerable CORS misconfiguration: reflects origin with credentials
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    headers.set('Access-Control-Allow-Headers', '*');
    headers.set('X-Powered-By', 'Next.js 14.2 / Node.js Express Hybrid Engine');
    headers.set('Server', 'VulLMS-Core/2.1.0-VULNERABLE-BUILD');

    const debugData = {
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        serverTime: new Date().toISOString()
      },
      secretsExposure: {
        DATABASE_URL: 'postgresql://vullms_admin:Pr0d_Db_K3y_9941@db-cluster.vullms.internal:5432/vullms_prod?sslmode=disable',
        JWT_SECRET_KEY: 'secret123',
        AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
        AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        INTERNAL_API_SALT: 'salt_vullms_prod_cluster_2026',
        BACKUP_STORAGE_BUCKET: 's3://vullms-internal-backups-private/'
      },
      activeRegistryCounts: {
        totalRegisteredUsers: db.users.length,
        totalCourses: db.courses.length,
        totalGradesRecorded: db.grades.length,
        totalCertificatesIssued: db.certificates.length
      },
      usersSummaryDump: db.users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        apiKey: u.apiKey,
        passwordHash: u.password ? `plaintext_unhashed:${u.password}` : undefined
      }))
    };

    return new NextResponse(JSON.stringify(debugData, null, 2), {
      status: 200,
      headers: {
        ...Object.fromEntries(headers.entries()),
        'Content-Type': 'application/json'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
