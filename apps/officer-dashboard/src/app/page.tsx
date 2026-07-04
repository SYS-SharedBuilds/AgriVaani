'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      // In a real app this would point to the API.
      // For demo we mock it if the API isn't up, otherwise fetch it.
      const res = await fetch('http://localhost:3000/v1/rsk/queue');
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases);
      } else {
         setCases([]);
      }
    } catch (error) {
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
     try {
       await fetch(`http://localhost:3000/v1/rsk/cases/${id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ status: 'resolved', officer_notes: 'Reviewed and advised farmer.' })
       });
       fetchCases(); // Refresh
     } catch (err) {
       console.log('Resolve failed');
     }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">RSK Officer Dashboard</h1>
            <p className="text-gray-500">AgriVaani Triage Queue</p>
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
            Officer Reddy (Medak)
          </div>
        </header>

        {loading ? (
          <p>Loading cases...</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cases.map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{c.farmer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{c.district}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        c.severity_estimate === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {c.severity_estimate}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{c.ai_diagnosis}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      <button 
                        onClick={() => resolveCase(c.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
                {cases.length === 0 && (
                   <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No cases in queue</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
