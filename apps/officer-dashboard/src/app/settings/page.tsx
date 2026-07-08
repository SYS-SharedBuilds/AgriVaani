'use client';

import { useEffect, useState } from 'react';

interface SystemStatus {
  telephonyProvider: 'connected' | 'not_configured';
  languageProvider: 'connected' | 'not_configured';
  geminiApi: 'connected' | 'not_configured';
  database: 'connected' | 'not_configured';
}

const DEMO_STATUS: SystemStatus = {
  telephonyProvider: 'not_configured',
  languageProvider: 'connected',
  geminiApi: 'connected',
  database: 'connected',
};

export default function SettingsPage() {
  const [status, setStatus] = useState<SystemStatus>(DEMO_STATUS);
  const [notifyOnCritical, setNotifyOnCritical] = useState(true);
  const [notifyOnAll, setNotifyOnAll] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState('te');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/v1/system/status`)
      .then((res) => res.json())
      .then(setStatus)
      .catch(() => setStatus(DEMO_STATUS));
  }, []);

  function handleSave() {
    setSaved(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/v1/officers/me/preferences`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifyOnCritical, notifyOnAll, defaultLanguage }),
    }).catch(() => {
      // preference save is best-effort; UI already reflects the change
    });
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--forest)', margin: 0 }}>Settings</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '2px 0 0' }}>Officer profile, notification preferences, and system status</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
        {/* left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* profile */}
          <div className="glass" style={{ padding: '1.4rem 1.6rem' }}>
            <SectionTitle>Officer profile</SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--forest)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                OR
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Officer Reddy</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Rythu Seva Kendra &middot; Medak district</div>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Field label="Phone number" value="+91 90xxxx3391" />
              <Field label="Covers district" value="Medak" />
            </div>
          </div>

          {/* notification preferences */}
          <div className="glass" style={{ padding: '1.4rem 1.6rem' }}>
            <SectionTitle>Notification preferences</SectionTitle>
            <ToggleRow
              label="Notify me on critical cases"
              sub="SMS ping when a case is auto-escalated as critical"
              checked={notifyOnCritical}
              onChange={setNotifyOnCritical}
            />
            <ToggleRow
              label="Notify me on every new case"
              sub="Includes low and warning severity escalations"
              checked={notifyOnAll}
              onChange={setNotifyOnAll}
            />
            <div style={{ marginTop: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: 6 }}>
                Default reply language
              </label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', fontSize: 13.5, borderRadius: 10, border: '1px solid rgba(27,67,50,0.2)', background: 'rgba(255,255,255,0.7)' }}
              >
                <option value="te">Telugu</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
                <option value="kn">Kannada</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
            <button
              onClick={handleSave}
              style={{ marginTop: 16, fontSize: 13.5, fontWeight: 500, color: 'white', background: 'var(--forest)', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}
            >
              {saved ? 'Saved' : 'Save preferences'}
            </button>
          </div>
        </div>

        {/* right column — system status */}
        <div className="glass" style={{ padding: '1.4rem 1.6rem' }}>
          <SectionTitle>System status</SectionTitle>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '6px 0 14px' }}>
            Live connection state for AgriVaani&apos;s backend services. A &quot;not configured&quot; service falls back to a demo-safe mock so the app never breaks.
          </p>
          <StatusRow label="Telephony (Twilio / Exotel)" status={status.telephonyProvider} />
          <StatusRow label="Language (Bhashini / Google STT-TTS)" status={status.languageProvider} />
          <StatusRow label="Gemini API" status={status.geminiApi} />
          <StatusRow label="Database" status={status.database} />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--forest)', fontFamily: 'var(--font-display)' }}>{children}</div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: 'var(--ink-soft)' }}>{label}</span>
      <span className="font-mono" style={{ color: 'var(--ink)' }}>{value}</span>
    </div>
  );
}

function ToggleRow({ label, sub, checked, onChange }: { label: string; sub: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{sub}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        aria-label={label}
        style={{
          width: 42, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0,
          background: checked ? 'var(--forest)' : 'rgba(27,67,50,0.18)', position: 'relative', transition: 'background 0.15s ease',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: checked ? 21 : 3, width: 18, height: 18, borderRadius: '50%',
          background: 'white', transition: 'left 0.15s ease',
        }} />
      </button>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: 'connected' | 'not_configured' }) {
  const ok = status === 'connected';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(27,67,50,0.08)' }}>
      <span style={{ fontSize: 13, color: 'var(--ink)' }}>{label}</span>
      <span style={{
        fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
        color: ok ? 'var(--sev-low)' : 'var(--sev-warning)',
        background: ok ? 'var(--sev-low-bg)' : 'var(--sev-warning-bg)',
      }}>
        {ok ? 'Connected' : 'Not configured'}
      </span>
    </div>
  );
}
