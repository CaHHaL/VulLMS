'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Terminal, 
  Database, 
  AlertTriangle, 
  Server, 
  Users, 
  Key, 
  Zap, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { User as UserType } from '@/lib/types';

export default function AdminPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [protoPayload, setProtoPayload] = useState('{"__proto__": {"isAdmin": true, "polluted": true}}');
  const [protoResult, setProtoResult] = useState<any>(null);
  const [protoLoading, setProtoLoading] = useState(false);

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(d => {
        if (d.users) setUsers(d.users);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleTestPrototypePollution = async () => {
    setProtoLoading(true);
    setProtoResult(null);
    try {
      const parsed = JSON.parse(protoPayload);
      const res = await fetch('/api/system/eval-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      setProtoResult(data);
    } catch (e: any) {
      setProtoResult({ error: e.message });
    } finally {
      setProtoLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Admin Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-vuln">RESTRICTED FACULTY ACCESS</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>VulLMS Control Plane</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>
            Root Administration & System Audit
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Cluster configuration, registered user directory, and engine evaluation vectors.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <a
            href="/api/system/debug"
            target="_blank"
            className="btn btn-danger"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Database size={16} />
            Dump Environment & Secrets (/api/system/debug)
          </a>
        </div>
      </div>

      {/* Security Health & Warning Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>CORS Configuration</span>
            <span className="badge badge-vuln">MISCONFIGURED</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fda4af' }}>
            Origin Reflection + Credentials Allowed
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Access-Control-Allow-Origin mirrors incoming origin with Allow-Credentials: true.
          </div>
        </div>

        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Brute-Force Protection</span>
            <span className="badge badge-warning">DISABLED</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fde68a' }}>
            Rate Limiter: Unenforced on /api/auth/login
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Allows unlimited credential stuffing and username enumeration.
          </div>
        </div>

        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Session Cookies</span>
            <span className="badge badge-info">SAME-SITE: LAX / NO HTTP-ONLY</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#67e8f9' }}>
            Cookie vullms_session Script-Readable
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Exposed to XSS token exfiltration scripts.
          </div>
        </div>
      </div>

      {/* Grid: User Directory + Prototype Pollution Lab */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1.4fr)', gap: '32px' }}>
        {/* User Directory */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--accent-cyan)" />
            Registered LMS Accounts
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Loading users...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {users.map(u => (
                <div key={u.id} style={{
                  padding: '12px 16px',
                  background: 'rgba(0,0,0,0.25)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={u.avatar} alt={u.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email} ({u.id})</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${u.role === 'admin' ? 'badge-vuln' : u.role === 'instructor' ? 'badge-success' : 'badge-info'}`}>
                      {u.role}
                    </span>
                    <a
                      href={`/api/students/${u.id}/profile`}
                      target="_blank"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                    >
                      BOLA Data
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prototype Pollution Evaluation Lab */}
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Prototype Pollution Lab</h3>
            </div>
            <span className="badge badge-vuln">OWASP A08</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Endpoint <code style={{ color: 'var(--accent-cyan)' }}>POST /api/system/eval-settings</code> uses an unsafe recursive deep-merge utility without <code style={{ color: 'var(--accent-cyan)' }}>__proto__</code> or <code style={{ color: 'var(--accent-cyan)' }}>constructor</code> sanitization.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              value={protoPayload}
              onChange={(e) => setProtoPayload(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-active)',
                color: '#67e8f9',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem'
              }}
            />

            <button
              onClick={handleTestPrototypePollution}
              disabled={protoLoading}
              className="btn btn-danger"
              style={{ width: '100%' }}
            >
              {protoLoading ? 'Executing Payload Merge...' : 'Inject Prototype Pollution Payload'}
            </button>

            {protoResult && (
              <div style={{
                marginTop: '12px',
                background: 'rgba(0,0,0,0.6)',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                maxHeight: '220px',
                overflowY: 'auto'
              }}>
                <pre style={{ fontSize: '0.75rem', color: protoResult.prototypePollutionDetected ? '#fda4af' : '#67e8f9', margin: 0 }}>
                  {JSON.stringify(protoResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
