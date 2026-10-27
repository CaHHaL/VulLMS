'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldAlert, 
  Key, 
  Mail, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  Terminal, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { User as UserType } from '@/lib/types';

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [massAssignPayload, setMassAssignPayload] = useState('{"role": "admin", "is_admin": true, "credits": 9999}');
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [jwtStatus, setJwtStatus] = useState<string | null>(null);
  const [forgedToken, setForgedToken] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/users/profile')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setUser(d.user);
          setName(d.user.name);
          setBio(d.user.bio || '');
          setEmail(d.user.email);
        }
      });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent, injectPrivilege: boolean = false) => {
    e.preventDefault();
    setUpdateStatus('Updating profile...');

    let bodyData: any = { name, bio };

    if (injectPrivilege) {
      try {
        const parsed = JSON.parse(massAssignPayload);
        bodyData = { ...bodyData, ...parsed };
      } catch (e) {
        setUpdateStatus('Invalid JSON in mass assignment payload');
        return;
      }
    }

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        if (data.privilegeEscalated) {
          setUpdateStatus('🚨 PRIVILEGE ESCALATION SUCCESSFUL! User role elevated to: ADMIN');
          localStorage.setItem('vullms_role', 'admin');
        } else {
          setUpdateStatus('Profile updated successfully.');
        }
      }
    } catch (err: any) {
      setUpdateStatus(`Error: ${err.message}`);
    }
  };

  const handleCsrfEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus('Submitting email update...');
    try {
      const res = await fetch('/api/users/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail })
      });
      const data = await res.json();
      if (data.success) {
        setEmail(newEmail);
        setEmailStatus(`Email updated to ${newEmail} without CSRF token verification!`);
      } else {
        setEmailStatus(`Failed: ${data.error}`);
      }
    } catch (err: any) {
      setEmailStatus(`Error: ${err.message}`);
    }
  };

  const handleGenerateAlgNoneJwt = async () => {
    setJwtStatus('Generating alg:none token...');
    try {
      const res = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'usr_stu_102',
          algorithm: 'none',
          customRole: 'admin'
        })
      });
      const data = await res.json();
      if (data.token) {
        setForgedToken(data.token);
        setJwtStatus('Generated unsigned JWT with alg: "none" and role: "admin"');
      }
    } catch (e: any) {
      setJwtStatus(`Error: ${e.message}`);
    }
  };

  if (!user) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading account profile...</div>;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '6px' }}>
          User Account & Security Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your student credentials, communication preferences, and authentication keys.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1.2fr)', gap: '32px' }}>
        {/* Left Column: Profile Editor & Mass Assignment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={20} color="var(--accent-cyan)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Profile Details</h2>
              </div>
              <span className={`badge ${user.role === 'admin' ? 'badge-vuln' : 'badge-info'}`}>
                Role: {user.role.toUpperCase()}
              </span>
            </div>

            <form onSubmit={(e) => handleUpdateProfile(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Biography
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-secondary">
                  Save Standard Profile
                </button>
              </div>
            </form>

            {/* Mass Assignment Injection Lab */}
            <div style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge badge-vuln">Vulnerability: Mass Assignment</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PUT /api/users/profile</span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                The update handler executes <code style={{ color: 'var(--accent-cyan)' }}>Object.assign(user, req.body)</code>. You can inject privileged fields:
              </p>

              <textarea
                value={massAssignPayload}
                onChange={(e) => setMassAssignPayload(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-active)',
                  color: '#67e8f9',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  marginBottom: '12px'
                }}
              />

              <button
                type="button"
                onClick={(e) => handleUpdateProfile(e, true)}
                className="btn btn-danger"
                style={{ width: '100%', gap: '8px' }}
              >
                <Zap size={16} />
                Execute Mass Assignment: Escalate to Admin
              </button>

              {updateStatus && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  background: updateStatus.includes('PRIVILEGE') ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.15)',
                  color: updateStatus.includes('PRIVILEGE') ? '#fda4af' : '#6ee7b7',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  {updateStatus}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: CSRF Email Vector & Weak JWT Lab */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* CSRF Email Update Lab */}
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={20} color="var(--accent-cyan)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Email Address</h2>
              </div>
              <span className="badge badge-vuln">Vulnerability: CSRF</span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Current primary email: <strong style={{ color: '#ffffff' }}>{email}</strong>
            </div>

            <form onSubmit={handleCsrfEmailChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address..."
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff'
                }}
              />

              <button type="submit" className="btn btn-secondary">
                Submit Email Change (No Anti-CSRF Token)
              </button>

              <a
                href={`/api/users/email?email=hijacked_${Date.now()}@attacker.com`}
                target="_blank"
                className="btn btn-sm"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#fde68a', border: '1px solid rgba(245,158,11,0.3)', textAlign: 'center' }}
              >
                Test GET-based State Change (/api/users/email?email=...)
              </a>
            </form>

            {emailStatus && (
              <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--accent-emerald)' }}>
                {emailStatus}
              </div>
            )}
          </div>

          {/* Weak JWT / alg: none Lab */}
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Key size={20} color="var(--accent-amber)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>JWT Token Inspector</h2>
              </div>
              <span className="badge badge-vuln">OWASP A07</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              The authentication parser accepts tokens with algorithm set to <code style={{ color: 'var(--accent-cyan)' }}>none</code> or signed with weak key <code style={{ color: 'var(--accent-cyan)' }}>secret123</code>.
            </p>

            <button
              onClick={handleGenerateAlgNoneJwt}
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '14px' }}
            >
              Forge Unsigned JWT (alg: &quot;none&quot;, role: &quot;admin&quot;)
            </button>

            {forgedToken && (
              <div style={{
                background: 'rgba(0,0,0,0.5)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                wordBreak: 'break-all',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: '#67e8f9'
              }}>
                {forgedToken}
              </div>
            )}

            {jwtStatus && (
              <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>
                {jwtStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
