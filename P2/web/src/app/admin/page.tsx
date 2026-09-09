'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, GraduationCap, UserCheck, Clock, CalendarCheck,
  ClipboardList, ArrowRight, ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';
import StatCard from '@/components/StatCard';
import ErrorState from '@/components/ErrorState';
import type { AdminStats } from '@/types';

export default function AdminOverviewPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  // Avant ce fix, une panne laissait "Chargement des statistiques..."
  // affiché indéfiniment, sans distinction avec un chargement normal.
  const [error, setError] = useState(false);

  const charger = () => {
    setError(false);
    adminApi.stats().then(setStats).catch(() => setError(true));
  };

  useEffect(charger, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Bonjour {user?.prenom} 👋</h1>
        <p className="text-ink-muted text-sm">Aperçu de la plateforme Gandal</p>
      </div>

      {error ? (
        <ErrorState message="Impossible de charger les statistiques." onRetry={charger} />
      ) : !stats ? (
        <p className="text-sm text-ink-muted">Chargement des statistiques...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Users} label="Élèves inscrits" value={stats.eleves} />
            <StatCard icon={Users} label="Parents inscrits" value={stats.parents} />
            <StatCard icon={GraduationCap} label="Enseignants validés" value={stats.enseignants.valides} />
            <StatCard icon={Clock} label="Enseignants en attente" value={stats.enseignants.enAttente} tone={stats.enseignants.enAttente > 0 ? 'accent' : 'brand'} />
            <StatCard icon={CalendarCheck} label="Réservations (total)" value={stats.reservations.total} />
            <StatCard icon={UserCheck} label="Réservations confirmées" value={stats.reservations.confirmees} />
            <StatCard icon={ClipboardList} label="Quiz publiés" value={stats.quiz.publies} />
            <StatCard icon={ClipboardList} label="Quiz (brouillons inclus)" value={stats.quiz.total} />
          </div>

          {stats.enseignants.enAttente > 0 && (
            <div className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[#8a6400]">
                {stats.enseignants.enAttente} enseignant{stats.enseignants.enAttente > 1 ? 's' : ''} en attente de validation.
              </p>
              <Link href="/admin/repetiteurs" className="text-sm font-bold text-[#8a6400] hover:underline shrink-0">Modérer →</Link>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <QuickAction href="/admin/repetiteurs" icon={ShieldCheck} label="Modération enseignants" desc="Valider ou suspendre des profils" />
        <QuickAction href="/admin/quiz" icon={ClipboardList} label="Gestion des quiz" desc="Créer, publier, dépublier" />
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, desc }: { href: string; icon: LucideIcon; label: string; desc: string }) {
  return (
    <Link href={href} className="bg-white rounded-2xl border border-ink/10 p-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-brand-light text-brand-dark grid place-items-center shrink-0">
        <Icon size={19} strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink text-sm">{label}</p>
        <p className="text-xs text-ink-muted truncate">{desc}</p>
      </div>
      <ArrowRight size={16} className="text-ink/30 group-hover:text-brand transition-colors shrink-0" />
    </Link>
  );
}
