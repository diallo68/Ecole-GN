'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Role, Niveau } from '@/types';

type Step = 'infos' | 'otp';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [step, setStep] = useState<Step>('infos');
  const [loading, setLoading] = useState(false);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState<Role>('eleve');
  const [niveau, setNiveau] = useState<Niveau>('college');
  const [code, setCode] = useState('');

  const sendCode = async () => {
    if (!prenom || !email || password.length < 8) {
      toast.error('Remplis tous les champs (mot de passe : 8 caractères min.)');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.sendCode({ email, prenom });
      if (res.sendFailed) {
        toast.error("L'envoi du code a échoué. Réessaie dans un instant.");
        return;
      }
      toast.success('Code envoyé par email !');
      setStep('otp');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndRegister = async () => {
    if (code.length !== 6) { toast.error('Entre le code à 6 chiffres'); return; }
    setLoading(true);
    try {
      const data = await authApi.register({
        prenom, nom, email, password, city, code, role,
        ...(role === 'eleve' ? { niveau } : {}),
      });
      login(data.user, data.token, data.refreshToken);
      toast.success('Compte créé !');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl border border-slate-200 p-6">
      <h1 className="text-xl font-bold mb-4">Inscription</h1>

      {step === 'infos' ? (
        <div className="space-y-3">
          <input placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <input placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <input type="password" placeholder="Mot de passe (8 caractères min.)" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <input placeholder="Ville" value={city} onChange={e => setCity(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2" />

          <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full border border-slate-300 rounded-lg px-3 py-2">
            <option value="eleve">Élève</option>
            <option value="parent">Parent</option>
            <option value="repetiteur">Répétiteur</option>
          </select>

          {role === 'eleve' && (
            <select value={niveau} onChange={e => setNiveau(e.target.value as Niveau)} className="w-full border border-slate-300 rounded-lg px-3 py-2">
              <option value="primaire">Primaire</option>
              <option value="college">Collège</option>
              <option value="lycee">Lycée</option>
            </select>
          )}

          <button onClick={sendCode} disabled={loading} className="w-full bg-brand text-white rounded-lg py-2 font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Envoi...' : 'Recevoir mon code'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Un code à 6 chiffres a été envoyé à <strong>{email}</strong>.</p>
          <input placeholder="Code à 6 chiffres" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-center text-lg tracking-widest" />
          <button onClick={verifyAndRegister} disabled={loading} className="w-full bg-brand text-white rounded-lg py-2 font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Vérification...' : 'Valider et créer mon compte'}
          </button>
          <button onClick={() => setStep('infos')} className="w-full text-sm text-slate-500 hover:underline">← Modifier mes infos</button>
        </div>
      )}
    </div>
  );
}
