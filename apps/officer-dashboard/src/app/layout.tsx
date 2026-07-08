/* eslint-disable @next/next/no-page-custom-font */
import './globals.css';
import NavBar from '../components/NavBar';
import ClientAssistants from '../components/ClientAssistants';

export const metadata = {
  title: 'AgriVaani — RSK Officer Console',
  description: 'Rythu Seva Kendra triage, analytics, and farmer records for AgriVaani',
};

const OFFICER = { name: 'Officer Reddy', district: 'Medak' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,400..700;1,400..700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body>
        <div style={{ position: 'relative', minHeight: '100vh' }}>
          <div className="field-mist" aria-hidden="true">
            <span /><span /><span />
          </div>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: '2.5rem 1.5rem 6rem' }}>
            <NavBar />
            {children}
          </div>
          <ClientAssistants officerName={OFFICER.name} district={OFFICER.district} />
        </div>
      </body>
    </html>
  );
}
