import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import TestingToolbar from '@/components/TestingToolbar';

export const metadata: Metadata = {
  title: 'VulLMS - Vulnerable Learning Management System (OWASP Lab)',
  description: 'Enterprise LMS security testing benchmark application featuring realistic OWASP Top 10 vulnerabilities for automated bug bounty verification engines.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>" />
      </head>
      <body>
        <TestingToolbar />
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 140px)', paddingBottom: '60px' }}>
          {children}
        </main>
        <footer style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '30px 20px',
          background: 'var(--bg-secondary)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🛡️</span>
              <strong style={{ color: 'var(--text-primary)' }}>VulLMS Security Benchmark</strong>
              <span>— OWASP Top 10 Testbed</span>
            </div>
            <div>
              Designed for automated bug bounty engine verification and security training.
            </div>
            <div>
              <a href="/security-docs" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>
                Vulnerability Catalog & API Specs
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
