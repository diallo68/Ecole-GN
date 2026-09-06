'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuthStore();

  return (
    <header className="bg-white/90 backdrop-blur sticky top-0 z-20 border-b border-black/5">
      <div className="h-1 flex">
        <div className="flex-1 bg-flag" />
        <div className="flex-1 bg-accent" />
        <div className="flex-1 bg-brand" />
      </div>
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-brand-dark">
          <span className="w-8 h-8 rounded-lg bg-brand text-white grid place-items-center text-sm font-black">G</span>
          Gandal
        </Link>

        <nav className="flex items-center gap-5 text-sm font-semibold text-[#14201b]/80">
          <Link href="/repetiteurs" className="hover:text-brand transition-colors">Enseignants</Link>
          <Link href="/quiz" className="hover:text-brand transition-colors">Quiz</Link>
          {isLoggedIn() ? (
            <>
              {user?.role === 'admin' ? (
                <Link href="/admin" className="hover:text-brand transition-colors">Back-office</Link>
              ) : (
                <Link href="/dashboard" className="hover:text-brand transition-colors">Mon espace</Link>
              )}
              <button onClick={logout} className="text-[#14201b]/50 hover:text-flag transition-colors">Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand transition-colors">Connexion</Link>
              <Link href="/register" className="bg-brand text-white px-4 py-2 rounded-full hover:bg-brand-dark transition-colors shadow-sm">Inscription</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
