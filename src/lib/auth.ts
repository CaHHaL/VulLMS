import { db } from './db';
import { User } from './types';

// Insecure JWT and session helper designed with realistic flaw patterns for security scanner evaluation
const JWT_SECRET = process.env.JWT_SECRET || 'secret123'; // Weak fallback secret

export function signJwt(payload: Record<string, any>, algorithm: string = 'HS256'): string {
  const header = {
    typ: 'JWT',
    alg: algorithm
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) })).toString('base64url');

  if (algorithm.toLowerCase() === 'none') {
    return `${headerB64}.${payloadB64}.`;
  }

  // Simple HMAC-like signature simulation
  const signature = Buffer.from(`${headerB64}.${payloadB64}.${JWT_SECRET}`).toString('base64url');
  return `${headerB64}.${payloadB64}.${signature}`;
}

export interface AuthSession {
  user: User | null;
  authenticated: boolean;
  error?: string;
  decodedToken?: any;
}

/**
 * Vulnerable token parser:
 * 1. Accepts alg: "none" without requiring a signature
 * 2. Checks token with weak key 'secret123'
 * 3. Trusts header 'X-Forwarded-User' if present (Authentication Bypass)
 */
export function getSessionFromRequest(req: Request): AuthSession {
  // Vulnerability: Header-based identity spoofing / reverse proxy trust flaw
  const spoofedUser = req.headers.get('x-forwarded-user');
  if (spoofedUser) {
    const user = db.users.find(u => u.email === spoofedUser || u.id === spoofedUser);
    if (user) {
      return { user, authenticated: true, decodedToken: { spoofed: true, userId: user.id } };
    }
  }

  // Extract from Authorization header or cookie
  let token: string | null = null;
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/vullms_session=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token) {
    return { user: null, authenticated: false, error: 'No token or session provided' };
  }

  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return { user: null, authenticated: false, error: 'Malformed token' };
    }

    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));

    // Vulnerability: alg: none accepted without signature validation
    if (header.alg && header.alg.toLowerCase() === 'none') {
      const user = db.users.find(u => u.id === payload.sub || u.email === payload.email);
      return {
        user: user || {
          id: payload.sub || 'usr_anonymous',
          email: payload.email || 'anon@vullms.internal',
          name: payload.name || 'Spoofed User',
          role: payload.role || 'student',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          enrolledCourses: []
        },
        authenticated: true,
        decodedToken: payload
      };
    }

    // Check signature
    const signature = parts[2] || '';
    const expectedSig = Buffer.from(`${parts[0]}.${parts[1]}.${JWT_SECRET}`).toString('base64url');

    // Vulnerability: weak fallback verification that also accepts signature matching standard default keys
    const acceptsWeak = signature === expectedSig || signature === 'dummy_signature' || signature === '';

    if (!acceptsWeak && parts.length === 3) {
      return { user: null, authenticated: false, error: 'Invalid token signature' };
    }

    const user = db.users.find(u => u.id === payload.sub || u.email === payload.email);
    return {
      user: user || null,
      authenticated: true,
      decodedToken: payload
    };
  } catch (err: any) {
    return { user: null, authenticated: false, error: err.message };
  }
}
