import { NextResponse } from 'next/server';

// Vulnerability: Server-Side Request Forgery (SSRF) - OWASP A10
// Accepts arbitrary URL parameter and performs server-side fetch without loopback or private IP restrictions
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // SSRF Vulnerability: No check for internal IP, localhost, 127.0.0.1, or 169.254.169.254
    const lowerUrl = url.toLowerCase();

    // High fidelity simulation for cloud metadata service (AWS/GCP/Azure)
    if (lowerUrl.includes('169.254.169.254')) {
      return NextResponse.json({
        success: true,
        source: 'Simulated Cloud Instance Metadata Service (IMDSv1)',
        targetUrl: url,
        status: 200,
        headers: {
          'server': 'EC2ws',
          'content-type': 'text/plain'
        },
        data: {
          ami_id: 'ami-0941829e289bf11c2',
          instance_type: 't3.xlarge',
          iam_security_credentials: {
            RoleName: 'LMS-Production-ServerlessWorker-Role',
            AccessKeyId: 'ASIAVULLMSDEMO9941KEY',
            SecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
            Token: 'AQoDYXdzEJr1111111111111111111111111111111111111111111111111111111',
            Expiration: '2026-10-28T04:00:00Z'
          }
        },
        warning: 'CRITICAL: Server accessed AWS IMDSv1 without hop limit or token protection'
      });
    }

    // Internal loopback or local microservice simulation
    if (lowerUrl.includes('127.0.0.1') || lowerUrl.includes('localhost') || lowerUrl.includes('internal.vullms')) {
      return NextResponse.json({
        success: true,
        source: 'Internal Loopback Service (127.0.0.1)',
        targetUrl: url,
        status: 200,
        data: {
          service: 'Internal Redis & Cache Daemon',
          cluster_nodes: ['10.0.1.14:6379', '10.0.1.15:6379'],
          cached_keys_sample: ['session:usr_admin_01', 'cache:quiz_answers_midterm']
        },
        warning: 'CRITICAL: Unrestricted internal loopback communication permitted'
      });
    }

    // Attempt real fetch with safe timeout for external URLs
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'VulLMS-MediaCrawler/1.0'
        }
      });
      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text.substring(0, 1000); // Return first 1000 chars
      }

      return NextResponse.json({
        success: true,
        targetUrl: url,
        status: response.status,
        contentType,
        data
      });
    } catch (fetchErr: any) {
      return NextResponse.json({
        success: false,
        targetUrl: url,
        error: `SSRF fetch attempted but failed: ${fetchErr.message}`
      }, { status: 502 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
