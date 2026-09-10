'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, MessageCircle } from 'lucide-react';
import { messagingApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import EmptyState from '@/components/EmptyState';
import type { Conversation, Message } from '@/types';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get('c');
  const { user } = useAuthStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagingApi.conversations()
      .then(d => {
        setConversations(d.conversations);
        if (!activeId && d.conversations[0]) router.replace(`/dashboard/messages?c=${d.conversations[0]._id}`);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeId) return;
    messagingApi.messages(activeId).then(d => setMessages(d.messages)).catch(() => {});
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const active = conversations.find(c => c._id === activeId);

  const send = async () => {
    if (!text.trim() || !activeId) return;
    setSending(true);
    try {
      const { message } = await messagingApi.send(activeId, text.trim());
      setMessages(prev => [...prev, message]);
      setText('');
      setConversations(prev => prev.map(c => c._id === activeId ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt } : c));
    } catch {
      // silencieux — l'utilisateur peut retenter
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-ink/10 overflow-hidden grid grid-cols-1 lg:grid-cols-[280px_1fr] h-[calc(100dvh-180px)] min-h-[420px]">
      {/* Deux colonnes seulement à partir de lg : à 768px, la sidebar du
          dashboard ne laisse qu'environ 488px de large — une colonne de
          conversations à 280px ne laisserait plus que ~208px au fil. */}
      <div className={`border-r border-ink/10 overflow-y-auto ${activeId ? 'hidden lg:block' : ''}`}>
        <div className="p-4 border-b border-ink/10">
          <h1 className="font-bold text-ink">Messages</h1>
        </div>
        {loading ? (
          <p className="p-4 text-sm text-ink-muted">Chargement...</p>
        ) : conversations.length === 0 ? (
          <EmptyState icon={MessageCircle} className="px-4" message="Vos échanges avec les enseignants apparaîtront ici."
            ctaLabel="Trouver un enseignant" ctaHref="/repetiteurs" />
        ) : (
          conversations.map(c => {
            const other = c.participants.find(p => p._id !== user?._id) || c.participants[0];
            return (
              <button key={c._id} onClick={() => router.push(`/dashboard/messages?c=${c._id}`)}
                className={`w-full flex items-center gap-3 p-3 text-left border-b border-ink/5 hover:bg-sand transition-colors ${c._id === activeId ? 'bg-brand-light' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-brand text-white text-xs font-bold grid place-items-center shrink-0">
                  {other?.prenom?.[0]}{other?.nom?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm truncate ${c.unread ? 'font-bold text-ink' : 'font-semibold text-ink'}`}>{other?.prenom} {other?.nom}</p>
                  <p className={`text-xs truncate ${c.unread ? 'text-ink font-medium' : 'text-ink-muted'}`}>{c.lastMessage || 'Nouvelle conversation'}</p>
                </div>
                {!!c.unread && (
                  <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-flag text-white text-[10px] font-bold grid place-items-center leading-none">
                    {c.unread > 9 ? '9+' : c.unread}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Fil de discussion */}
      <div className="flex flex-col min-w-0">
        {!active ? (
          <div className="flex-1 flex flex-col items-center justify-center text-ink-muted gap-2">
            <MessageCircle size={32} strokeWidth={1.5} />
            <p className="text-sm">Sélectionnez une conversation</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-ink/10 flex items-center gap-2">
              <button onClick={() => router.push('/dashboard/messages')} className="lg:hidden text-ink-muted text-sm mr-1">←</button>
              <p className="font-semibold text-ink">
                {active.participants.filter(p => p._id !== user?._id).map(p => `${p.prenom} ${p.nom}`).join(', ')}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.length === 0 && (
                <p className="text-center text-sm text-ink-muted py-8">Cette conversation est prête. Vous pouvez envoyer un premier message.</p>
              )}
              {messages.map(m => {
                const mine = m.senderId === user?._id;
                return (
                  <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm [overflow-wrap:anywhere] ${mine ? 'bg-brand text-white' : 'bg-sand text-ink'}`}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-ink/10 flex items-center gap-2">
              <label htmlFor="message-input" className="sr-only">Votre message</label>
              <input id="message-input" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Écris un message..." className="flex-1 border border-ink/15 rounded-full px-4 py-2 text-sm outline-none focus:border-brand" />
              <button onClick={send} disabled={sending || !text.trim()} aria-label="Envoyer" className="w-9 h-9 rounded-full bg-brand text-white grid place-items-center disabled:opacity-40 shrink-0">
                <Send size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
