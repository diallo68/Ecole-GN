'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronDown, LayoutDashboard, LogOut, SlidersHorizontal, UserCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import FiltreEnseignantBar from './FiltreEnseignantBar';

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuthStore();
  const [filtresOpen, setFiltresOpen] = useState(false);

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink shrink-0">
          <span className="w-8 h-8 rounded-lg bg-brand text-white grid place-items-center shrink-0">
            <BookOpen size={16} strokeWidth={2.4} />
          </span>
          <span className="hidden sm:inline">Gandal</span>
        </Link>

        {/* Filtres enseignants — barre compacte visible sur toutes les pages (desktop) */}
        <div className="hidden lg:block">
          <FiltreEnseignantBar />
        </div>
        {/* Version mobile/tablette : bouton qui déplie les filtres */}
        <button onClick={() => setFiltresOpen(o => !o)}
          className="lg:hidden flex items-center gap-1.5 text-xs font-semibold text-ink/60 border border-ink/10 rounded-full px-3 py-1.5 shrink-0">
          <SlidersHorizontal size={13} /> Filtres
        </button>

        <nav className="flex items-center gap-5 text-sm font-medium text-ink/70 shrink-0">
          <Link href="/repetiteurs" className="hover:text-ink transition-colors">Enseignants</Link>
          {isLoggedIn() && user ? (
            <UserMenu prenom={user.prenom} nom={user.nom} isAdmin={user.role === 'admin'} onLogout={logout} />
          ) : (
            <Link href="/login" className="bg-ink text-white px-5 py-2.5 rounded-full font-semibold hover:bg-stone-800 transition-colors shadow-sm">Connexion</Link>
          )}
        </nav>
      </div>

      {filtresOpen && (
        <div className="lg:hidden border-t border-ink/10 px-4 py-3 bg-white">
          <FiltreEnseignantBar vertical />
        </div>
      )}
    </header>
  );
}

function UserMenu({ prenom, nom, isAdmin, onLogout }: { prenom: string; nom?: string; isAdmin: boolean; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const initiales = `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 hover:text-ink transition-colors">
        <span className="w-7 h-7 rounded-full bg-brand text-white text-xs font-bold grid place-items-center shrink-0">
          {initiales || <BookOpen size={12} />}
        </span>
        <span className="hidden sm:inline">{prenom}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-ink/10 shadow-lg py-1.5 z-30">
          <div className="px-3.5 py-2 border-b border-ink/5">
            <p className="font-semibold text-ink text-sm truncate">{prenom} {nom}</p>
          </div>
          <Link href="/profil" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink/70 hover:bg-sand transition-colors">
            <UserCircle size={15} /> Mon profil
          </Link>
          <Link href={isAdmin ? '/admin' : '/dashboard'} onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink/70 hover:bg-sand transition-colors">
            <LayoutDashboard size={15} /> {isAdmin ? 'Tableau de bord' : 'Mon espace'}
          </Link>
          <button onClick={() => { setOpen(false); onLogout(); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-flag hover:bg-flag/5 transition-colors">
            <LogOut size={15} /> Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
