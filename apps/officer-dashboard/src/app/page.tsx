'use client';
import { useEffect, useState } from 'react';
import FarmerSimChat from '../components/FarmerSimChat';
import KisanMitraAssistant from '../components/KisanMitraAssistant';

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [isKisanMitraOpen, setIsKisanMitraOpen] = useState(false);
  const [isFarmerSimOpen, setIsFarmerSimOpen] = useState(false);

  const fetchCases = async () => {
    try {
      const res = await fetch('http://localhost:3000/v1/rsk/queue');
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases);
      } else {
         setCases([]);
      }
    } catch {
      console.error('Failed to fetch cases, using mock data');
      setCases([
        { id: '1', farmer_name: 'Ramesh Kumar', district: 'Medak', severity_estimate: 'high', ai_diagnosis: 'Severe Leaf Blight', created_at: new Date().toISOString() },
        { id: '2', farmer_name: 'Sunita Devi', district: 'Hyderabad', severity_estimate: 'medium', ai_diagnosis: 'Mild pest infestation', created_at: new Date().toISOString() }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const resolveCase = async (id: string) => {
     setResolvingId(id);
     try {
       await fetch(`http://localhost:3000/v1/rsk/cases/${id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ status: 'resolved', officer_notes: 'Reviewed and advised farmer.' })
       });
       await fetchCases(); // Refresh
     } catch {
       console.log('Resolve failed');
     } finally {
       setResolvingId(null);
     }
  }

  const criticalCount = cases.filter((c) => c.severity_estimate === 'high').length;

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="glass sticky top-0 z-50 flex justify-between items-center px-4 md:px-xl h-16 w-full border-b border-white/40 shadow-sm">
        <div className="flex flex-col">
          <h1 className="font-h2 text-h2 text-primary leading-tight">AgriVaani</h1>
          <p className="text-on-surface-variant font-body-sm text-[12px]">Rythu Seva Kendra console</p>
        </div>
        <nav className="hidden md:flex items-center gap-xl">
          <a className="text-primary font-bold transition-colors" href="#">Triage</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Analytics</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Farmers</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Settings</a>
        </nav>
        <div className="flex items-center gap-sm">
          <div className="glass py-1 px-3 rounded-full flex items-center gap-2 border border-white/60">
            <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-label-id font-bold">
              OR
            </div>
            <span className="text-on-surface font-button hidden sm:block">Officer Reddy</span>
          </div>
          <button className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-primary/5 rounded-full transition-all">notifications</button>
        </div>
      </header>

      <main className="max-w-container-max mx-auto px-4 md:px-xl py-lg space-y-xl">
        {/* Welcome Section */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-h1 text-h1 text-primary">RSK Triage Queue</h2>
            <p className="text-on-surface-variant font-body-lg">Prioritize and resolve agricultural distress alerts across the district.</p>
          </div>
          <div className="hidden lg:block">
            <div className="glass p-sm rounded-xl text-primary font-label-id border border-white/60">
              LAST SYNC: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })} IST
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Pending */}
          <div className="glass p-lg rounded-2xl flex items-center justify-between group hover:shadow-lg transition-all duration-300">
            <div>
              <p className="text-on-surface-variant font-body-md mb-xs">Pending cases</p>
              <p className="font-h1 text-h1 text-primary">{cases.length}</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-2xl group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-primary text-[32px]">assignment_late</span>
            </div>
          </div>
          {/* Critical */}
          <div className="glass p-lg rounded-2xl flex items-center justify-between group hover:shadow-lg transition-all duration-300">
            <div>
              <p className="text-on-surface-variant font-body-md mb-xs">Critical</p>
              <p className="font-h1 text-h1 text-error">{criticalCount}</p>
            </div>
            <div className="p-4 bg-error/5 rounded-2xl group-hover:bg-error/10 transition-colors">
              <span className="material-symbols-outlined text-error text-[32px]">warning</span>
            </div>
          </div>
          {/* Resolved */}
          <div className="glass p-lg rounded-2xl flex items-center justify-between group hover:shadow-lg transition-all duration-300">
            <div>
              <p className="text-on-surface-variant font-body-md mb-xs">Resolved today</p>
              <p className="font-h1 text-h1 text-primary-container">8</p>
            </div>
            <div className="p-4 bg-primary-container/5 rounded-2xl group-hover:bg-primary-container/10 transition-colors">
              <span className="material-symbols-outlined text-primary-container text-[32px]">check_circle</span>
            </div>
          </div>
        </div>

        {/* Main Triage Table Area */}
        <div className="glass rounded-2xl shadow-sm border border-white/50 overflow-hidden flex flex-col min-h-[600px]">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-gutter px-lg py-md border-b border-white/30 bg-white/20 text-on-surface-variant font-button text-body-sm">
            <div className="col-span-4 md:col-span-3">Farmer & ID</div>
            <div className="hidden md:block col-span-2">District</div>
            <div className="col-span-3 md:col-span-2">Severity</div>
            <div className="col-span-3">AI Diagnosis</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {/* Table Rows Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-full p-8 text-on-surface-variant">Loading cases...</div>
            ) : cases.length === 0 ? (
              <div className="flex items-center justify-center h-full p-8 text-on-surface-variant">No cases in queue</div>
            ) : (
              cases.map((c) => {
                const isHigh = c.severity_estimate === 'high';
                const isMedium = c.severity_estimate === 'medium';
                
                let bgColor = 'bg-primary-fixed';
                let textColor = 'text-on-primary-fixed-variant';
                let label = 'Low Priority';
                let iconTextClass = 'text-primary-container';
                let iconBorderClass = 'border-primary-container/20';
                let iconBgClass = 'bg-primary-container/5';

                if (isHigh) {
                  bgColor = 'bg-error-container';
                  textColor = 'text-on-error-container';
                  label = `Critical`;
                  iconTextClass = 'text-primary';
                  iconBorderClass = 'border-primary/20';
                  iconBgClass = 'bg-primary/5';
                } else if (isMedium) {
                  bgColor = 'bg-secondary-container';
                  textColor = 'text-on-secondary-container';
                  label = `Warning`;
                  iconTextClass = 'text-secondary';
                  iconBorderClass = 'border-secondary/20';
                  iconBgClass = 'bg-secondary/5';
                }

                const initials = (c.farmer_name || 'U K').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                const idStr = c.id.substring(0, 5).toUpperCase();
                const isResolving = resolvingId === c.id;

                return (
                  <div key={c.id} className={`grid grid-cols-12 gap-gutter px-4 md:px-lg py-4 md:py-lg border-b border-white/20 hover:bg-white/30 transition-all items-center group ${isResolving ? 'opacity-50 scale-95' : ''}`}>
                    <div className="col-span-12 md:col-span-3 flex items-center gap-md">
                      <div className={`w-12 h-12 rounded-2xl glass flex items-center justify-center font-h2 ${iconTextClass} ${iconBorderClass} ${iconBgClass}`}>
                        {initials}
                      </div>
                      <div>
                        <p className="font-button text-primary">{c.farmer_name}</p>
                        <p className="font-label-id text-on-surface-variant text-[11px]">ID-{idStr}</p>
                      </div>
                    </div>
                    <div className="hidden md:block col-span-2 text-on-surface">{c.district}</div>
                    <div className="col-span-6 md:col-span-2 mt-2 md:mt-0">
                      <span className={`px-3 py-1 rounded-full ${bgColor} ${textColor} text-[12px] font-bold inline-flex items-center gap-1`}>
                        {label}
                      </span>
                    </div>
                    <div className="col-span-6 md:col-span-3 text-on-surface-variant italic text-sm md:text-base mt-2 md:mt-0">{c.ai_diagnosis}</div>
                    <div className="col-span-12 md:col-span-2 text-right mt-4 md:mt-0">
                      <button 
                        disabled={isResolving}
                        onClick={() => resolveCase(c.id)}
                        className="px-6 py-2 rounded-full border border-primary-container text-primary-container font-button hover:bg-primary-container hover:text-white transition-all active:scale-95 disabled:opacity-50 w-full md:w-auto"
                      >
                        {isResolving ? 'Resolving...' : 'Resolve'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Table Footer */}
          <div className="px-lg py-md border-t border-white/30 bg-white/10 flex justify-between items-center">
            <span className="text-body-sm text-on-surface-variant">Showing {cases.length} of {cases.length} cases</span>
            <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg glass border-white/60 text-primary-container hover:bg-white/50 disabled:opacity-30" disabled>
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg glass border-white/60 text-primary-container hover:bg-white/50">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="md:hidden glass fixed bottom-0 w-full z-50 flex justify-around items-center h-20 pb-safe px-2 border-t border-white/40">
        <a className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl px-3 py-1 active:scale-90 duration-200" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
          <span className="font-body-sm text-body-sm">Triage</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-primary/10 active:scale-90 duration-200" href="#">
          <span className="material-symbols-outlined">analytics</span>
          <span className="font-body-sm text-body-sm">Analytics</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-primary/10 active:scale-90 duration-200" href="#">
          <span className="material-symbols-outlined">groups</span>
          <span className="font-body-sm text-body-sm">Farmers</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-primary/10 active:scale-90 duration-200" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body-sm text-body-sm">Settings</span>
        </a>
      </nav>

      {/* FAB: Kisan Mitra AI Assistant */}
      <button 
        onClick={() => setIsKisanMitraOpen(true)}
        className={`fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 rounded-full glass border border-white/80 shadow-xl flex items-center justify-center text-secondary hover:scale-110 active:scale-90 transition-all z-40 overflow-hidden group ${isKisanMitraOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="absolute inset-0 bg-secondary/5 group-hover:bg-secondary/10 transition-colors"></div>
        <span className="material-symbols-outlined text-[32px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-2 border-white animate-pulse"></div>
        {/* Tooltip (desktop only) */}
        <span className="absolute right-20 bg-primary-container text-white px-4 py-2 rounded-xl text-body-sm font-button opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
          Kisan Mitra Assistant
        </span>
      </button>

      {/* FAB: Farmer Voice Simulator (Demo Only) */}
      <button 
        onClick={() => setIsFarmerSimOpen(true)}
        className={`fixed bottom-[11rem] right-6 md:bottom-[7rem] md:right-10 w-16 h-16 rounded-full glass border border-white/80 shadow-xl flex items-center justify-center text-primary hover:scale-110 active:scale-90 transition-all z-40 overflow-hidden group ${isFarmerSimOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
        <span className="material-symbols-outlined text-[32px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>record_voice_over</span>
        {/* Tooltip (desktop only) */}
        <span className="absolute right-20 bg-secondary-container text-white px-4 py-2 rounded-xl text-body-sm font-button opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
          Simulate Farmer Call
        </span>
      </button>

      <KisanMitraAssistant 
        isOpen={isKisanMitraOpen} 
        onClose={() => setIsKisanMitraOpen(false)} 
      />

      <FarmerSimChat 
        isOpen={isFarmerSimOpen} 
        onClose={() => setIsFarmerSimOpen(false)} 
        onEscalated={fetchCases}
        farmerId={cases[0]?.farmer_id}
        plotId={cases[0]?.plot_id}
      />
    </>
  );
}
