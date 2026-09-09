'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { GraduationCap, UserPlus, X } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ALL_CITIES, niveauLabel } from '@/lib/constants';
import FileUploadField from '@/components/FileUploadField';
import type { Enfant } from '@/types';

const ROLE_LABELS: Record<string, string> = { eleve: 'Élève', parent: 'Parent', repetiteur: 'Enseignant', admin: 'Admin' };

export default function ProfilPage() {
  const { user, setUser } = useAuthStore();
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [photo, setPhoto] = useState('');
  const [pieceIdentite, setPieceIdentite] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setPrenom(user.prenom || '');
    setNom(user.nom || '');
    setAge(user.age?.toString() || '');
    setPhone(user.phone || '');
    setCity(user.city || '');
    setPhoto(user.photo || '');
    setPieceIdentite(user.pieceIdentite || '');
  }, [user]);

  const save = async () => {
    if (!prenom.trim()) { toast.error('Le prénom est obligatoire'); return; }
    setLoading(true);
    try {
      const { user: updated } = await authApi.updateMe({
        prenom, nom, phone, city,
        age: age ? Number(age) : null,
        photo: photo || undefined,
        pieceIdentite: pieceIdentite || undefined,
      });
      setUser(updated);
      toast.success('Profil mis à jour !');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <p className="text-ink-muted mb-4">Connecte-toi pour accéder à ton profil.</p>
        <Link href="/login" className="bg-brand text-white rounded-lg px-5 py-2.5 font-semibold hover:bg-brand-dark">Se connecter</Link>
      </div>
    );
  }


  const initiales = `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-1">Mon profil</h1>
      <p className="text-ink-muted text-sm mb-6">Tes informations personnelles.</p>

      {user.role === 'repetiteur' && (
        <Link href="/dashboard/repetiteur/profil"
          className="flex items-center gap-2.5 bg-brand-light text-brand-dark rounded-xl px-4 py-3 mb-6 text-sm font-semibold hover:bg-brand-light/70 transition-colors">
          <GraduationCap size={16} />
          Gérer ton profil enseignant (bio, matières, tarif, disponibilités) →
        </Link>
      )}

      <div className="bg-white rounded-2xl border border-ink/10 p-6 space-y-5">
        <div className="flex items-center gap-4">
          {photo ? (
            <img src={photo} alt="" className="w-16 h-16 rounded-full object-cover border border-ink/10" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-sand text-brand-dark font-bold text-xl grid place-items-center border border-ink/10 shrink-0">
              {initiales || '?'}
            </div>
          )}
          <div className="flex-1">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide">{ROLE_LABELS[user.role] || user.role}</span>
            <div className="mt-1">
              <FileUploadField value={photo} onChange={setPhoto} accept="image/*" label="Changer la photo" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Prénom</label>
            <input value={prenom} onChange={e => setPrenom(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Nom</label>
            <input value={nom} onChange={e => setNom(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input value={user.email} disabled className="w-full border border-ink/15 rounded-lg px-3 py-2 bg-sand/50 text-ink-muted" />
          <p className="text-xs text-ink-muted mt-1">L'email ne peut pas être modifié (identifiant de connexion).</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Téléphone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="622 00 00 00" className="w-full border border-ink/15 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Âge</label>
            <input type="number" min={3} max={120} value={age} onChange={e => setAge(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Ville</label>
          <select value={city} onChange={e => setCity(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2">
            <option value="">Choisir une ville...</option>
            {ALL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Pièce d'identité <span className="text-ink-muted font-normal">(optionnel)</span></label>
          <FileUploadField value={pieceIdentite} onChange={setPieceIdentite} accept="image/*,.pdf" label="Ajouter une pièce d'identité" />
        </div>

        <button onClick={save} disabled={loading} className="w-full bg-brand text-white rounded-lg py-2.5 font-semibold hover:bg-brand-dark disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      {user.role === 'parent' && <MesEnfants />}
    </div>
  );
}

// ── Enfants liés au compte parent — nécessaire pour pouvoir réserver une
// session (le formulaire de réservation demande de choisir parmi cette liste).
function MesEnfants() {
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const charger = () => authApi.mesEnfants().then(d => setEnfants(d.enfants)).catch(() => {}).finally(() => setLoaded(true));

  useEffect(() => { charger(); }, []);

  const ajouter = async () => {
    if (!email.trim()) { toast.error("Entre l'email de l'enfant"); return; }
    setLoading(true);
    try {
      await authApi.ajouterEnfant(email.trim());
      setEmail('');
      toast.success('Enfant ajouté !');
      charger();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const retirer = async (id: string) => {
    try {
      await authApi.retirerEnfant(id);
      setEnfants(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-ink/10 p-6">
      <h2 className="font-bold text-ink mb-1">Mes enfants</h2>
      <p className="text-sm text-ink-muted mb-4">Lie le compte de ton enfant au tien pour pouvoir réserver des séances pour lui.</p>

      {loaded && enfants.length === 0 && (
        <p className="text-sm text-ink-muted mb-4">Aucun enfant lié pour le moment.</p>
      )}

      {enfants.length > 0 && (
        <ul className="space-y-2 mb-4">
          {enfants.map(e => (
            <li key={e._id} className="flex items-center justify-between bg-sand/50 rounded-lg px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-ink">{e.prenom} {e.nom}</p>
                <p className="text-xs text-ink-muted">{e.eleve?.niveau ? niveauLabel(e.eleve.niveau) : e.email}</p>
              </div>
              <button onClick={() => retirer(e._id)} aria-label={`Retirer ${e.prenom}`} className="text-ink-muted hover:text-flag p-1">
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <label htmlFor="email-enfant" className="sr-only">Email du compte élève de ton enfant</label>
        <input id="email-enfant" type="email" placeholder="Email du compte élève de ton enfant" value={email} onChange={e => setEmail(e.target.value)}
          className="flex-1 border border-ink/15 rounded-lg px-3 py-2 text-sm" />
        <button onClick={ajouter} disabled={loading} className="flex items-center gap-1.5 bg-ink text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-stone-800 disabled:opacity-50">
          <UserPlus size={15} /> Ajouter
        </button>
      </div>
      <p className="text-xs text-ink-muted mt-2">Ton enfant doit déjà avoir créé son propre compte élève sur Gandal.</p>
    </div>
  );
}
