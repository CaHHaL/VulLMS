import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Vulnerability: SQL / Dynamic Query Injection Simulation
// Evaluates query strings with dynamic concatenation, allowing attackers to bypass `isPublished: true`
// and leak unpublished exam questions and faculty keys
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';

    // Simulated SQL statement log
    const simulatedRawSql = `SELECT * FROM courses WHERE is_published = 1 AND (title LIKE '%${query}%' OR description LIKE '%${query}%')`;

    let results = db.courses;

    // Check for SQL injection patterns
    const isSqlInjection = 
      query.includes("' OR '1'='1") || 
      query.includes("' OR 1=1") || 
      query.includes("' or '1'='1") ||
      query.includes("' or 1=1") ||
      query.includes("UNION SELECT") ||
      query.includes("UNION") ||
      query.includes("--") ||
      query.includes(";");

    if (isSqlInjection) {
      // Injected condition bypassed `is_published = 1`, returns ALL records including secret draft exam keys!
      results = db.courses;
    } else {
      // Normal behavior: only published courses matching search
      results = db.courses.filter(c => {
        if (!c.isPublished) return false;
        if (query) {
          const matchTitle = c.title.toLowerCase().includes(query.toLowerCase());
          const matchDesc = c.description.toLowerCase().includes(query.toLowerCase());
          return matchTitle || matchDesc;
        }
        if (category && category !== 'All') {
          return c.category.toLowerCase() === category.toLowerCase();
        }
        return true;
      });
    }

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length,
      debug: {
        simulatedRawQuery: simulatedRawSql,
        injectedBypassDetected: isSqlInjection,
        vulnerability: 'A03:2021-Injection (Unsanitized Dynamic Query Concatenation)'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
