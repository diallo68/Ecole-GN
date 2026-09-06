'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuthStore();

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-ink/10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink">
          <span className="w-8 h-8 rounded-lg bg-brand text-white grid place-items-center shrink-0">
            <BookOpen size={16} strokeWidth={2.4} />
          </span>
          Gandal
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium text-ink/70">
          <Link href="/repetiteurs" className="hover:text-ink transition-colors">Enseignants</Link>
          <Link href="/quiz" className="hover:text-ink transition-colors">Quiz</Link>
          <Link href="/#avis" className="hover:text-ink transition-colors">Avis</Link>
          {isLoggedIn() ? (
            <>
              {user?.role === 'admin' ? (
                <Link href="/admin" className="hover:text-ink transition-colors">Back-office</Link>
              ) : (
                <Link href="/dashboard" className="hover:text-ink transition-colors">Mon espace</Link>
              )}
              <button onClick={logout} className="text-ink/50 hover:text-flag transition-colors">Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-ink transition-colors">Connexion</Link>
              <Link href="/register" className="bg-ink text-white px-5 py-2.5 rounded-full font-semibold hover:bg-stone-800 transition-colors shadow-sm">Inscription</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
