import { NextResponse } from 'next/server';

// Unsafe recursive merge function vulnerable to Prototype Pollution
function unsafeDeepMerge(target: any, source: any) {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key) || key === '__proto__' || key === 'constructor' || key === 'prototype') {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        // VULNERABILITY: If key is '__proto__', modifies Object.prototype for the entire Node.js process!
        unsafeDeepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

const defaultGradingRubric: Record<string, any> = {
  gradingScale: 'standard_letter',
  allowLateSubmissions: false,
  autoCurveEnabled: false,
  passingScore: 70
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const config = {};
    unsafeDeepMerge(config, body);

    // Check if prototype was polluted
    const probeObject: any = {};
    const prototypePolluted = Boolean(probeObject.isAdmin || probeObject.polluted || (Object.prototype as any).isAdmin);

    return NextResponse.json({
      success: true,
      message: 'Grading evaluation settings merged',
      mergedConfig: config,
      prototypePollutionDetected: prototypePolluted,
      probeCheck: {
        'Object.prototype.isAdmin': (Object.prototype as any).isAdmin,
        'Object.prototype.polluted': (Object.prototype as any).polluted
      },
      warning: prototypePolluted
        ? 'CRITICAL: Prototype pollution successful. Object.prototype has been altered globally.'
        : 'Safe payload received.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
