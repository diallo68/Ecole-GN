'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { reservationApi } from '@/lib/api';
import type { Reservation } from '@/types';

const ROLE_LABELS: Record<string, string> = {
  eleve: 'élève', parent: 'parent', repetiteur: 'enseignant', admin: 'admin',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    const fetcher = user?.role === 'repetiteur' ? reservationApi.agenda : reservationApi.mine;
    fetcher().then(d => setReservations(d.reservations)).catch(() => {});
  }, [user, isLoggedIn, router]);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Bonjour {user.prenom} 👋</h1>
      <p className="text-ink/60 mb-6 capitalize">Espace {ROLE_LABELS[user.role] || user.role}</p>

      {user.role === 'repetiteur' && (
        <>
          {!user.repetiteur?.valide && (
            <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-4 py-3 mb-6 text-sm">
              Ton profil enseignant est en attente de validation par l'équipe Gandal avant d'apparaître dans les recherches.
            </div>
          )}
          <div className="flex flex-wrap gap-3 mb-6">
            <Link href="/dashboard/repetiteur/profil" className="bg-white border border-ink/15 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-sand">Mon profil</Link>
            <Link href="/dashboard/repetiteur/contenu" className="bg-white border border-ink/15 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-sand">Mon contenu pédagogique</Link>
            <Link href="/dashboard/repetiteur/classes" className="bg-white border border-ink/15 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-sand">Classes virtuelles</Link>
          </div>
        </>
      )}

      <h2 className="font-bold mb-3">{user.role === 'repetiteur' ? 'Mon agenda' : 'Mes réservations'}</h2>
      {reservations.length === 0 ? (
        <p className="text-ink/60 text-sm">Aucune réservation pour l'instant.</p>
      ) : (
        <div className="space-y-3">
          {reservations.map(r => (
            <div key={r._id} className="bg-white rounded-xl border border-ink/10 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{r.matiere} · {r.niveau}</p>
                <p className="text-sm text-ink/60">{new Date(r.dateHeure).toLocaleString('fr-FR')} — {r.mode === 'en_ligne' ? 'En ligne' : 'Présentiel'}</p>
                {r.lienVisio && <a href={r.lienVisio} target="_blank" rel="noreferrer" className="text-sm text-brand font-semibold">Rejoindre la visio →</a>}
              </div>
              <span className="text-xs font-semibold bg-ink/5 px-2.5 py-1 rounded-full capitalize">{r.statut.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
