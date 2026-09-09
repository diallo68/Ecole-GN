'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircleQuestion, X, Send, Sparkles } from 'lucide-react';
import { assistantApi } from '@/lib/api';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const INTRO: ChatMessage = {
  role: 'assistant',
  content: "Salut ! Je peux t'aider à choisir un enseignant, comprendre comment fonctionne Gandal, ou t'orienter vers un quiz. Pose ta question 👋",
};

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next);
    setText('');
    setLoading(true);
    try {
      const { reply } = await assistantApi.chat(next);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setUnavailable(true);
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, je ne suis pas disponible pour l'instant. Explore \"Enseignants\" ou \"Quiz\" dans le menu en attendant !" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-30">
      {/* h-[min(420px,70dvh)] plutôt qu'une hauteur fixe : sur un petit
          écran avec le clavier ouvert, 420px fixes peuvent dépasser la
          zone visible réelle (100dvh suit les barres du navigateur mobile). */}
      {open && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] sm:w-80 h-[min(420px,70dvh)] bg-white rounded-2xl border border-ink/10 shadow-xl flex flex-col overflow-hidden">
          <div className="bg-brand text-white px-4 py-3 flex items-center gap-2">
            <Sparkles size={16} />
            <p className="font-semibold text-sm flex-1">Assistant Gandal</p>
            <button onClick={() => setOpen(false)} aria-label="Fermer"><X size={16} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2" role="log" aria-live="polite" aria-label="Conversation avec l'assistant">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm [overflow-wrap:anywhere] ${m.role === 'user' ? 'bg-brand text-white' : 'bg-sand text-ink'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-sand text-ink/50 rounded-2xl px-3 py-2 text-sm">...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="p-2.5 border-t border-ink/10 flex items-center gap-2">
            <label htmlFor="assistant-input" className="sr-only">Votre question</label>
            <input id="assistant-input" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              disabled={unavailable} placeholder={unavailable ? 'Assistant indisponible' : 'Écris ta question...'}
              className="flex-1 border border-ink/15 rounded-full px-3.5 py-2 text-sm outline-none focus:border-brand disabled:opacity-50" />
            <button onClick={send} disabled={loading || !text.trim() || unavailable} aria-label="Envoyer"
              className="w-9 h-9 rounded-full bg-brand text-white grid place-items-center disabled:opacity-40 shrink-0">
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant"} aria-expanded={open}
        className="w-14 h-14 rounded-full bg-brand text-white shadow-lg grid place-items-center hover:bg-brand-dark transition-colors">
        {open ? <X size={22} /> : <MessageCircleQuestion size={24} />}
      </button>
    </div>
  );
}
