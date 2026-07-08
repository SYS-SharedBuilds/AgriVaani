'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'farmer' | 'system';
  content: string;
  audioUrl?: string;
}

export default function FarmerSimChat({ isOpen, onClose, onEscalated, farmerId, plotId }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onEscalated: () => void;
  farmerId?: string;
  plotId?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Namaste! Please describe the issue with your crop.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    const newMessages = [...messages, { role: 'farmer' as const, content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Accumulate transcript
      const transcript = newMessages
        .filter(m => m.role === 'farmer')
        .map(m => m.content)
        .join('. ');

      const res = await fetch('http://localhost:3000/v1/health-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id: farmerId || '00000000-0000-0000-0000-000000000000',
          plot_id: plotId || '00000000-0000-0000-0000-000000000000',
          voice_transcript: transcript
        })
      });
      const data = await res.json();

      const needsExpert = data.confidence < 0.6 || data.severity === 'high';
      
      let replyText = needsExpert 
        ? `We've detected a potentially severe issue (${data.diagnosis}). Escalating to Rythu Seva Kendra officer immediately.`
        : `Based on your description, this looks like ${data.diagnosis}. Recommendation: ${data.self_care}`;

      // Fetch TTS audio
      let audioUrl = '';
      try {
        const ttsRes = await fetch('http://localhost:3000/v1/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: replyText, languageCode: 'en-US' })
        });
        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          audioUrl = ttsData.audioUrl;
        }
      } catch (e) {
        console.error('TTS error', e);
      }

      setMessages(prev => [...prev, { role: 'system', content: replyText, audioUrl: audioUrl ? `http://localhost:3000${audioUrl}` : undefined }]);

      if (needsExpert) {
        onEscalated();
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: 'Connection error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-[350px] md:w-[400px] h-[500px] glass rounded-3xl border border-white/60 shadow-2xl flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-white/30 bg-primary/10 flex justify-between items-center">
        <div>
          <h3 className="font-h2 text-primary text-lg">Farmer Voice Simulator</h3>
          <p className="text-on-surface-variant text-xs">Simulated Voice/SMS Channel</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/50 flex items-center justify-center text-on-surface-variant transition-colors">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Demo Badge */}
      <div className="bg-secondary-container/30 px-3 py-2 border-b border-secondary/20 flex items-center justify-center">
        <span className="glass px-3 py-1 rounded-full text-secondary text-[11px] font-bold text-center leading-tight">
          Demo mode — simulating the farmer voice/SMS channel for this walkthrough.
        </span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white/5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'farmer' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 ${msg.role === 'farmer' ? 'bg-primary text-on-primary rounded-tr-sm' : 'glass border border-white/40 text-on-surface rounded-tl-sm'}`}>
              <p className="text-sm">{msg.content}</p>
            </div>
            {msg.audioUrl && (
              <audio controls autoPlay className="mt-2 h-8 w-[200px]" src={msg.audioUrl} />
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start">
            <div className="glass border border-white/40 text-on-surface rounded-2xl rounded-tl-sm p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/30 bg-white/20">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a voice message..."
            className="flex-1 bg-white/50 border border-white/60 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
