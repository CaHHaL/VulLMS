'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Shield, Award, LayoutDashboard, User, ShieldCheck, Terminal, AlertTriangle } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState('student');
  const [userName, setUserName] = useState('Bob Miller');

  useEffect(() => {
    const savedId = localStorage.getItem('vullms_active_user_id');
    const savedRole = localStorage.getItem('vullms_role');
    if (savedRole) setUserRole(savedRole);
    if (savedId === 'usr_admin_01') setUserName('Eleanor (Admin)');
    else if (savedId === 'usr_inst_02') setUserName('Dr. Marcus (Instructor)');
    else if (savedId === 'usr_stu_101') setUserName('Alice (Student)');
    else setUserName('Bob (Tester)');
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: BookOpen },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { href: '/certificates/cert_1001', label: 'Certificates', icon: Award },
    { href: '/security-docs', label: 'Security Specs', icon: ShieldCheck, badge: '15 Flaws' },
    { href: '/admin', label: 'Admin Portal', icon: Shield, adminOnly: true },
  ];

  return (
    <header className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 900,
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        {/* Brand Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)'
          }}>
            <Shield size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                Vul<span style={{ color: 'var(--accent-cyan)' }}>LMS</span>
              </span>
              <span className="badge badge-vuln" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>
                AUDIT LAB
              </span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1 }}>
              Next-Gen Learning Platform
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} color={isActive ? 'var(--accent-cyan)' : 'currentColor'} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right user & profile bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/profile"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <User size={15} />
            <span>{userName}</span>
            <span className={`badge ${userRole === 'admin' ? 'badge-vuln' : userRole === 'instructor' ? 'badge-success' : 'badge-info'}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
              {userRole}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
