'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Star, Wallet, CalendarCheck, ToggleLeft, ToggleRight, MessageCircle,
  ArrowRight, Video, BookOpen, UserCog, GraduationCap, ClipboardList,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { reservationApi, messagingApi, quizApi } from '@/lib/api';
import StatCard from '@/components/StatCard';
import type { Reservation, Conversation, QuizAttempt, User } from '@/types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tentatives, setTentatives] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetcher = user.role === 'repetiteur' ? reservationApi.agenda : reservationApi.mine;
    fetcher().then(d => setReservations(d.reservations)).catch(() => {});
    messagingApi.conversations().then(d => setConversations(d.conversations)).catch(() => {});
    if (user.role !== 'repetiteur') {
      quizApi.mesTentatives().then(d => setTentatives(d.tentatives)).catch(() => {});
    }
  }, [user]);

  if (!user) return null;

  const aVenir = reservations.filter(r => r.statut === 'en_attente' || r.statut === 'confirmee');
  const prochaine = [...aVenir].sort((a, b) => +new Date(a.dateHeure) - +new Date(b.dateHeure))[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Bonjour {user.prenom} 👋</h1>
        <p className="text-ink/50 text-sm">Espace {ROLE_LABELS[user.role] || user.role}</p>
      </div>

      {user.role === 'repetiteur' && !user.repetiteur?.valide && (
        <div className="bg-accent/10 border border-accent/30 text-[#8a6400] rounded-xl px-4 py-3 text-sm font-medium">
          Ton profil est en attente de validation par l'équipe Gandal avant d'apparaître dans les recherches.
        </div>
      )}

      {user.role === 'repetiteur' ? (
        <EnseignantHome user={user} reservations={reservations} aVenir={aVenir} prochaine={prochaine} />
      ) : (
        <EleveHome user={user} reservations={reservations} aVenir={aVenir} prochaine={prochaine} tentatives={tentatives} />
      )}

      <MessagesPreview conversations={conversations} />
    </div>
  );
}

const ROLE_LABELS: Record<string, string> = { eleve: 'élève', parent: 'parent', repetiteur: 'enseignant', admin: 'admin' };

function EnseignantHome({ user, aVenir, prochaine }: { user: User; reservations: Reservation[]; aVenir: Reservation[]; prochaine?: Reservation }) {
  const rep = user.repetiteur;
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Star} label="Note moyenne" value={rep?.ratingCount ? `${rep.avgRating} / 5` : '—'} tone="accent" />
        <StatCard icon={Wallet} label="Tarif horaire" value={rep?.tarifHoraire ? `${rep.tarifHoraire.toLocaleString('fr-FR')} GNF` : '—'} />
        <StatCard icon={CalendarCheck} label="Sessions à venir" value={aVenir.length} />
        <StatCard icon={rep?.disponible ? ToggleRight : ToggleLeft} label={rep?.disponible ? 'Disponible' : 'Indisponible'} value={rep?.disponible ? 'Oui' : 'Non'} tone={rep?.disponible ? 'brand' : 'flag'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <QuickAction href="/dashboard/repetiteur/profil" icon={UserCog} label="Mon profil" desc="Bio, matières, tarif" />
        <QuickAction href="/dashboard/repetiteur/contenu" icon={BookOpen} label="Mon contenu" desc="Vidéos, supports, exercices" />
        <QuickAction href="/dashboard/repetiteur/classes" icon={Video} label="Classes virtuelles" desc="Planifier une séance" />
      </div>

      <AgendaSection title="Mon agenda" prochaine={prochaine} aVenir={aVenir} emptyLabel="Aucune session programmée pour l'instant." />
    </>
  );
}

