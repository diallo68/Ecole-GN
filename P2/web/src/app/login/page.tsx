'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      login(data.user, data.token, data.refreshToken);
      toast.success('Connecté !');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl border border-ink/10 overflow-hidden">
      {/* Titre de page pour la structure/lecteur d'écran — les onglets ci-dessous
          jouent déjà ce rôle visuellement, un second H1 visible ferait doublon. */}
      <h1 className="sr-only">Se connecter à Gandal</h1>
      <div className="flex text-sm font-bold text-center border-b border-ink/10">
        <span className="flex-1 py-3.5 text-brand border-b-2 border-brand">Se connecter</span>
        <Link href="/register" className="flex-1 py-3.5 text-ink-muted hover:text-ink transition-colors">S&apos;inscrire</Link>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="login-email" className="sr-only">Email</label>
            <input id="login-email" type="email" required placeholder="Email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-ink/15 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label htmlFor="login-password" className="sr-only">Mot de passe</label>
            <input id="login-password" type="password" required placeholder="Mot de passe" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-ink/15 rounded-lg px-3 py-2" />
          </div>
          <Button type="submit" fullWidth loading={loading} loadingLabel="Connexion...">Se connecter</Button>
        </form>
        <p className="text-center text-sm text-ink-muted mt-4">
          Pas de compte ? <Link href="/register" className="text-brand font-bold hover:underline">S&apos;inscrire gratuitement</Link>
        </p>
      </div>
    </div>
  );
}
