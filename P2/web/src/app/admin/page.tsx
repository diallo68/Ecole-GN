'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Le back-office n'a pas encore de tableau de bord dédié — redirige vers la
// modération des répétiteurs, la tâche admin la plus fréquente au démarrage.
export default function AdminHomePage() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/repetiteurs'); }, [router]);
  return null;
}
