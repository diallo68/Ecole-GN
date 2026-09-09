'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { classeVirtuelleApi, reservationApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { NIVEAUX, niveauLabel, matieresDuNiveau } from '@/lib/constants';
import type { ClasseVirtuelle, Niveau, Reservation } from '@/types';

export default function RepetiteurClassesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [classes, setClasses] = useState<ClasseVirtuelle[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [titre, setTitre] = useState('');
  const [niveau, setNiveau] = useState<Niveau>('7e');
  const matieresDisponibles = matieresDuNiveau(niveau);
  const [matiere, setMatiere] = useState(matieresDisponibles[0]);
  const [dateHeure, setDateHeure] = useState('');
  const [loading, setLoading] = useState(false);

  const changerNiveau = (v: Niveau) => {
    setNiveau(v);
    const options = matieresDuNiveau(v);
    if (!options.includes(matiere)) setMatiere(options[0]);
  };

  useEffect(() => {
    if (user && user.role !== 'repetiteur') { router.push('/dashboard'); return; }
    classeVirtuelleApi.mine().then(d => setClasses(d.classes)).catch(() => {});
    reservationApi.agenda().then(d => setReservations(d.reservations)).catch(() => {});
  }, [user, router]);

  const planifier = async () => {
    if (!titre || !dateHeure) { toast.error('Titre et date requis'); return; }
    setLoading(true);
    try {
      const { classe } = await classeVirtuelleApi.create({ titre, matiere, niveau, dateHeure });
      setClasses(prev => [classe, ...prev]);
      toast.success('Classe virtuelle planifiée !');
      setTitre(''); setDateHeure('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'repetiteur') return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl border border-ink/10 p-4 h-fit">
        <h2 className="font-bold mb-3">Planifier une classe virtuelle</h2>
        <div className="space-y-2">
          <input placeholder="Titre (ex: Révisions Bac blanc)" value={titre} onChange={e => setTitre(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
          <select value={niveau} onChange={e => changerNiveau(e.target.value as Niveau)} className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm">
            {NIVEAUX.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
          </select>
          <select value={matiere} onChange={e => setMatiere(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm">
            {matieresDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input type="datetime-local" value={dateHeure} onChange={e => setDateHeure(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm" />
          <button onClick={planifier} disabled={loading} className="w-full bg-brand text-white rounded-lg py-2 text-sm font-semibold hover:bg-brand-dark disabled:opacity-50">
            {loading ? 'Création...' : 'Planifier (lien visio généré auto.)'}
          </button>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-3">
          <h2 className="font-bold">Mes classes virtuelles</h2>
          {classes.length === 0 ? (
            <p className="text-ink/60 text-sm">Aucune classe planifiée.</p>
          ) : classes.map(c => (
            <div key={c._id} className="bg-white rounded-xl border border-ink/10 p-4">
              <p className="font-semibold">{c.titre}</p>
              <p className="text-sm text-ink/60">{c.matiere} · {niveauLabel(c.niveau)} · {new Date(c.dateHeure).toLocaleString('fr-FR')}</p>
              <a href={c.lienVisio} target="_blank" rel="noreferrer" className="text-sm text-brand font-semibold">Lien de la salle →</a>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="font-bold">Mes réservations (créneaux avec élèves)</h2>
          {reservations.length === 0 ? (
            <p className="text-ink/60 text-sm">Aucune réservation pour l'instant.</p>
          ) : reservations.map(r => (
            <div key={r._id} className="bg-white rounded-xl border border-ink/10 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{r.matiere} · {niveauLabel(r.niveau)}</p>
                <p className="text-sm text-ink/60">
                  {new Date(r.dateHeure).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })} — {r.mode === 'en_ligne' ? 'En ligne' : 'Présentiel'}
                </p>
                {r.lienVisio && <a href={r.lienVisio} target="_blank" rel="noreferrer" className="text-sm text-brand font-semibold">Rejoindre la visio →</a>}
              </div>
              <span className="text-xs font-semibold bg-sand px-2.5 py-1 rounded-full capitalize shrink-0">{r.statut.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
