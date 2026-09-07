'use client';

import { useEffect, useState } from 'react';
import { Video, CalendarClock } from 'lucide-react';
import { classeVirtuelleApi, reservationApi } from '@/lib/api';
import { niveauLabel } from '@/lib/constants';
import type { ClasseVirtuelle, Reservation } from '@/types';

export default function EleveClassesPage() {
  const [classes, setClasses] = useState<ClasseVirtuelle[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      classeVirtuelleApi.mineAsEleve().then(d => d.classes).catch(() => []),
      reservationApi.mine().then(d => d.reservations).catch(() => []),
    ]).then(([c, r]) => { setClasses(c); setReservations(r); }).finally(() => setLoading(false));
  }, []);

  type Item =
    | { type: 'classe'; date: Date; data: ClasseVirtuelle }
    | { type: 'reservation'; date: Date; data: Reservation };

  const items: Item[] = [
    ...classes.map(c => ({ type: 'classe' as const, date: new Date(c.dateHeure), data: c })),
    ...reservations.map(r => ({ type: 'reservation' as const, date: new Date(r.dateHeure), data: r })),
  ].sort((a, b) => +a.date - +b.date);

  const aVenir = items.filter(i => i.date >= new Date() && i.data.statut !== 'annulee');
  const passees = items.filter(i => i.date < new Date() || i.data.statut === 'annulee');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink">Classes virtuelles &amp; réservations</h1>
        <p className="text-sm text-ink/50">Tes séances programmées avec tes enseignants — en groupe ou en tête-à-tête.</p>
      </div>

      {loading ? (
        <p className="text-sm text-ink/50">Chargement...</p>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-ink/10 p-4">
            <h2 className="font-bold text-ink mb-3">À venir</h2>
            {aVenir.length === 0 ? (
              <p className="text-sm text-ink/50">Aucune classe virtuelle ni réservation programmée pour l'instant.</p>
            ) : (
              <div className="space-y-2">
                {aVenir.map(i => <ItemRow key={i.data._id} item={i} />)}
              </div>
            )}
          </div>

          {passees.length > 0 && (
            <div className="bg-white rounded-2xl border border-ink/10 p-4">
              <h2 className="font-bold text-ink mb-3">Passées</h2>
              <div className="space-y-2">
                {passees.map(i => <ItemRow key={i.data._id} item={i} muted />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ItemRow({ item, muted }: {
  item: { type: 'classe'; date: Date; data: ClasseVirtuelle } | { type: 'reservation'; date: Date; data: Reservation };
  muted?: boolean;
}) {
  const isClasse = item.type === 'classe';
  const enseignant = isClasse
    ? (typeof item.data.repetiteurId === 'object' ? `${item.data.repetiteurId.prenom} ${item.data.repetiteurId.nom}` : null)
    : (typeof item.data.repetiteurId === 'object' ? `${item.data.repetiteurId.prenom} ${item.data.repetiteurId.nom}` : null);

  return (
    <div className={`rounded-xl p-3 flex items-center justify-between gap-3 ${muted ? 'bg-sand/50 opacity-70' : 'bg-sand'}`}>
      <div className="min-w-0 flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-white grid place-items-center shrink-0 mt-0.5">
          {isClasse ? <Video size={14} className="text-brand" /> : <CalendarClock size={14} className="text-brand" />}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ink text-sm">
            {isClasse ? item.data.titre : item.data.matiere} · {niveauLabel(item.data.niveau)}
          </p>
          <p className="text-xs text-ink/50">
            {item.date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
            {enseignant ? ` · Avec ${enseignant}` : ''}
            {!isClasse && ` · ${(item.data as Reservation).mode === 'en_ligne' ? 'En ligne' : 'Présentiel'}`}
          </p>
          {item.data.lienVisio && !muted && (
            <a href={item.data.lienVisio} target="_blank" rel="noreferrer" className="text-xs text-brand font-semibold hover:underline">Rejoindre la visio →</a>
          )}
        </div>
      </div>
      <span className="text-[11px] font-semibold bg-white px-2.5 py-1 rounded-full capitalize shrink-0">
        {isClasse ? 'Classe virtuelle' : item.data.statut.replace('_', ' ')}
      </span>
    </div>
  );
}
