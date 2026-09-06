'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn() || user?.role !== 'admin') router.push('/');
  }, [user, isLoggedIn, router]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div>
      <div className="flex gap-3 mb-6 border-b border-ink/10 pb-3">
        <Link href="/admin/repetiteurs" className="text-sm font-semibold hover:text-brand">Modération enseignants</Link>
        <Link href="/admin/quiz" className="text-sm font-semibold hover:text-brand">Quiz</Link>
      </div>
      {children}
    </div>
  );
}
