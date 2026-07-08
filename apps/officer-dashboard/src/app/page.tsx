'use client';

import { useEffect, useState } from 'react';

type Severity = 'low' | 'medium' | 'high';
type CaseStatus = 'pending' | 'escalated' | 'resolved';

interface HealthCase {
  id: string;
  farmerName: string;
  district: string;
  severity: Severity;
  diagnosis: string;
  confidence: number;
  status: CaseStatus;
  createdAt: string;
}

const SEVERITY_STYLE: Record<Severity, { label: string; color: string; bg: string }> = {
  high: { label: 'Critical', color: 'var(--sev-critical)', bg: 'var(--sev-critical-bg)' },
  medium: { label: 'Warning', color: 'var(--sev-warning)', bg: 'var(--sev-warning-bg)' },
  low: { label: 'Low', color: 'var(--sev-low)', bg: 'var(--sev-low-bg)' },
};

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export default function TriagePage() {
  const [cases, setCases] = useState<HealthCase[]>([]);
  const [loading, setLoading] = useState(true);
  const district = 'Medak';

  useEffect(() => {
    fetch(`http://localhost:3000/v1/rsk/queue?district=${district}`)
      .then((res) => res.json())
      .then((data) => setCases(data.cases ?? []))
      .catch(() => {
        // Mock data fallback matching earlier mock format
        setCases([
          { id: '1', farmerName: 'Ramesh Kumar', district: 'Medak', severity: 'high', diagnosis: 'Severe Leaf Blight detected on cotton crop. Immediate fungicide application recommended.', confidence: 0.9, status: 'pending', createdAt: new Date().toISOString() },
          { id: '2', farmerName: 'Sunita Devi', district: 'Hyderabad', severity: 'medium', diagnosis: 'Mild pest infestation (Aphids) in tomato field.', confidence: 0.7, status: 'pending', createdAt: new Date().toISOString() },
          { id: '3', farmerName: 'Lakshman Rao', district: 'Nizamabad', severity: 'low', diagnosis: 'Nutrient deficiency (Nitrogen) observed in paddy.', confidence: 0.8, status: 'pending', createdAt: new Date().toISOString() },
          { id: '4', farmerName: 'Kavita Reddy', district: 'Karimnagar', severity: 'high', diagnosis: 'Fall Armyworm attack on maize. Rapid spread likely.', confidence: 0.95, status: 'pending', createdAt: new Date().toISOString() },
          { id: '5', farmerName: 'Srinivas Goud', district: 'Warangal', severity: 'medium', diagnosis: 'Early signs of Powdery Mildew on chilli plants.', confidence: 0.65, status: 'pending', createdAt: new Date().toISOString() },
          { id: '6', farmerName: 'Venkat Sai', district: 'Khammam', severity: 'high', diagnosis: 'Pink Bollworm infestation in cotton. High economic damage risk.', confidence: 0.88, status: 'pending', createdAt: new Date().toISOString() },
          { id: '7', farmerName: 'Anjali Sharma', district: 'Adilabad', severity: 'low', diagnosis: 'Water stress detected. Irrigation required.', confidence: 0.75, status: 'pending', createdAt: new Date().toISOString() },
          { id: '8', farmerName: 'Mohammad Ali', district: 'Nalgonda', severity: 'medium', diagnosis: 'Bacterial blight symptoms in soybean crop.', confidence: 0.82, status: 'pending', createdAt: new Date().toISOString() },
          { id: '9', farmerName: 'Prasad Verma', district: 'Mahbubnagar', severity: 'high', diagnosis: 'Locust swarm warning in adjacent taluk. Preventative measures advised.', confidence: 0.92, status: 'pending', createdAt: new Date().toISOString() },
          { id: '10', farmerName: 'Geeta Kumari', district: 'Sangareddy', severity: 'low', diagnosis: 'Healthy crop development. No immediate action required.', confidence: 0.98, status: 'pending', createdAt: new Date().toISOString() },
          { id: '11', farmerName: 'Narasimha Chary', district: 'Siddipet', severity: 'medium', diagnosis: 'Whitefly cluster found on brinjal leaves.', confidence: 0.6, status: 'pending', createdAt: new Date().toISOString() },
          { id: '12', farmerName: 'Priyanka Das', district: 'Ranga Reddy', severity: 'high', diagnosis: 'Root rot disease spreading rapidly in groundnut field.', confidence: 0.89, status: 'pending', createdAt: new Date().toISOString() },
          { id: '13', farmerName: 'Venkatesh Naik', district: 'Medchal', severity: 'low', diagnosis: 'Minor zinc deficiency. Add micronutrient spray.', confidence: 0.77, status: 'pending', createdAt: new Date().toISOString() },
          { id: '14', farmerName: 'Bhavani Shankar', district: 'Yadadri Bhuvanagiri', severity: 'medium', diagnosis: 'Stem borer damage observed in paddy fields.', confidence: 0.81, status: 'pending', createdAt: new Date().toISOString() },
          { id: '15', farmerName: 'Arun Kumar', district: 'Jagtial', severity: 'high', diagnosis: 'Unseasonal heavy rain forecast. Harvest mature crops immediately.', confidence: 0.85, status: 'pending', createdAt: new Date().toISOString() }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function resolveCase(id: string) {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'resolved' } : c)));
    try {
      await fetch(`http://localhost:3000/v1/rsk/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });
    } catch {
      // optimistic UI already applied
    }
  }

  const pending = cases.filter((c) => c.status !== 'resolved');
  const critical = pending.filter((c) => c.severity === 'high').length;
  const resolvedToday = cases.filter((c) => c.status === 'resolved').length;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatPill label="Pending cases" value={pending.length} accent="var(--forest)" />
        <StatPill label="Critical" value={critical} accent="var(--sev-critical)" />
        <StatPill label="Resolved today" value={resolvedToday} accent="var(--sev-low)" />
      </div>

      <section className="glass" style={{ padding: '0.5rem', overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 2fr 1fr', gap: 12,
            padding: '0.9rem 1.25rem', fontSize: 11.5, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'var(--ink-soft)', fontWeight: 600,
          }}
        >
          <span>Farmer</span><span>District</span><span>Severity</span><span>Diagnosis</span><span style={{ textAlign: 'right' }}>Action</span>
        </div>

        {loading ? (
          <EmptyState title="Loading the queue" body="Fetching escalated cases from the field." />
        ) : pending.length === 0 ? (
          <EmptyState
            title="Queue is clear"
            body="No farmer cases need your attention right now. New escalations from AgriVaani's crop diagnosis will appear here automatically."
          />
        ) : (
          pending.map((c) => {
            const sev = SEVERITY_STYLE[c.severity];
            return (
              <div
                key={c.id}
                className="glass-strong"
                style={{
                  display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 2fr 1fr', gap: 12, alignItems: 'center',
                  padding: '1rem 1.25rem', marginTop: 8, borderRadius: 14, borderLeft: `4px solid ${sev.color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(27,67,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--forest)', flexShrink: 0 }}>
                    {initials(c.farmerName)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{c.farmerName}</div>
                    <div className="font-mono" style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>{c.id.slice(0, 8)}</div>
                  </div>
                </div>
                <span style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>{c.district}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: sev.color, background: sev.bg, padding: '4px 10px', borderRadius: 999, width: 'fit-content' }}>
                  {sev.label} &middot; {Math.round(c.confidence * 100)}%
                </span>
                <span style={{ fontSize: 13.5, color: 'var(--ink)' }}>{c.diagnosis}</span>
                <button
                  onClick={() => resolveCase(c.id)}
                  style={{ justifySelf: 'end', fontSize: 13, fontWeight: 500, color: 'var(--forest)', background: 'rgba(27,67,50,0.08)', border: '1px solid rgba(27,67,50,0.2)', borderRadius: 10, padding: '7px 14px', cursor: 'pointer' }}
                >
                  Resolve
                </button>
              </div>
            );
          })
        )}
      </section>
    </>
  );
}

function StatPill({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="glass" style={{ padding: '1.1rem 1.4rem' }}>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>{label}</div>
      <div className="font-display" style={{ fontSize: 30, fontWeight: 600, color: accent }}>{value}</div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(63,122,92,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 22 }}>
        ✓
      </div>
      <div className="font-display" style={{ fontSize: 17, fontWeight: 600, color: 'var(--forest)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', maxWidth: 360, margin: '0 auto' }}>{body}</div>
    </div>
  );
}
