'use client';

import { useEffect, useMemo, useState } from 'react';

interface Plot {
  id: string;
  areaHectares: number;
  soilPh: number | null;
  groundwaterDepthM: number | null;
  lastSyncedAt: string | null;
}

interface Farmer {
  id: string;
  name: string;
  phoneNumber: string;
  village: string;
  district: string;
  preferredLanguage: string;
  plots: Plot[];
  lastActivity: string;
}

const LANGUAGE_LABEL: Record<string, string> = {
  hi: 'Hindi', te: 'Telugu', mr: 'Marathi', kn: 'Kannada', ta: 'Tamil', bn: 'Bengali', pa: 'Punjabi',
};

const DEMO_FARMERS: Farmer[] = [
  { id: 'f1', name: 'Ramesh Naik', phoneNumber: '+91 98xxxx1210', village: 'Kondapur', district: 'Medak', preferredLanguage: 'te', lastActivity: '2 hours ago',
    plots: [{ id: 'p1', areaHectares: 1.4, soilPh: 6.8, groundwaterDepthM: 45.5, lastSyncedAt: 'Today' }] },
  { id: 'f2', name: 'Sunita Devi', phoneNumber: '+91 98xxxx4482', village: 'Narsapur', district: 'Medak', preferredLanguage: 'hi', lastActivity: '1 day ago',
    plots: [{ id: 'p2', areaHectares: 0.8, soilPh: 7.2, groundwaterDepthM: 18.2, lastSyncedAt: 'Yesterday' }] },
  { id: 'f3', name: 'Ganesh Patil', phoneNumber: '+91 98xxxx7734', village: 'Shivpur', district: 'Medak', preferredLanguage: 'mr', lastActivity: '3 days ago',
    plots: [{ id: 'p3', areaHectares: 2.1, soilPh: 6.1, groundwaterDepthM: 32.0, lastSyncedAt: '3 days ago' }] },
];

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>(DEMO_FARMERS);
  const [isDemo, setIsDemo] = useState(true);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/v1/farmers?district=Medak`)
      .then((res) => res.json())
      .then((data) => { setFarmers(data.farmers ?? DEMO_FARMERS); setIsDemo(false); })
      .catch(() => setIsDemo(true));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return farmers;
    return farmers.filter((f) =>
      f.name.toLowerCase().includes(q) || f.village.toLowerCase().includes(q) || f.phoneNumber.includes(q)
    );
  }, [farmers, query]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--forest)', margin: 0 }}>Farmers</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '2px 0 0' }}>{filtered.length} registered in Medak</p>
        </div>
        {isDemo && (
          <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--sev-warning)', background: 'var(--sev-warning-bg)', padding: '5px 12px', borderRadius: 999 }}>
            Showing demo data
          </span>
        )}
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, village, or phone number"
        style={{
          width: '100%', marginBottom: '1.1rem', padding: '10px 16px', fontSize: 14,
          border: '1px solid rgba(27,67,50,0.2)', borderRadius: 12, background: 'rgba(255,255,255,0.7)', outline: 'none',
        }}
      />

      <section className="glass" style={{ padding: '0.5rem' }}>
        <div
          style={{
            display: 'grid', gridTemplateColumns: '1.6fr 1.2fr 1fr 1fr 1fr', gap: 12,
            padding: '0.9rem 1.25rem', fontSize: 11.5, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'var(--ink-soft)', fontWeight: 600,
          }}
        >
          <span>Farmer</span><span>Village</span><span>Language</span><span>Plots</span><span>Last activity</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', fontSize: 13.5, color: 'var(--ink-soft)' }}>
            No farmers match &quot;{query}&quot;.
          </div>
        ) : (
          filtered.map((f) => {
            const isOpen = expanded === f.id;
            return (
              <div key={f.id} className="glass-strong" style={{ marginTop: 8, borderRadius: 14, overflow: 'hidden' }}>
                <div
                  onClick={() => setExpanded(isOpen ? null : f.id)}
                  style={{
                    display: 'grid', gridTemplateColumns: '1.6fr 1.2fr 1fr 1fr 1fr', gap: 12, alignItems: 'center',
                    padding: '1rem 1.25rem', cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(27,67,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--forest)', flexShrink: 0 }}>
                      {initials(f.name)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{f.name}</div>
                      <div className="font-mono" style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>{f.phoneNumber}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>{f.village}</span>
                  <span style={{ fontSize: 13, color: 'var(--ink)' }}>{LANGUAGE_LABEL[f.preferredLanguage] ?? f.preferredLanguage}</span>
                  <span style={{ fontSize: 13, color: 'var(--ink)' }}>{f.plots.length}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{f.lastActivity}</span>
                </div>

                {isOpen && (
                  <div style={{ padding: '0 1.25rem 1.1rem', borderTop: '1px solid rgba(27,67,50,0.1)' }}>
                    {f.plots.map((p) => (
                      <div key={p.id} style={{ display: 'flex', gap: 24, padding: '0.9rem 0', fontSize: 12.5, color: 'var(--ink-soft)' }}>
                        <span><b style={{ color: 'var(--ink)' }}>{p.areaHectares} ha</b> plot</span>
                        <span>Soil pH: <b style={{ color: 'var(--ink)' }}>{p.soilPh ?? '—'}</b></span>
                        <span>Groundwater: <b style={{ color: 'var(--ink)' }}>{p.groundwaterDepthM ?? '—'} m</b></span>
                        <span>Last synced: <b style={{ color: 'var(--ink)' }}>{p.lastSyncedAt ?? 'never'}</b></span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
