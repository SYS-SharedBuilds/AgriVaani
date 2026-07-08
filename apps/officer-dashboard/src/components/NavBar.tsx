'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Triage' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/farmers', label: 'Farmers' },
  { href: '/settings', label: 'Settings' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header
      className="glass"
      style={{
        display: 'flex', alignItems: 'center', justifyItems: 'space-between', justifyContent: 'space-between',
        padding: '1.1rem 1.75rem', marginBottom: '1.5rem',
      }}
    >
      <div>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 600, color: 'var(--forest)', margin: 0 }}>
          AgriVaani
        </h1>
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '2px 0 0' }}>Rythu Seva Kendra console</p>
      </div>

      <nav style={{ display: 'flex', gap: 6 }}>
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: 14.5,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--forest)' : 'var(--ink-soft)',
                padding: '7px 14px',
                borderRadius: 10,
                border: active ? '1px solid rgba(27,67,50,0.28)' : '1px solid transparent',
                background: active ? 'rgba(27,67,50,0.06)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.15s ease',
              }}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
