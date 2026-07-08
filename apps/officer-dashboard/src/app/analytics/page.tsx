'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';

interface AnalyticsSummary {
  casesOverTime: { week: string; cases: number }[];
  severityBreakdown: { severity: string; count: number }[];
  topDiagnoses: { diagnosis: string; count: number }[];
  avgResolutionHours: number;
  totalCasesThisMonth: number;
  escalationRate: number;
}

const DEMO_DATA: AnalyticsSummary = {
  casesOverTime: [
    { week: 'Wk 1', cases: 4 }, { week: 'Wk 2', cases: 7 }, { week: 'Wk 3', cases: 5 },
    { week: 'Wk 4', cases: 11 }, { week: 'Wk 5', cases: 9 }, { week: 'Wk 6', cases: 14 },
  ],
  severityBreakdown: [
    { severity: 'Low', count: 18 }, { severity: 'Warning', count: 11 }, { severity: 'Critical', count: 6 },
  ],
  topDiagnoses: [
    { diagnosis: 'Powdery mildew', count: 9 }, { diagnosis: 'Leaf blight', count: 7 },
    { diagnosis: 'Aphid infestation', count: 5 }, { diagnosis: 'Root rot', count: 3 }, { diagnosis: 'Nutrient deficiency', count: 3 },
  ],
  avgResolutionHours: 6.4,
  totalCasesThisMonth: 35,
  escalationRate: 0.31,
};

const SEV_COLORS: Record<string, string> = {
  Low: 'var(--sev-low)', Warning: 'var(--sev-warning)', Critical: 'var(--sev-critical)',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary>(DEMO_DATA);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/v1/analytics/summary?district=Medak`)
      .then((res) => res.json())
      .then((d) => { setData(d); setIsDemo(false); })
      .catch(() => setIsDemo(true));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--forest)', margin: 0 }}>Analytics</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '2px 0 0' }}>Case volume, severity, and resolution trends for Medak</p>
        </div>
        {isDemo && <DemoBadge />}
      </div>

      {/* summary stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        <MetricCard label="Cases this month" value={data.totalCasesThisMonth} accent="var(--forest)" />
        <MetricCard label="Avg. resolution time" value={`${data.avgResolutionHours}h`} accent="var(--sev-low)" />
        <MetricCard label="Escalation rate" value={`${Math.round(data.escalationRate * 100)}%`} accent="var(--sev-warning)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* cases over time */}
        <div className="glass" style={{ padding: '1.25rem 1.5rem' }}>
          <ChartTitle>Cases reported per week</ChartTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.casesOverTime}>
              <CartesianGrid stroke="rgba(27,67,50,0.08)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11.5, fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11.5, fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid rgba(27,67,50,0.15)', fontSize: 12.5 }} />
              <Line type="monotone" dataKey="cases" stroke="#1B4332" strokeWidth={2.5} dot={{ r: 3.5, fill: '#1B4332' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* severity breakdown */}
        <div className="glass" style={{ padding: '1.25rem 1.5rem' }}>
          <ChartTitle>Severity breakdown</ChartTitle>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.severityBreakdown} dataKey="count" nameKey="severity"
                innerRadius={45} outerRadius={75} paddingAngle={3}
              >
                {data.severityBreakdown.map((entry) => (
                  <Cell key={entry.severity} fill={SEV_COLORS[entry.severity] ?? '#52796F'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid rgba(27,67,50,0.15)', fontSize: 12.5 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4 }}>
            {data.severityBreakdown.map((s) => (
              <div key={s.severity} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--ink-soft)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: SEV_COLORS[s.severity] ?? '#52796F' }} />
                {s.severity} ({s.count})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* top diagnoses */}
      <div className="glass" style={{ padding: '1.25rem 1.5rem' }}>
        <ChartTitle>Most common diagnoses</ChartTitle>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.topDiagnoses} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid stroke="rgba(27,67,50,0.08)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11.5, fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="diagnosis" tick={{ fontSize: 12, fill: 'var(--ink)' }} axisLine={false} tickLine={false} width={140} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid rgba(27,67,50,0.15)', fontSize: 12.5 }} />
            <Bar dataKey="count" fill="#C9922B" radius={[0, 6, 6, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="glass" style={{ padding: '1.1rem 1.4rem' }}>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>{label}</div>
      <div className="font-display" style={{ fontSize: 28, fontWeight: 600, color: accent }}>{value}</div>
    </div>
  );
}

function ChartTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--forest)', marginBottom: 10 }}>{children}</div>;
}

function DemoBadge() {
  return (
    <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--sev-warning)', background: 'var(--sev-warning-bg)', padding: '5px 12px', borderRadius: 999 }}>
      Showing demo data — /v1/analytics/summary not reachable
    </span>
  );
}
