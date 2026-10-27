'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, ShieldAlert, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { Course } from '@/lib/types';

function CoursesContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchCourses = async (searchVal: string, cat: string) => {
    setLoading(true);
    try {
      const url = `/api/courses/search?q=${encodeURIComponent(searchVal)}&category=${encodeURIComponent(cat)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.results) {
        setCourses(data.results);
        setDebugInfo(data.debug);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(query, activeCategory);
  }, [activeCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses(query, activeCategory);
  };

  const injectSqli = () => {
    const payload = "' OR '1'='1";
    setQuery(payload);
    fetchCourses(payload, activeCategory);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '8px' }}>
          Course Directory & Curriculum
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Browse available masterclasses or query internal course catalogs.
        </p>
      </div>

      {/* Reflected Parameter Banner (Reflected XSS demo if HTML is passed) */}
      {query && (
        <div className="glass" style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          borderLeft: '4px solid var(--accent-cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Query: </span>
            {/* Vulnerability: Unsanitized HTML rendering for reflected search string */}
            <span
              style={{ fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}
              dangerouslySetInnerHTML={{ __html: query }}
            />
          </div>
          <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
            Reflected Input Vector Active
          </span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="glass" style={{
        padding: '20px',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, keywords, or raw query filter..."
              style={{
                width: '100%',
                padding: '12px 16px 12px 42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.95rem'
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search Directory
          </button>
          <button
            type="button"
            onClick={injectSqli}
            className="btn btn-danger"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldAlert size={14} />
            Test SQLi: &apos; OR &apos;1&apos;=&apos;1
          </button>
        </form>

        {/* Categories */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Cloud Engineering', 'Cybersecurity', 'Artificial Intelligence'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: activeCategory === cat ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                color: activeCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Debug raw SQL output */}
        {debugInfo && (
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
              Simulated Backend Query Evaluation:
            </div>
            <code style={{ color: debugInfo.injectedBypassDetected ? '#fda4af' : '#67e8f9' }}>
              {debugInfo.simulatedRawQuery}
            </code>
            {debugInfo.injectedBypassDetected && (
              <div style={{ color: '#fda4af', marginTop: '6px', fontWeight: 600 }}>
                ⚠️ SQL Injection Bypass Confirmed: Unlisted confidential courses retrieved!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading courses catalog...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {courses.map(course => (
            <div
              key={course.id}
              className="glass"
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: course.isDraft ? '2px dashed #f43f5e' : '1px solid var(--border-subtle)',
                background: course.isDraft ? 'rgba(244, 63, 94, 0.08)' : 'var(--bg-card)'
              }}
            >
              <div style={{
                height: '160px',
                backgroundImage: `url(${course.thumbnail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <span className="badge badge-info">{course.category}</span>
                {course.isDraft ? (
                  <span className="badge badge-vuln">⚠️ UNPUBLISHED DRAFT LEAKED</span>
                ) : (
                  <span className="badge badge-success">{course.level}</span>
                )}
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: course.isDraft ? '#fda4af' : '#ffffff' }}>
                    {course.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>
                    {course.description}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Instructor: <strong style={{ color: 'var(--text-primary)' }}>{course.instructorName}</strong>
                  </div>
                  <Link href={`/courses/${course.id}`} className="btn btn-primary" style={{ width: '100%', fontSize: '0.9rem' }}>
                    {course.isDraft ? 'Inspect Leaked Draft' : 'Enter Course'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading catalog...</div>}>
      <CoursesContent />
    </Suspense>
  );
}
