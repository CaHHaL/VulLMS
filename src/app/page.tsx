'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Terminal, 
  BookOpen, 
  Users, 
  Award, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Lock, 
  FileCode, 
  Database,
  ExternalLink
} from 'lucide-react';
import { Course } from '@/lib/types';

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        if (data.courses) setCourses(data.courses);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const vulnHighlights = [
    {
      category: 'OWASP A01: Broken Access Control',
      title: 'BOLA / IDOR Grade & Profile Disclosure',
      endpoint: '/api/students/[id]/grades',
      desc: 'Retrieve confidential grade rubrics, student SSN, and faculty notes for any arbitrary user identifier.',
      link: '/dashboard'
    },
    {
      category: 'OWASP A03: Injection',
      title: 'Dynamic SQL / Query Concatenation',
      endpoint: "/api/courses/search?q=' OR '1'='1",
      desc: 'Bypass course visibility checks to extract unlisted internal exams and secret faculty rubrics.',
      link: '/courses?q=%27%20OR%20%271%27=%271'
    },
    {
      category: 'OWASP A10: SSRF',
      title: 'Server-Side Request Forgery',
      endpoint: '/api/courses/import-media',
      desc: 'Fetch loopback addresses and simulated cloud metadata (AWS IMDSv1 169.254.169.254) without IP filtering.',
      link: '/security-docs#ssrf'
    },
    {
      category: 'OWASP A03: Stored XSS',
      title: 'Unsanitized Discussion Forums',
      endpoint: '/api/courses/[id]/discussions',
      desc: 'Discussion comments are persisted without HTML encoding and executed in student/instructor browsers.',
      link: '/courses/crs_cloud_101'
    },
    {
      category: 'OWASP A01: Broken Access Control',
      title: 'Mass Assignment Privilege Escalation',
      endpoint: 'PUT /api/users/profile',
      desc: 'Overwrites internal user state, granting root admin status and modifying academic records.',
      link: '/profile'
    },
    {
      category: 'OWASP A05: Security Misconfiguration',
      title: 'System Environment & Key Dump',
      endpoint: '/api/system/debug',
      desc: 'Leaking database credentials, plaintext password hashes, AWS keys, and permissive CORS origins.',
      link: '/api/system/debug'
    }
  ];

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '60px 20px',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '6px 16px',
          borderRadius: '9999px',
          fontSize: '0.85rem',
          color: '#a5b4fc',
          marginBottom: '24px'
        }}>
          <Zap size={14} color="#67e8f9" />
          <span>Automated Bug Bounty Engine Benchmark Testbed</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          marginBottom: '20px',
          background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 60%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          VulLMS — The Enterprise Security Testing LMS
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '750px',
          margin: '0 auto 35px auto',
          lineHeight: 1.6
        }}>
          A realistic Learning Management System engineered with 15+ real-world vulnerabilities covering OWASP Top 10. Designed for automated vulnerability triage engines, web application scanners, and penetration testing benchmarks.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/courses" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <BookOpen size={18} />
            Explore Courses Catalog
          </Link>
          <Link href="/security-docs" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <Terminal size={18} color="var(--accent-cyan)" />
            View Vulnerability Specs & Engine Docs
          </Link>
          <a href="/api/system/debug" target="_blank" className="btn btn-danger" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <Database size={18} />
            Trigger /api/system/debug
          </a>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="glass" style={{
        borderRadius: 'var(--radius-lg)',
        padding: '30px',
        margin: '20px 0 60px 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>15+</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Engineered Vulnerabilities</div>
        </div>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#a855f7' }}>OWASP Top 10</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Full Threat Coverage</div>
        </div>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>4,500+</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Simulated Students Enrolled</div>
        </div>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-amber)' }}>100%</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Vercel Deployable</div>
        </div>
      </section>

      {/* Vulnerabilities Matrix Section */}
      <section style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>
              Vulnerability Triage Quick-Matrix
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Key architectural and implementation vulnerabilities ready for automated engine testing.
            </p>
          </div>
          <Link href="/security-docs" style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            Full Technical Breakdown <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {vulnHighlights.map((v, i) => (
            <div key={i} className="glass" style={{
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}>
              <div>
                <span className="badge badge-vuln" style={{ marginBottom: '12px' }}>
                  {v.category}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: '#ffffff' }}>
                  {v.title}
                </h3>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-cyan)',
                  marginBottom: '12px',
                  wordBreak: 'break-all'
                }}>
                  {v.endpoint}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {v.desc}
                </p>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                <Link href={v.link} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
                  <span>Verify Endpoint</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured LMS Courses */}
      <section style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>
              Academic Course Curriculum
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Official university masterclasses hosted on the VulLMS cluster.
            </p>
          </div>
          <Link href="/courses" style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            View All Courses <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {courses.map(course => (
            <div key={course.id} className="glass" style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease',
            }}>
              <div style={{
                height: '180px',
                backgroundImage: `url(${course.thumbnail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}>
                <span className="badge badge-info">{course.category}</span>
                <span className="badge badge-success">{course.level}</span>
              </div>

              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                    {course.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>
                    {course.description}
                  </p>
                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginBottom: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    <span>Instructor: <strong style={{ color: 'var(--text-primary)' }}>{course.instructorName}</strong></span>
                    <span>{course.duration}</span>
                  </div>

                  <Link href={`/courses/${course.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                    View Course & Discussions
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
