'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ChevronDown, LayoutDashboard, LogOut, Menu, UserCircle, X, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

// Navigation globale — uniquement les destinations communes à tout le site.
// Les filtres enseignants (matière/tarif/ville/disponibilité) ne vivent plus
// ici : ils n'ont de sens que sur /repetiteurs et y vivent maintenant
// directement (voir TrouverEnseignant.tsx), au lieu d'apparaître y compris
// sur la page de connexion ou le catalogue Quiz.
const NAV_LINKS = [
  { href: '/repetiteurs', label: 'Enseignants' },
  { href: '/quiz', label: 'Quiz' },
];

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuthStore();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const connecte = isLoggedIn() && !!user;

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Gandal — Accueil" className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink shrink-0">
          <span className="w-8 h-8 rounded-lg bg-brand text-white grid place-items-center shrink-0">
            <BookOpen size={16} strokeWidth={2.4} />
          </span>
          <span className="hidden sm:inline">Gandal</span>
        </Link>

        {/* Desktop/tablette : liens et compte directement dans la barre */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-ink/70 shrink-0">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? 'page' : undefined}
              className={`hover:text-ink transition-colors ${pathname === l.href ? 'text-ink font-semibold' : ''}`}>
              {l.label}
            </Link>
          ))}
          {connecte ? (
            <UserMenu prenom={user!.prenom} nom={user!.nom} isAdmin={user!.role === 'admin'} onLogout={logout} />
          ) : (
            <Link href="/login" className="bg-ink text-white px-5 py-2.5 rounded-full font-semibold hover:bg-stone-800 transition-colors shadow-sm">Connexion</Link>
          )}
        </nav>

        {/* Mobile : un seul bouton Menu — tout le reste vit dans le tiroir */}
        <button onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu" aria-expanded={menuOpen} aria-controls="mobile-menu"
          className="md:hidden flex items-center justify-center w-10 h-10 -mr-2 text-ink/70 hover:text-ink">
          <Menu size={22} />
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} pathname={pathname}
        connecte={connecte} user={user} onLogout={logout} />
    </header>
  );
}

function MobileMenu({ open, onClose, pathname, connecte, user, onLogout }: {
  open: boolean; onClose: () => void; pathname: string;
  connecte: boolean; user: { prenom: string; nom?: string; role: string } | null; onLogout: () => void;
}) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (open) {
      triggerFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      closeBtnRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); (triggerFocusRef.current as HTMLElement | null)?.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const linkClass = (href: string) =>
    `flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
      pathname === href ? 'bg-brand-light text-brand-dark' : 'text-ink/80 hover:bg-sand'
    }`;

  return (
    <div className="md:hidden fixed inset-0 z-40">
      <button aria-label="Fermer le menu" onClick={onClose} className="absolute inset-0 bg-ink/30" />
      <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu"
        className="absolute inset-y-0 right-0 w-72 max-w-[85vw] h-dvh bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 h-16 border-b border-ink/10 shrink-0">
          <span className="font-bold text-ink">Menu</span>
          <button ref={closeBtnRef} onClick={onClose} aria-label="Fermer le menu" className="w-9 h-9 grid place-items-center text-ink/60 hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={onClose} aria-current={pathname === l.href ? 'page' : undefined} className={linkClass(l.href)}>
              {l.label === 'Quiz' && <Zap size={16} />} {l.label}
            </Link>
          ))}
        </div>

        <div className="border-t border-ink/10 p-3 shrink-0">
          {connecte && user ? (
            <>
              <div className="px-4 py-2 mb-1">
                <p className="font-semibold text-ink text-sm truncate">{user.prenom} {user.nom}</p>
              </div>
              <Link href="/profil" onClick={onClose} className={linkClass('/profil')}>
                <UserCircle size={16} /> Mon profil
              </Link>
              <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={onClose}
                className={linkClass(user.role === 'admin' ? '/admin' : '/dashboard')}>
                <LayoutDashboard size={16} /> {user.role === 'admin' ? 'Tableau de bord' : 'Mon espace'}
              </Link>
              <button onClick={() => { onClose(); onLogout(); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-flag hover:bg-flag/5">
                <LogOut size={16} /> Déconnexion
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={onClose} className="text-center bg-ink text-white rounded-xl py-3 font-semibold hover:bg-stone-800">Connexion</Link>
              <Link href="/register" onClick={onClose} className="text-center border border-ink/15 rounded-xl py-3 font-semibold text-ink hover:border-ink/30">Créer un compte</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserMenu({ prenom, nom, isAdmin, onLogout }: { prenom: string; nom?: string; isAdmin: boolean; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const initiales = `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button ref={btnRef} onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open} aria-controls="user-menu"
        className="flex items-center gap-2 hover:text-ink transition-colors">
        <span className="w-7 h-7 rounded-full bg-brand text-white text-xs font-bold grid place-items-center shrink-0">
          {initiales || <BookOpen size={12} />}
        </span>
        <span className="hidden sm:inline">{prenom}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div id="user-menu" role="menu" className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-ink/10 shadow-lg py-1.5 z-30">
          <div className="px-3.5 py-2 border-b border-ink/5">
            <p className="font-semibold text-ink text-sm truncate">{prenom} {nom}</p>
          </div>
          <Link href="/profil" role="menuitem" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink/70 hover:bg-sand transition-colors">
            <UserCircle size={15} /> Mon profil
          </Link>
          <Link href={isAdmin ? '/admin' : '/dashboard'} role="menuitem" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink/70 hover:bg-sand transition-colors">
            <LayoutDashboard size={15} /> {isAdmin ? 'Tableau de bord' : 'Mon espace'}
          </Link>
          <button role="menuitem" onClick={() => { setOpen(false); onLogout(); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-flag hover:bg-flag/5 transition-colors">
            <LogOut size={15} /> Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
