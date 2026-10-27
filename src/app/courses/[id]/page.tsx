'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Download, 
  MessageSquare, 
  Send, 
  ShieldAlert, 
  PlayCircle, 
  CheckCircle, 
  FileText, 
  Globe,
  AlertTriangle,
  Code
} from 'lucide-react';
import { Course, DiscussionPost } from '@/lib/types';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const courseId = params.id;
  const [course, setCourse] = useState<Course | null>(null);
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [ssrfUrl, setSsrfUrl] = useState('http://169.254.169.254/latest/meta-data/');
  const [ssrfResult, setSsrfResult] = useState<any>(null);
  const [ssrfLoading, setSsrfLoading] = useState(false);
  const [traversalFile, setTraversalFile] = useState('secret-faculty-memo.txt');
  const [traversalOutput, setTraversalOutput] = useState<string | null>(null);

  useEffect(() => {
    // Fetch course details & discussions
    Promise.all([
      fetch(`/api/courses/search?q=${courseId}`).then(r => r.json()),
      fetch(`/api/courses/${courseId}/discussions`).then(r => r.json())
    ]).then(([courseData, discData]) => {
      const found = courseData.results?.find((c: Course) => c.id === courseId);
      if (found) setCourse(found);
      if (discData.discussions) setDiscussions(discData.discussions);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [courseId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/courses/${courseId}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });
      const data = await res.json();
      if (data.post) {
        setDiscussions([...discussions, data.post]);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestXss = () => {
    setNewComment(`<div style="background:rgba(244,63,94,0.2);padding:10px;border-radius:6px;border:1px solid #f43f5e;"><strong style="color:#fda4af;">🚨 Stored XSS Execution Proof:</strong><br/><span>Document Cookie Session: </span><code style="color:#67e8f9;">document.cookie = ` + 'vullms_session' + `</code><img src="x" onerror="console.warn('VulLMS Stored XSS Triggered via DOM injection!')" /></div>`);
  };

  const handleSsrfImport = async () => {
    setSsrfLoading(true);
    setSsrfResult(null);
    try {
      const res = await fetch('/api/courses/import-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: ssrfUrl })
      });
      const data = await res.json();
      setSsrfResult(data);
    } catch (e: any) {
      setSsrfResult({ error: e.message });
    } finally {
      setSsrfLoading(false);
    }
  };

  const handleTestTraversal = async () => {
    try {
      const res = await fetch(`/api/materials/download?file=${encodeURIComponent(traversalFile)}`);
      const text = await res.text();
      setTraversalOutput(text);
    } catch (e: any) {
      setTraversalOutput(`Error: ${e.message}`);
    }
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading course...</div>;
  }

  if (!course) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', textAlign: 'center' }}>
        <h2>Course Not Found</h2>
        <Link href="/courses" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Course Banner */}
      <div className="glass" style={{
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        marginBottom: '40px',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{
          height: '240px',
          backgroundImage: `linear-gradient(180deg, rgba(10,13,20,0.4) 0%, rgba(10,13,20,0.95) 100%), url(${course.thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end'
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <span className="badge badge-info">{course.category}</span>
            <span className="badge badge-success">{course.level}</span>
            {course.isDraft && <span className="badge badge-vuln">RESTRICTED DRAFT</span>}
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            {course.title}
          </h1>
          <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span>Instructor: <strong style={{ color: '#ffffff' }}>{course.instructorName}</strong></span>
            <span>Duration: <strong>{course.duration}</strong></span>
            <span>Rating: <strong>★ {course.rating}</strong></span>
          </div>
        </div>

        <div style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '700px', fontSize: '1rem', lineHeight: 1.6 }}>
            {course.description}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="/api/materials/download?file=syllabus-cloud.txt"
              className="btn btn-secondary"
              download
            >
              <Download size={16} />
              Download Syllabus
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Curriculum + Interactive Security Vector Labs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1.4fr)', gap: '32px' }}>
        {/* Left Column: Modules & Video Player */}
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="var(--accent-cyan)" />
            Course Curriculum & Lessons
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
            {course.modules && course.modules.length > 0 ? (
              course.modules.map(mod => (
                <div key={mod.id} className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{mod.title}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mod.duration}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {mod.lessons.map(les => (
                      <div key={les.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <PlayCircle size={16} color="var(--accent-cyan)" />
                          <span>{les.title}</span>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{les.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                No public modules published for this course draft.
              </div>
            )}
          </div>

          {/* Interactive Stored XSS Discussion Board */}
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Course Discussion Board</h3>
              </div>
              <span className="badge badge-vuln">Vulnerability: Stored XSS</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Posts are persisted and rendered directly with raw unescaped HTML into the page.
            </p>

            {/* List of comments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {discussions.map(post => (
                <div key={post.id} style={{
                  padding: '16px',
                  background: 'rgba(0,0,0,0.25)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={post.authorAvatar} alt={post.authorName} style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                      <strong style={{ fontSize: '0.9rem' }}>{post.authorName}</strong>
                      <span className={`badge ${post.authorRole === 'instructor' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                        {post.authorRole}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* VULNERABILITY: Stored XSS client-side sink */}
                  <div
                    style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.5 }}
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handlePostComment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ask a question or post commentary (supports HTML formatting)..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleTestXss}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#fda4af', borderColor: 'rgba(244,63,94,0.3)' }}
                >
                  <ShieldAlert size={14} />
                  Inject Stored XSS Payload
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Send size={14} />
                  Post Comment
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Embedded Security Testing Labs (SSRF & Path Traversal) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* SSRF Import Media Lab */}
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border-active)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>SSRF Asset Importer</h3>
              </div>
              <span className="badge badge-vuln">OWASP A10</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Import remote course media previews. Backend fetches the target without loopback or IMDSv1 restrictions:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                value={ssrfUrl}
                onChange={(e) => setSsrfUrl(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setSsrfUrl('http://169.254.169.254/latest/meta-data/')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  AWS Metadata (169.254.169.254)
                </button>
                <button
                  type="button"
                  onClick={() => setSsrfUrl('http://127.0.0.1:8000')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  Loopback (127.0.0.1:8000)
                </button>
              </div>

              <button
                type="button"
                onClick={handleSsrfImport}
                disabled={ssrfLoading}
                className="btn btn-primary"
                style={{ marginTop: '8px', fontSize: '0.85rem' }}
              >
                {ssrfLoading ? 'Executing SSRF Fetch...' : 'Send Server-Side Request'}
              </button>
            </div>

            {ssrfResult && (
              <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.6)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', maxHeight: '240px', overflowY: 'auto' }}>
                <pre style={{ fontSize: '0.75rem', color: '#67e8f9', margin: 0 }}>
                  {JSON.stringify(ssrfResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Path Traversal File Reader Lab */}
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--accent-emerald)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Path Traversal Auditor</h3>
              </div>
              <span className="badge badge-vuln">OWASP A01</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Endpoint <code style={{ color: 'var(--accent-cyan)' }}>/api/materials/download?file=...</code> lacks directory traversal sanitization:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                value={traversalFile}
                onChange={(e) => setTraversalFile(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setTraversalFile('secret-faculty-memo.txt')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  Internal Memo
                </button>
                <button
                  type="button"
                  onClick={() => setTraversalFile('../../package.json')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  ../../package.json
                </button>
              </div>

              <button
                type="button"
                onClick={handleTestTraversal}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', borderColor: 'var(--border-active)' }}
              >
                Inspect Resolved File Content
              </button>
            </div>

            {traversalOutput && (
              <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.6)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', maxHeight: '220px', overflowY: 'auto' }}>
                <pre style={{ fontSize: '0.75rem', color: '#a7f3d0', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {traversalOutput}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
