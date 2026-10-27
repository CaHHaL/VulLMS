'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Award, 
  BookOpen, 
  ShieldAlert, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  User, 
  Edit3,
  ExternalLink
} from 'lucide-react';
import { GradeRecord, User as UserType } from '@/lib/types';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [targetStudentId, setTargetStudentId] = useState('usr_stu_102');
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [bolaAlert, setBolaAlert] = useState<any>(null);
  const [gradeEditModal, setGradeEditModal] = useState<GradeRecord | null>(null);
  const [newScore, setNewScore] = useState(100);
  const [newGradeLetter, setNewGradeLetter] = useState('A+');
  const [updateMsg, setUpdateMsg] = useState('');

  const loadStudentData = async (studentId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${studentId}/grades`);
      const data = await res.json();
      if (data.grades) {
        setGrades(data.grades);
        setBolaAlert(data.accessAudit);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedId = localStorage.getItem('vullms_active_user_id') || 'usr_stu_102';
    setTargetStudentId(savedId);

    // Fetch user profile
    fetch('/api/users/profile')
      .then(r => r.json())
      .then(d => {
        if (d.user) setCurrentUser(d.user);
      });

    loadStudentData(savedId);
  }, []);

  const handleSwitchTarget = (id: string) => {
    setTargetStudentId(id);
    loadStudentData(id);
  };

  const handleUpdateGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeEditModal) return;

    try {
      const res = await fetch(`/api/grades/${gradeEditModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Number(newScore),
          grade: newGradeLetter,
          instructorFeedback: 'Score updated via unauthorized BOLA write vector.'
        })
      });
      const data = await res.json();
      if (data.success) {
        setUpdateMsg(`Grade successfully updated without authorization check!`);
        loadStudentData(targetStudentId);
        setTimeout(() => setGradeEditModal(null), 1500);
      }
    } catch (err: any) {
      setUpdateMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '6px' }}>
            Academic Performance Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Course enrollments, graded submissions, and verified credentials.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/certificates/cert_1001" className="btn btn-secondary">
            <Award size={16} color="var(--accent-amber)" />
            View My Certificate
          </Link>
          <Link href="/profile" className="btn btn-primary">
            <User size={16} />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* BOLA / IDOR Interactive Control Banner */}
      <div className="glass-elevated" style={{
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        marginBottom: '32px',
        borderLeft: '5px solid #f43f5e'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-vuln" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
              OWASP A01 / API1: BOLA / IDOR Active
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Querying endpoint: <code style={{ color: 'var(--accent-cyan)' }}>/api/students/{targetStudentId}/grades</code>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Test Query Target:</span>
            <button
              onClick={() => handleSwitchTarget('usr_stu_102')}
              className={`btn btn-sm ${targetStudentId === 'usr_stu_102' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Bob (Current Tester)
            </button>
            <button
              onClick={() => handleSwitchTarget('usr_stu_101')}
              className={`btn btn-sm ${targetStudentId === 'usr_stu_101' ? 'btn-danger' : 'btn-secondary'}`}
            >
              🚨 Alice (Victim Student)
            </button>
            <button
              onClick={() => handleSwitchTarget('usr_stu_103')}
              className={`btn btn-sm ${targetStudentId === 'usr_stu_103' ? 'btn-danger' : 'btn-secondary'}`}
            >
              Charlie
            </button>
          </div>
        </div>

        {bolaAlert && bolaAlert.idorVulnerabilityTriggered && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            color: '#fda4af',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShieldAlert size={18} />
            <span>
              <strong>BOLA Breach Confirmed:</strong> You are viewing academic grades and confidential faculty feedback for student ID <strong>{targetStudentId}</strong> without permission verification.
            </span>
          </div>
        )}
      </div>

      {/* Academic Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Student Name</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
            {targetStudentId === 'usr_stu_101' ? 'Alice Sterling' : targetStudentId === 'usr_stu_103' ? 'Charlie Zhang' : 'Bob Miller'}
          </div>
        </div>
        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cumulative GPA</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '4px' }}>
            {targetStudentId === 'usr_stu_101' ? '3.94 / 4.0' : targetStudentId === 'usr_stu_103' ? '3.85 / 4.0' : '3.12 / 4.0'}
          </div>
        </div>
        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Graded Submissions</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '4px' }}>
            {grades.length} Recorded
          </div>
        </div>
        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enrolled Courses</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-purple)', marginTop: '4px' }}>
            {targetStudentId === 'usr_stu_101' ? '2 Courses' : '1 Course'}
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCheck size={20} color="var(--accent-cyan)" />
          Graded Assignments & Submissions
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading grades...</div>
        ) : grades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No grades found for this student.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <th style={{ padding: '12px 16px' }}>COURSE</th>
                  <th style={{ padding: '12px 16px' }}>ASSIGNMENT</th>
                  <th style={{ padding: '12px 16px' }}>GRADE</th>
                  <th style={{ padding: '12px 16px' }}>SCORE</th>
                  <th style={{ padding: '12px 16px' }}>INSTRUCTOR FEEDBACK</th>
                  <th style={{ padding: '12px 16px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {grades.map(g => (
                  <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{g.courseTitle}</td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{g.assignmentName}</td>
                    <td style={{ padding: '16px' }}>
                      <span className={`badge ${g.score >= 90 ? 'badge-success' : g.score >= 75 ? 'badge-info' : 'badge-warning'}`}>
                        {g.grade}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {g.score} / {g.maxScore}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '300px' }}>
                      {g.instructorFeedback}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => {
                          setGradeEditModal(g);
                          setNewScore(g.score);
                          setNewGradeLetter(g.grade);
                          setUpdateMsg('');
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}
                      >
                        <Edit3 size={13} />
                        BOLA Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for BOLA Write Testing */}
      {gradeEditModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div className="glass-elevated" style={{
            maxWidth: '500px',
            width: '100%',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            background: 'var(--bg-secondary)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Test BOLA Write: Modify Grade Record
              </h3>
              <button
                onClick={() => setGradeEditModal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Target Grade ID: <code style={{ color: 'var(--accent-cyan)' }}>{gradeEditModal.id}</code> ({gradeEditModal.assignmentName})
            </p>

            <form onSubmit={handleUpdateGrade} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Letter Grade
                </label>
                <input
                  type="text"
                  value={newGradeLetter}
                  onChange={(e) => setNewGradeLetter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Numerical Score (out of 100)
                </label>
                <input
                  type="number"
                  value={newScore}
                  onChange={(e) => setNewScore(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff'
                  }}
                />
              </div>

              {updateMsg && (
                <div style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {updateMsg}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setGradeEditModal(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Execute Unauthorized Grade Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
