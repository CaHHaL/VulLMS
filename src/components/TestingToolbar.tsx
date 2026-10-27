'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, UserCheck, Key, Terminal, ExternalLink, RefreshCw } from 'lucide-react';

const TEST_PERSONAS = [
  {
    id: 'usr_stu_102',
    name: 'Bob Miller (Attacker/Tester)',
    role: 'student',
    email: 'bob@student.edu',
    color: '#f59e0b',
    label: 'Student (Attacker Persona)'
  },
  {
    id: 'usr_stu_101',
    name: 'Alice Sterling (Victim Student)',
    role: 'student',
    email: 'alice@student.edu',
    color: '#06b6d4',
    label: 'Student (Victim Account)'
  },
  {
    id: 'usr_inst_02',
    name: 'Dr. Marcus Vance (Instructor)',
    role: 'instructor',
    email: 'marcus.vance@vullms.internal',
    color: '#10b981',
    label: 'Instructor'
  },
  {
    id: 'usr_admin_01',
    name: 'Eleanor Vance (Admin)',
    role: 'admin',
    email: 'admin@vullms.internal',
    color: '#f43f5e',
    label: 'Root Admin'
  }
];

export default function TestingToolbar() {
  const [activePersona, setActivePersona] = useState(TEST_PERSONAS[0]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('vullms_active_user_id');
    if (saved) {
      const match = TEST_PERSONAS.find(p => p.id === saved);
      if (match) setActivePersona(match);
    }
  }, []);

  const switchPersona = async (persona: typeof TEST_PERSONAS[0]) => {
    setActivePersona(persona);
    localStorage.setItem('vullms_active_user_id', persona.id);
    localStorage.setItem('vullms_role', persona.role);

    // Call token API to refresh cookie session
    try {
      const res = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: persona.id, customRole: persona.role })
      });
      const data = await res.json();
      if (data.token) {
        document.cookie = `vullms_session=${data.token}; path=/; max-age=86400`;
        document.cookie = `vullms_role=${persona.role}; path=/; max-age=86400`;
      }
    } catch (e) {
      console.error(e);
    }

    // Refresh page to sync server and client state
    window.location.reload();
  };

  return (
    <div style={{
      background: 'linear-gradient(90deg, #180d2b 0%, #0d172b 50%, #1a162b 100%)',
      borderBottom: '1px solid rgba(168, 85, 247, 0.3)',
      padding: '8px 16px',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px',
      zIndex: 1000,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(168, 85, 247, 0.25)',
          color: '#d8b4fe',
          padding: '2px 8px',
          borderRadius: '4px',
          fontWeight: 700,
          letterSpacing: '0.05em'
        }}>
          <ShieldAlert size={13} />
          BUG BOUNTY TESTBENCH ACTIVE
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Active Persona: <strong style={{ color: activePersona.color }}>{activePersona.name}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-muted)' }}>Switch Persona:</span>
        {TEST_PERSONAS.map(p => (
          <button
            key={p.id}
            onClick={() => switchPersona(p)}
            style={{
              padding: '3px 8px',
              fontSize: '0.75rem',
              borderRadius: '4px',
              background: activePersona.id === p.id ? p.color : 'rgba(255,255,255,0.06)',
              color: activePersona.id === p.id ? '#000000' : '#e2e8f0',
              fontWeight: activePersona.id === p.id ? 700 : 500,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {p.name.split(' ')[0]} ({p.role})
          </button>
        ))}

        <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

        <a
          href="/security-docs"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#67e8f9',
            background: 'rgba(6, 182, 212, 0.15)',
            padding: '3px 8px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          <Terminal size={12} />
          Vulnerability Catalog
        </a>
      </div>
    </div>
  );
}
