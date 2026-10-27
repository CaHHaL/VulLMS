'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Terminal, 
  AlertTriangle, 
  FileText, 
  ExternalLink, 
  Copy, 
  Check, 
  Code2, 
  Layers, 
  Lock, 
  Database, 
  Globe 
} from 'lucide-react';

interface VulnDoc {
  id: string;
  category: string;
  owasp: string;
  cwe: string;
  severity: 'Critical' | 'High' | 'Medium';
  title: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  vectorParam: string;
  rootCause: string;
  verificationLogic: string;
  expectedTriageSignal: string;
  remediation: string;
}

const VULNERABILITY_SPECS: VulnDoc[] = [
  {
    id: 'BOLA-01',
    category: 'Broken Access Control',
    owasp: 'A01:2021 - Broken Access Control / API1:2023',
    cwe: 'CWE-639: Authorization Bypass Through User-Controlled Key',
    severity: 'High',
    title: 'BOLA / IDOR Student Grades Exposure',
    endpoint: '/api/students/[id]/grades',
    method: 'GET',
    vectorParam: 'Path parameter [id]',
    rootCause: 'The route handler retrieves grade records directly using the requested URL path parameter without comparing the session user ID against the target resource owner.',
    verificationLogic: 'Authenticate as student `usr_stu_102` (Bob) and issue a GET request to `/api/students/usr_stu_101/grades`. If the server returns HTTP 200 with Alice\'s grade records and feedback, BOLA is confirmed.',
    expectedTriageSignal: 'HTTP 200 containing other student\'s academic records; `accessAudit.idorVulnerabilityTriggered: true`.',
    remediation: 'Implement contextual authorization checks: verify `session.user.id === requestedId` or require administrative/instructor roles before querying resource records.'
  },
  {
    id: 'BOLA-02',
    category: 'Broken Access Control',
    owasp: 'A01:2021 - Broken Access Control',
    cwe: 'CWE-200: Exposure of Sensitive Information',
    severity: 'High',
    title: 'BOLA Sensitive PII & Confidential Faculty Notes Leak',
    endpoint: '/api/students/[id]/profile',
    method: 'GET',
    vectorParam: 'Path parameter [id]',
    rootCause: 'Profile endpoint allows arbitrary callers to request any user ID, returning confidential fields including phone numbers, SSN last 4 digits, and internal faculty remarks without permission verification.',
    verificationLogic: 'Issue request to `/api/students/usr_stu_101/profile` as unprivileged user. Observe inclusion of `ssn_last4` and `private_notes`.',
    expectedTriageSignal: 'Presence of `ssn_last4` and `private_notes` fields in JSON response payload.',
    remediation: 'Filter outgoing DTOs using schema whitelists and enforce strict object-level ownership checks.'
  },
  {
    id: 'BOLA-03',
    category: 'Broken Access Control',
    owasp: 'A01:2021 - Broken Access Control',
    cwe: 'CWE-285: Improper Authorization',
    severity: 'Critical',
    title: 'BOLA Unauthorized Grade Modification (Write Vector)',
    endpoint: '/api/grades/[id]',
    method: 'PUT',
    vectorParam: 'Path parameter [id], JSON body { score, grade }',
    rootCause: 'The grade modification endpoint fails to verify if the caller has the `instructor` or `admin` role or is assigned to the course. Any user can alter grade scores.',
    verificationLogic: 'Send PUT to `/api/grades/grd_8003` with payload `{"score": 100, "grade": "A+"}`. Check if response returns `success: true` and updated record.',
    expectedTriageSignal: 'HTTP 200 confirming modification without requiring instructor credentials.',
    remediation: 'Verify caller permissions (`req.user.role === "instructor"` and caller teaches the specific course module) before applying database updates.'
  },
  {
    id: 'IDOR-04',
    category: 'Broken Access Control',
    owasp: 'A01:2021 - Broken Access Control / API1:2023',
    cwe: 'CWE-639: Insecure Direct Object Reference',
    severity: 'Medium',
    title: 'Sequential IDOR Academic Certificate Enumeration',
    endpoint: '/api/certificates/[id]',
    method: 'GET',
    vectorParam: 'Path parameter [id] (e.g., cert_1001, cert_1002)',
    rootCause: 'Uses sequential, predictable identifiers (`cert_1001`, `cert_1002`) and returns full certificate details and student identity without ownership checks.',
    verificationLogic: 'Enumerate sequential values from `cert_1001` upwards. If consecutive student records are returned without permission barriers, IDOR exists.',
    expectedTriageSignal: 'Unrestricted certificate data retrieved for multiple distinct student identities.',
    remediation: 'Use cryptographically secure unguessable UUIDv4 identifiers and verify that certificate queries match the active student or public verification tokens.'
  },
  {
    id: 'MASS-05',
    category: 'Broken Access Control',
    owasp: 'A01:2021 - Broken Access Control / API6:2023',
    cwe: 'CWE-915: Improperly Controlled Modification of Dynamically Determined Object Attributes',
    severity: 'Critical',
    title: 'Mass Assignment Privilege Escalation to Root Admin',
    endpoint: '/api/users/profile',
    method: 'PUT',
    vectorParam: 'JSON body properties: role, is_admin, credits',
    rootCause: 'The endpoint deserializes and applies incoming request body directly via `Object.assign` or object spread onto the stored database user entity without field whitelisting.',
    verificationLogic: 'Send PUT request to `/api/users/profile` containing `{"role": "admin", "is_admin": true}`. Check response `user.role` and `privilegeEscalated: true`.',
    expectedTriageSignal: 'Response returns elevated role `admin` and updated permissions.',
    remediation: 'Use strict data transfer objects (DTOs) with input validation (e.g. Zod schemas) that explicitly discard administrative fields like `role` or `is_admin`.'
  },
  {
    id: 'SSRF-06',
    category: 'Server-Side Request Forgery',
    owasp: 'A10:2021 - Server-Side Request Forgery (SSRF)',
    cwe: 'CWE-918: Server-Side Request Forgery',
    severity: 'Critical',
    title: 'Unrestricted SSRF Media Importer (Cloud IMDS & Loopback)',
    endpoint: '/api/courses/import-media',
    method: 'POST',
    vectorParam: 'JSON body: { url: "http://..." }',
    rootCause: 'The server executes an HTTP request to any client-provided URL without validating that the target is an external public IP, allowing requests to internal loopback (`127.0.0.1`) and cloud metadata endpoints (`169.254.169.254`).',
    verificationLogic: 'Submit payload `{"url": "http://169.254.169.254/latest/meta-data/"}`. Check if response reveals cloud instance metadata and IAM credentials.',
    expectedTriageSignal: 'Status 200 containing cloud metadata / IAM security credential keys.',
    remediation: 'Enforce domain whitelisting, validate resolved IP addresses, block private RFC 1918 ranges, loopback (`127.0.0.0/8`), and link-local cloud metadata addresses (`169.254.169.254`).'
  },
  {
    id: 'XSS-07',
    category: 'Injection',
    owasp: 'A03:2021 - Injection (Cross-Site Scripting)',
    cwe: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
    severity: 'High',
    title: 'Stored Cross-Site Scripting in Course Discussions',
    endpoint: '/api/courses/[id]/discussions',
    method: 'POST',
    vectorParam: 'JSON body: { content: "..." }',
    rootCause: 'Comment content is stored without sanitization or HTML encoding in the database, and the frontend renders it directly using `dangerouslySetInnerHTML`.',
    verificationLogic: 'Post a comment containing HTML markup (such as `<img src=x onerror=...>` or styled tags). Inspect response and browser DOM sink rendering.',
    expectedTriageSignal: 'Raw unescaped HTML elements present in API response and rendered into DOM sink.',
    remediation: 'Sanitize input using a robust HTML sanitizer (such as DOMPurify) and escape output variables by default in React JSX without using raw HTML injection.'
  },
  {
    id: 'SQLI-08',
    category: 'Injection',
    owasp: 'A03:2021 - Injection',
    cwe: 'CWE-89: SQL Injection',
    severity: 'High',
    title: 'Dynamic Query Concatenation Course Directory Bypass',
    endpoint: '/api/courses/search',
    method: 'GET',
    vectorParam: 'Query string: ?q=...',
    rootCause: 'Search terms are concatenated directly into backend query logic. Injecting boolean conditions (such as `\' OR \'1\'=\'1`) bypasses the `is_published = 1` constraint and leaks unpublished internal exams.',
    verificationLogic: 'Query `/api/courses/search?q=\' OR \'1\'=\'1`. Verify that unlisted course `crs_secret_999` with internal pentest exam keys is returned.',
    expectedTriageSignal: 'Return of unpublished course records where `isPublished: false` and `isDraft: true`.',
    remediation: 'Use parameterized queries or ORM query builders (e.g. Prisma / Drizzle) with strongly-typed parameter bindings.'
  },
  {
    id: 'TRAV-09',
    category: 'Broken Access Control',
    owasp: 'A01:2021 - Broken Access Control',
    cwe: 'CWE-22: Improper Limitation of a Pathname to a Restricted Directory',
    severity: 'High',
    title: 'Path Traversal / Arbitrary File Disclosure in Course Materials',
    endpoint: '/api/materials/download',
    method: 'GET',
    vectorParam: 'Query string: ?file=...',
    rootCause: 'The handler resolves file paths with `path.join(baseDir, fileName)` without verifying that the resolved path stays within the base directory boundary, allowing directory traversal sequences (`../`).',
    verificationLogic: 'Query `/api/materials/download?file=../../package.json` or `?file=secret-faculty-memo.txt`. Observe file contents returned.',
    expectedTriageSignal: 'HTTP 200 returning server configuration or confidential file outside the public materials folder.',
    remediation: 'Canonicalize paths using `path.resolve` and verify `resolvedPath.startsWith(allowedBaseDirectory)` before accessing the filesystem.'
  },
  {
    id: 'MISC-10',
    category: 'Security Misconfiguration',
    owasp: 'A05:2021 - Security Misconfiguration',
    cwe: 'CWE-200: Information Disclosure',
    severity: 'High',
    title: 'Debug Endpoint Sensitive Environment & Credentials Exposure',
    endpoint: '/api/system/debug',
    method: 'GET',
    vectorParam: 'Direct endpoint access',
    rootCause: 'Diagnostic route left exposed in production environment, leaking database connection strings, JWT signing keys, AWS credentials, and user password hashes.',
    verificationLogic: 'Send GET request to `/api/system/debug`. Verify inclusion of `secretsExposure` object containing database connection URIs.',
    expectedTriageSignal: 'HTTP 200 with JSON payload containing credentials, database URLs, and server internals.',
    remediation: 'Disable debug endpoints in production builds and restrict diagnostic information to authenticated superusers via secured administrative VPCs.'
  },
  {
    id: 'AUTH-11',
    category: 'Authentication Failures',
    owasp: 'A07:2021 - Identification and Authentication Failures',
    cwe: 'CWE-347: Improper Verification of Cryptographic Signature',
    severity: 'Critical',
    title: 'Insecure JWT Signature Verification (alg: "none" & Weak Secret)',
    endpoint: '/api/auth/token & /api/auth/verify',
    method: 'POST / GET',
    vectorParam: 'Authorization header: Bearer <token>',
    rootCause: 'The JWT verification function accepts tokens specifying `alg: "none"` without verifying cryptographic signatures, and falls back to a weak static key (`secret123`).',
    verificationLogic: 'Craft an unsigned JWT with header `{"alg":"none"}` and payload `{"sub":"usr_admin_01","role":"admin"}`. Pass token to authenticated endpoints and verify acceptance.',
    expectedTriageSignal: 'Authentication succeeds and treats session as root admin.',
    remediation: 'Reject unsigned tokens or algorithms other than verified asymmetric (e.g. RS256/EdDSA) algorithms, and enforce strong, randomly generated keys stored in secrets managers.'
  },
  {
    id: 'CSRF-12',
    category: 'Broken Access Control',
    owasp: 'A01:2021 - Broken Access Control',
    cwe: 'CWE-352: Cross-Site Request Forgery (CSRF)',
    severity: 'Medium',
    title: 'CSRF on Critical State Change (Email Update)',
    endpoint: '/api/users/email',
    method: 'POST / GET',
    vectorParam: 'Body or Query: email=...',
    rootCause: 'The email update endpoint performs state modifications via POST and GET without validating Anti-CSRF tokens or checking `Origin` / `Referer` headers, relying solely on ambient browser cookies.',
    verificationLogic: 'Submit a cross-origin form or GET link targeting `/api/users/email?email=hijacked@attacker.com`. If email updates successfully, CSRF is confirmed.',
    expectedTriageSignal: 'Email address modified without anti-CSRF token verification.',
    remediation: 'Implement Anti-CSRF tokens (Double Submit Cookie or Synchronizer Token Pattern) and configure cookies with `SameSite=Strict`.'
  },
  {
    id: 'CORS-13',
    category: 'Security Misconfiguration',
    owasp: 'A05:2021 - Security Misconfiguration',
    cwe: 'CWE-942: Permissive Cross-Domain Policy with Credential Inclusion',
    severity: 'Medium',
    title: 'Insecure CORS Policy Reflecting Arbitrary Origin with Credentials',
    endpoint: '/api/system/debug',
    method: 'GET',
    vectorParam: 'Request Header: Origin: https://attacker.example.com',
    rootCause: 'Server reflects arbitrary incoming `Origin` headers into `Access-Control-Allow-Origin` while simultaneously setting `Access-Control-Allow-Credentials: true`.',
    verificationLogic: 'Send request with header `Origin: https://evil.com`. Inspect response headers for `Access-Control-Allow-Origin: https://evil.com` and `Access-Control-Allow-Credentials: true`.',
    expectedTriageSignal: 'Header combination allowing cross-origin credentialed reads.',
    remediation: 'Whitelist trusted domains explicitly instead of reflecting arbitrary origins with credential support.'
  },
  {
    id: 'RATE-14',
    category: 'Authentication Failures',
    owasp: 'A07:2021 - Identification and Authentication Failures',
    cwe: 'CWE-307: Improper Restriction of Excessive Authentication Attempts',
    severity: 'Medium',
    title: 'Missing Rate Limiting & User Enumeration on Login',
    endpoint: '/api/auth/login',
    method: 'POST',
    vectorParam: 'JSON body: { email, password }',
    rootCause: 'Login endpoint lacks rate-limiting mechanisms and returns distinct error messages for non-existent accounts versus incorrect passwords, enabling automated user enumeration.',
    verificationLogic: 'Submit invalid requests with non-existent email vs valid email. Observe `ACCOUNT_NOT_FOUND` vs `INVALID_PASSWORD` error codes.',
    expectedTriageSignal: 'Differentiated error messages and absence of rate-limit throttling (HTTP 429).',
    remediation: 'Return generic error messages (e.g., "Invalid email or password") and implement exponential backoff or token-bucket rate limiting.'
  },
  {
    id: 'PROTO-15',
    category: 'Software and Data Integrity Failures',
    owasp: 'A08:2021 - Software and Data Integrity Failures',
    cwe: 'CWE-1321: Improperly Controlled Modification of Object Prototype Attributes',
    severity: 'High',
    title: 'Server-Side Prototype Pollution in Evaluation Matrix',
    endpoint: '/api/system/eval-settings',
    method: 'POST',
    vectorParam: 'JSON body with __proto__ key',
    rootCause: 'A recursive deep-merge utility processes incoming JSON without blocking keys like `__proto__`, `constructor`, or `prototype`, thereby mutating `Object.prototype` globally.',
    verificationLogic: 'Send payload `{"__proto__": {"isAdmin": true}}`. Verify that newly created objects on the server inherit the injected property.',
    expectedTriageSignal: 'Response returns `prototypePollutionDetected: true` and altered global prototype.',
    remediation: 'Use `Object.create(null)` for key-value maps, freeze prototypes using `Object.freeze(Object.prototype)`, or filter dangerous keys during object traversal.'
  }
];

