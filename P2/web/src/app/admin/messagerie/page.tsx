'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Conversation } from '@/types';

const ROLE_LABELS: Record<string, string> = { eleve: 'Élève', parent: 'Parent', repetiteur: 'Enseignant', admin: 'Admin' };

export default function AdminMessageriePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.conversations().then(d => setConversations(d.conversations)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink">Messagerie</h1>
        <p className="text-sm text-ink-muted">Vue d'ensemble des conversations récentes sur la plateforme (lecture seule).</p>
      </div>

      <div className="bg-white rounded-2xl border border-ink/10 overflow-hidden">
        {loading ? (
          <p className="p-4 text-sm text-ink-muted">Chargement...</p>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-muted flex flex-col items-center gap-2">
            <MessageCircle size={28} strokeWidth={1.5} className="text-ink/20" />
            Aucune conversation pour l'instant.
          </div>
        ) : (
          conversations.map(c => (
            <div key={c._id} className="flex items-center gap-3 p-4 border-b border-ink/5 last:border-0">
              <div className="flex -space-x-2 shrink-0">
                {c.participants.slice(0, 2).map(p => (
                  <div key={p._id} className="w-8 h-8 rounded-full bg-brand text-white text-xs font-bold grid place-items-center border-2 border-white">
                    {p.prenom?.[0]}{p.nom?.[0]}
                  </div>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate">
                  {c.participants.map(p => `${p.prenom} ${p.nom}${p.role ? ` (${ROLE_LABELS[p.role] || p.role})` : ''}`).join(' ↔ ')}
                </p>
                <p className="text-xs text-ink-muted truncate">{c.lastMessage || 'Aucun message échangé.'}</p>
              </div>
              {c.lastMessageAt && (
                <span className="text-xs text-ink-muted shrink-0">{new Date(c.lastMessageAt).toLocaleDateString('fr-FR')}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