function EleveHome({ aVenir, prochaine, tentatives }: { user: User; reservations: Reservation[]; aVenir: Reservation[]; prochaine?: Reservation; tentatives: QuizAttempt[] }) {
  const moyenne = tentatives.length
    ? Math.round((tentatives.reduce((s, t) => s + t.score / t.total, 0) / tentatives.length) * 100)
    : null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={CalendarCheck} label="Sessions à venir" value={aVenir.length} />
        <StatCard icon={ClipboardList} label="Quiz complétés" value={tentatives.length} tone="accent" />
        <StatCard icon={GraduationCap} label="Score moyen quiz" value={moyenne !== null ? `${moyenne}%` : '—'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <QuickAction href="/repetiteurs" icon={GraduationCap} label="Trouver un enseignant" desc="Réserve un cours" />
        <QuickAction href="/quiz" icon={ClipboardList} label="Faire un quiz" desc="Teste tes connaissances" />
      </div>

      <AgendaSection title="Mes réservations" prochaine={prochaine} aVenir={aVenir} emptyLabel="Aucune réservation pour l'instant." />

      {tentatives.length > 0 && (
        <div className="bg-white rounded-2xl border border-ink/10 p-4">
          <h2 className="font-bold text-ink mb-3">Mes derniers quiz</h2>
          <div className="space-y-2">
            {tentatives.slice(0, 4).map(t => (
              <div key={t._id} className="flex items-center justify-between text-sm">
                <span className="text-ink/80 truncate">{t.quizId?.titre || 'Quiz supprimé'}</span>
                <span className="font-semibold text-brand-dark shrink-0 ml-3">{t.score}/{t.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function QuickAction({ href, icon: Icon, label, desc }: { href: string; icon: LucideIcon; label: string; desc: string }) {
  return (
    <Link href={href} className="bg-white rounded-2xl border border-ink/10 p-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-brand-light text-brand-dark grid place-items-center shrink-0">
        <Icon size={19} strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink text-sm">{label}</p>
        <p className="text-xs text-ink/50 truncate">{desc}</p>
      </div>
      <ArrowRight size={16} className="text-ink/30 group-hover:text-brand transition-colors shrink-0" />
    </Link>
  );
}

function AgendaSection({ title, prochaine, aVenir, emptyLabel }: { title: string; prochaine?: Reservation; aVenir: Reservation[]; emptyLabel: string }) {
  const reste = prochaine ? aVenir.filter(r => r._id !== prochaine._id) : aVenir;
  return (
    <div className="bg-white rounded-2xl border border-ink/10 p-4">
      <h2 className="font-bold text-ink mb-3">{title}</h2>
      {!prochaine ? (
        <p className="text-sm text-ink/50">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          <ReservationRow r={prochaine} highlight />
          {reste.map(r => <ReservationRow key={r._id} r={r} />)}
        </div>
      )}
    </div>
  );
}

function ReservationRow({ r, highlight }: { r: Reservation; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 flex items-center justify-between gap-3 ${highlight ? 'bg-brand-light' : 'bg-sand'}`}>
      <div className="min-w-0">
        <p className="font-semibold text-ink text-sm">{r.matiere} · {r.niveau}</p>
        <p className="text-xs text-ink/50">
          {new Date(r.dateHeure).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })} — {r.mode === 'en_ligne' ? 'En ligne' : 'Présentiel'}
        </p>
        {r.lienVisio && <a href={r.lienVisio} target="_blank" rel="noreferrer" className="text-xs text-brand font-semibold hover:underline">Rejoindre la visio →</a>}
      </div>
      <span className="text-[11px] font-semibold bg-white px-2.5 py-1 rounded-full capitalize shrink-0">{r.statut.replace('_', ' ')}</span>
    </div>
  );
}

function MessagesPreview({ conversations }: { conversations: Conversation[] }) {
  return (
    <div className="bg-white rounded-2xl border border-ink/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-ink flex items-center gap-2"><MessageCircle size={17} /> Messages</h2>
        <Link href="/dashboard/messages" className="text-xs font-semibold text-brand hover:text-brand-dark">Tout voir →</Link>
      </div>
      {conversations.length === 0 ? (
        <p className="text-sm text-ink/50">Aucune conversation pour l'instant.</p>
      ) : (
        <div className="space-y-1">
          {conversations.slice(0, 3).map(c => (
            <Link key={c._id} href="/dashboard/messages" className="flex items-center gap-3 p-2 rounded-xl hover:bg-sand transition-colors">
              <div className="w-8 h-8 rounded-full bg-brand-light text-brand-dark text-xs font-bold grid place-items-center shrink-0">
                {c.participants[0]?.prenom?.[0]}{c.participants[0]?.nom?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate">{c.participants.map(p => p.prenom).join(', ')}</p>
                <p className="text-xs text-ink/50 truncate">{c.lastMessage || '...'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
