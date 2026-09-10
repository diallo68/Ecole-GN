'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Bell, MessageCircle, UserCog, BookOpen, Video, PenLine, Heart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import DashboardShell, { type DashboardNavItem } from '@/components/DashboardShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    if (user?.role === 'admin') router.replace('/admin'); // le back-office admin vit à part
  }, [user, isLoggedIn, router]);

  if (!user || user.role === 'admin') return null;

  const items: DashboardNavItem[] = [
    { href: '/dashboard', label: 'Accueil', icon: Home },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageCircle },
  ];
  // Même bug que le tableau de bord (voir ParentHome) : un parent tombait
  // dans le "else" et se voyait proposer "Mes cours"/"Mes exercices",
  // propres à un compte élève. Un parent n'a rien de propre à lui ici —
  // "Mes enfants" vit dans /profil, déjà accessible depuis le menu du compte.
  if (user.role === 'repetiteur') {
    items.push(
      { href: '/dashboard/repetiteur/profil', label: 'Mon profil', icon: UserCog },
      { href: '/dashboard/repetiteur/contenu', label: 'Mon contenu', icon: BookOpen },
      { href: '/dashboard/repetiteur/classes', label: 'Classes virtuelles', icon: Video },
    );
  } else if (user.role === 'eleve') {
    items.push(
      { href: '/dashboard/eleve/cours', label: 'Mes cours', icon: BookOpen },
      { href: '/dashboard/eleve/exercices', label: 'Mes exercices', icon: PenLine },
      { href: '/dashboard/eleve/classes', label: 'Classes virtuelles', icon: Video },
      { href: '/dashboard/eleve/favoris', label: 'Mes favoris', icon: Heart },
    );
  }

  return <DashboardShell items={items}>{children}</DashboardShell>;
}
