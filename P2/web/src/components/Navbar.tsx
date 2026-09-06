'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuthStore();

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold text-brand">Gandal</Link>

        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/repetiteurs" className="hover:text-brand">Répétiteurs</Link>
          <Link href="/quiz" className="hover:text-brand">Quiz</Link>
          {isLoggedIn() ? (
            <>
              <Link href="/dashboard" className="hover:text-brand">Mon espace</Link>
              <button onClick={logout} className="text-slate-500 hover:text-red-600">Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand">Connexion</Link>
              <Link href="/register" className="bg-brand text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Inscription</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
