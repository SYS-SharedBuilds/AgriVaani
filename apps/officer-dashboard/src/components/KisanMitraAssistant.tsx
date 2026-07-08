'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'officer' | 'system';
  content: string;
}

export default function KisanMitraAssistant({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Kisan Mitra AI here. How can I assist you with the triage queue today?' }
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
    setMessages(prev => [...prev, { role: 'officer', content: userMsg }]);
    setLoading(true);

    try {
      // Mocking the backend call /v1/officer-assistant since it's not fully implemented yet
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const reply = `I've analyzed the queue. Based on your query "${userMsg}", you should focus on the high severity cases in Medak district first.`;
      
      setMessages(prev => [...prev, { role: 'system', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: 'Connection error.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-[350px] md:w-[400px] h-[500px] glass rounded-3xl border border-white/60 shadow-2xl flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-white/30 bg-secondary/10 flex justify-between items-center">
        <div>
          <h3 className="font-h2 text-secondary text-lg">Kisan Mitra Assistant</h3>
          <p className="text-on-surface-variant text-xs">Officer Case Assistant</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/50 flex items-center justify-center text-on-surface-variant transition-colors">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white/5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'officer' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 ${msg.role === 'officer' ? 'bg-secondary text-white rounded-tr-sm' : 'glass border border-white/40 text-on-surface rounded-tl-sm'}`}>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass border border-white/40 text-on-surface rounded-2xl rounded-tl-sm p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
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
            placeholder="Ask about the queue..."
            className="flex-1 bg-white/50 border border-white/60 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center hover:bg-secondary/90 disabled:opacity-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
