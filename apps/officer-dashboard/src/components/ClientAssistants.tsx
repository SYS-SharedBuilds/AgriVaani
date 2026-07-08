'use client';
import { useState } from 'react';
import KisanMitraAssistant from './KisanMitraAssistant';
import FarmerSimChat from './FarmerSimChat';

export default function ClientAssistants({ officerName, district }: { officerName: string, district: string }) {
  const [isKisanMitraOpen, setIsKisanMitraOpen] = useState(false);
  const [isFarmerSimOpen, setIsFarmerSimOpen] = useState(false);

  return (
    <>
      {/* FAB: Kisan Mitra AI Assistant */}
      <button 
        onClick={() => setIsKisanMitraOpen(true)}
        className={`fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 rounded-full glass border border-white/80 shadow-xl flex items-center justify-center text-secondary hover:scale-110 active:scale-90 transition-all z-40 overflow-hidden group ${isKisanMitraOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="absolute inset-0 bg-secondary/5 group-hover:bg-secondary/10 transition-colors"></div>
        <span className="material-symbols-outlined text-[32px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-2 border-white animate-pulse"></div>
        {/* Tooltip */}
        <span className="absolute right-20 bg-primary-container text-white px-4 py-2 rounded-xl text-body-sm font-button opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
          Kisan Mitra Assistant
        </span>
      </button>

      {/* FAB: Farmer Voice Simulator */}
      <button 
        onClick={() => setIsFarmerSimOpen(true)}
        className={`fixed bottom-[11rem] right-6 md:bottom-[7rem] md:right-10 w-16 h-16 rounded-full glass border border-white/80 shadow-xl flex items-center justify-center text-primary hover:scale-110 active:scale-90 transition-all z-40 overflow-hidden group ${isFarmerSimOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
        <span className="material-symbols-outlined text-[32px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>record_voice_over</span>
        {/* Tooltip */}
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
        onEscalated={() => window.location.reload()}
      />
    </>
  );
}
