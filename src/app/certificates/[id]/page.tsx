'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, ShieldAlert, CheckCircle, ExternalLink, Download, ArrowLeft } from 'lucide-react';
import { Certificate } from '@/lib/types';

export default function CertificatePage({ params }: { params: { id: string } }) {
  const certId = params.id;
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetCertId, setTargetCertId] = useState(certId);

  const fetchCert = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/certificates/${id}`);
      const data = await res.json();
      if (data.certificate) {
        setCert(data.certificate);
      } else {
        setCert(null);
      }
    } catch (e) {
      console.error(e);
      setCert(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCert(certId);
  }, [certId]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Top Bar with IDOR Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <Link href="/dashboard" className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* IDOR Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enumerate Cert ID:</span>
          <button
            onClick={() => { setTargetCertId('cert_1001'); fetchCert('cert_1001'); }}
            className={`btn btn-sm ${targetCertId === 'cert_1001' ? 'btn-primary' : 'btn-secondary'}`}
          >
            cert_1001 (Alice)
          </button>
          <button
            onClick={() => { setTargetCertId('cert_1002'); fetchCert('cert_1002'); }}
            className={`btn btn-sm ${targetCertId === 'cert_1002' ? 'btn-danger' : 'btn-secondary'}`}
          >
            cert_1002 (Charlie)
          </button>
        </div>
      </div>

      {/* IDOR Vulnerability Alert */}
      <div className="glass" style={{
        padding: '14px 20px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '32px',
        borderLeft: '4px solid #f43f5e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={18} color="#fda4af" />
          <span style={{ fontSize: '0.85rem', color: '#fda4af' }}>
            <strong>IDOR Enumeration Active:</strong> Certificate endpoints lack student identity validation. Sequential IDs (<code style={{ color: '#ffffff' }}>cert_1001</code>, <code style={{ color: '#ffffff' }}>cert_1002</code>) can be scraped without authorization.
          </span>
        </div>
        <span className="badge badge-vuln">API1 / A01</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          Retrieving academic certificate...
        </div>
      ) : !cert ? (
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <h2>Certificate Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>No certificate matches ID {targetCertId}</p>
        </div>
      ) : (
        /* Certificate Document Design */
        <div style={{
          background: 'linear-gradient(135deg, #0b1120 0%, #0f172a 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '60px 40px',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          boxShadow: '0 0 50px rgba(245, 158, 11, 0.15)',
          position: 'relative',
          textAlign: 'center',
          overflow: 'hidden'
        }}>
          {/* Subtle watermark background */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.03,
            pointerEvents: 'none'
          }}>
            <Award size={400} color="#f59e0b" />
          </div>

          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', marginBottom: '20px' }}>
            <Award size={48} color="#f59e0b" />
          </div>

          <div style={{ fontSize: '0.85rem', letterSpacing: '0.25em', color: 'var(--accent-amber)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
            VulLMS Institute of Advanced Cyber Engineering
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Certificate of Academic Excellence
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '24px' }}>
            This officially certifies that the student below has satisfied all technical requirements and examinations for:
          </p>

          <div style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: 'var(--accent-cyan)',
            marginBottom: '16px',
            textDecoration: 'underline',
            textUnderlineOffset: '8px'
          }}>
            {cert.studentName}
          </div>

          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
            {cert.courseTitle}
          </div>

          <div style={{
            display: 'inline-block',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '6px 16px',
            borderRadius: '9999px',
            color: '#6ee7b7',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: '36px'
          }}>
            Honors Standing: {cert.gradeAchieved}
          </div>

          {/* Signatures & Hash */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '30px',
            flexWrap: 'wrap',
            gap: '20px',
            textAlign: 'left'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AUTHORIZED INSTRUCTOR</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{cert.instructorName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Department Chair</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CERTIFICATE NUMBER</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                {cert.certificateNumber}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Issued: {cert.issueDate}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CRYPTOGRAPHIC CHECKSUM</div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {cert.verificationHash}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
