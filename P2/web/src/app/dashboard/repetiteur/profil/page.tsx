'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { repetiteurApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { MATIERES, CYCLES, niveauxDuCycle } from '@/lib/constants';
import type { Niveau } from '@/types';

export default function RepetiteurProfilPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [bio, setBio] = useState('');
  const [matieres, setMatieres] = useState<string[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [tarifHoraire, setTarifHoraire] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'repetiteur') { router.push('/dashboard'); return; }
    setBio(user.repetiteur?.bio || '');
    setMatieres(user.repetiteur?.matieres || []);
    setNiveaux(user.repetiteur?.niveaux || []);
    setTarifHoraire(user.repetiteur?.tarifHoraire?.toString() || '');
    setDisponible(user.repetiteur?.disponible ?? true);
  }, [user, router]);

  const toggle = <T,>(arr: T[], val: T, setArr: (v: T[]) => void) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const save = async () => {
    setLoading(true);
    try {
      await repetiteurApi.updateMyProfile({
        bio, matieres, niveaux,
        tarifHoraire: tarifHoraire ? Number(tarifHoraire) : undefined,
        disponible,
      });
      if (user) {
        setUser({
          ...user,
          repetiteur: {
            ...user.repetiteur!,
            bio, matieres, niveaux,
            tarifHoraire: tarifHoraire ? Number(tarifHoraire) : undefined,
            disponible,
          },
        });
      }
      toast.success('Profil mis à jour !');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'repetiteur') return null;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl border border-ink/10 p-6">
      <h1 className="text-xl font-bold mb-4">Mon profil enseignant</h1>

      {!user.repetiteur?.valide && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-4 py-3 mb-4 text-sm">
          En attente de validation par l'équipe Gandal.
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Présentation</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} maxLength={1000}
            className="w-full border border-ink/15 rounded-lg px-3 py-2" placeholder="Présente-toi à tes futurs élèves..." />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Matières enseignées</label>
          <div className="flex flex-wrap gap-2">
            {MATIERES.map(m => (
              <button key={m} type="button" onClick={() => toggle(matieres, m, setMatieres)}
                className={`text-sm px-3 py-1.5 rounded-full border ${matieres.includes(m) ? 'bg-brand text-white border-brand' : 'border-ink/15'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Classes enseignées</label>
          <div className="space-y-2">
            {CYCLES.map(cycle => (
              <div key={cycle.value}>
                <p className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1">{cycle.label}</p>
                <div className="flex flex-wrap gap-2">
                  {niveauxDuCycle(cycle.value).map(n => (
                    <button key={n.value} type="button" onClick={() => toggle(niveaux, n.value, setNiveaux)}
                      className={`text-sm px-3 py-1.5 rounded-full border ${niveaux.includes(n.value) ? 'bg-brand text-white border-brand' : 'border-ink/15'}`}>
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Tarif horaire (GNF)</label>
          <input type="number" value={tarifHoraire} onChange={e => setTarifHoraire(e.target.value)}
            className="w-full border border-ink/15 rounded-lg px-3 py-2" placeholder="Ex: 50000" />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={disponible} onChange={e => setDisponible(e.target.checked)} />
          Disponible pour de nouvelles réservations
        </label>

        <button onClick={save} disabled={loading} className="w-full bg-brand text-white rounded-lg py-2 font-semibold hover:bg-brand-dark disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
