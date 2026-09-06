'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, ClipboardList, UserRound, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import DashboardShell, { type DashboardNavItem } from '@/components/DashboardShell';

const items: DashboardNavItem[] = [
  { href: '/admin', label: 'Aperçu', icon: LayoutDashboard },
  { href: '/admin/utilisateurs', label: 'Inscrits', icon: UserRound },
  { href: '/admin/repetiteurs', label: 'Enseignants', icon: Users },
  { href: '/admin/quiz', label: 'Quiz', icon: ClipboardList },
  { href: '/admin/messagerie', label: 'Messagerie', icon: MessageCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn() || user?.role !== 'admin') router.push('/');
  }, [user, isLoggedIn, router]);

  if (!user || user.role !== 'admin') return null;

  return <DashboardShell items={items}>{children}</DashboardShell>;
}
