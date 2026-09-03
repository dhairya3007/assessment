import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-col" style={{ minHeight: '100vh' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-3) 0' }}>
        <div className="container flex items-center justify-between">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-main)' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '18px' }}>OnePrism</span>
          </Link>
          <nav className="flex gap-4">
            <Link to="/" className="btn btn-outline" style={{ border: 'none' }}>Import</Link>
            <Link to="/history" className="btn btn-outline" style={{ border: 'none' }}>History</Link>
          </nav>
        </div>
      </header>
      <main className="container py-6" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}
