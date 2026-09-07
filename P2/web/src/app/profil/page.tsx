'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { GraduationCap } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ALL_CITIES } from '@/lib/constants';
import FileUploadField from '@/components/FileUploadField';

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
        <p className="text-ink/60 mb-4">Connecte-toi pour accéder à ton profil.</p>
        <Link href="/login" className="bg-brand text-white rounded-lg px-5 py-2.5 font-semibold hover:bg-brand-dark">Se connecter</Link>
      </div>
    );
  }

  const initiales = `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-1">Mon profil</h1>
      <p className="text-ink/50 text-sm mb-6">Tes informations personnelles.</p>

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
            <span className="text-xs font-semibold text-ink/40 uppercase tracking-wide">{ROLE_LABELS[user.role] || user.role}</span>
            <div className="mt-1">
              <FileUploadField value={photo} onChange={setPhoto} accept="image/*" label="Changer la photo" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
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
          <input value={user.email} disabled className="w-full border border-ink/15 rounded-lg px-3 py-2 bg-sand/50 text-ink/50" />
          <p className="text-xs text-ink/40 mt-1">L'email ne peut pas être modifié (identifiant de connexion).</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
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
          <label className="block text-sm font-semibold mb-1">Pièce d'identité <span className="text-ink/40 font-normal">(optionnel)</span></label>
          <FileUploadField value={pieceIdentite} onChange={setPieceIdentite} accept="image/*,.pdf" label="Ajouter une pièce d'identité" />
        </div>

        <button onClick={save} disabled={loading} className="w-full bg-brand text-white rounded-lg py-2.5 font-semibold hover:bg-brand-dark disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