export default function SecurityDocsPage() {
  const [selectedVuln, setSelectedVuln] = useState<VulnDoc>(VULNERABILITY_SPECS[0]);
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = VULNERABILITY_SPECS.filter(v => {
    if (filterSeverity === 'All') return true;
    return v.severity === filterSeverity;
  });

  const handleCopyEndpoint = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge badge-info">AUTOMATED TRIAGE SPECIFICATION</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>VulLMS Security Reference v1.0</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>
          Vulnerability Catalog & Engine Verification Guide
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '850px' }}>
          Complete technical specification of all 15 intentional security flaws implemented in VulLMS. Formatted for automated bug bounty triage engines, scanner rule development, and penetration testing benchmarks.
        </p>
      </div>

      {/* Severity Filter Bar */}
      <div className="glass" style={{
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter Severity:</span>
          {['All', 'Critical', 'High', 'Medium'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: filterSeverity === sev ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                color: filterSeverity === sev ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {sev}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filtered.length}</strong> of 15 Vulnerabilities
        </div>
      </div>

      {/* Two Column Layout: Index List on Left, Detailed Inspector on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.9fr)', gap: '28px' }}>
        {/* Left Column: Vulnerability Selector List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '800px', overflowY: 'auto' }}>
          {filtered.map(v => (
            <div
              key={v.id}
              onClick={() => setSelectedVuln(v)}
              className="glass"
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                borderLeft: selectedVuln.id === v.id ? '4px solid var(--accent-cyan)' : '4px solid transparent',
                background: selectedVuln.id === v.id ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{v.id}</span>
                <span className={`badge ${v.severity === 'Critical' ? 'badge-vuln' : v.severity === 'High' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                  {v.severity.toUpperCase()}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', marginBottom: '4px' }}>
                {v.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {v.method} {v.endpoint}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Deep Technical Inspector Card */}
        <div>
          {selectedVuln && (
            <div className="glass-elevated" style={{ borderRadius: 'var(--radius-lg)', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge badge-info">{selectedVuln.id}</span>
                    <span className={`badge ${selectedVuln.severity === 'Critical' ? 'badge-vuln' : selectedVuln.severity === 'High' ? 'badge-warning' : 'badge-info'}`}>
                      {selectedVuln.severity} Severity
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedVuln.owasp}</span>
                  </div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                    {selectedVuln.title}
                  </h2>
                </div>

                <button
                  onClick={() => handleCopyEndpoint(`${selectedVuln.method} ${selectedVuln.endpoint}`, selectedVuln.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                >
                  {copiedId === selectedVuln.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copiedId === selectedVuln.id ? 'Copied' : 'Copy Route'}</span>
                </button>
              </div>

              {/* Endpoint banner */}
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: selectedVuln.method === 'GET' ? 'rgba(6,182,212,0.2)' : selectedVuln.method === 'POST' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                  color: selectedVuln.method === 'GET' ? '#67e8f9' : selectedVuln.method === 'POST' ? '#6ee7b7' : '#fde68a',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {selectedVuln.method}
                </span>
                <code style={{ color: '#ffffff', fontSize: '0.9rem' }}>{selectedVuln.endpoint}</code>
              </div>

              {/* Specification Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Target Parameter & Vector
                  </h3>
                  <div style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '4px' }}>
                    {selectedVuln.vectorParam}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    CWE Classification
                  </h3>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {selectedVuln.cwe}
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Root Cause Analysis
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {selectedVuln.rootCause}
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Verification Logic for Automated Bug Bounty Engine
                  </h3>
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    color: '#e2e8f0'
                  }}>
                    {selectedVuln.verificationLogic}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Expected Triage Engine Signal
                  </h3>
                  <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#fda4af'
                  }}>
                    {selectedVuln.expectedTriageSignal}
                  </div>
                </div>

                <div style={{
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Defensive Remediation / Security Patch
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    {selectedVuln.remediation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
