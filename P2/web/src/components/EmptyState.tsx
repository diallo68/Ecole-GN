'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

// Sœur d'ErrorState : une liste vide n'est pas une panne, mais mérite la
// même clarté (icône, message factuel, action réelle si elle existe — pas
// de CTA artificiel juste pour occuper l'espace). Textes/CTA repris de
// rapport_gandall.md (§ Empty states proposés) là où le contexte s'y prête.
interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
  className?: string;
}

export default function EmptyState({ icon: Icon, message, ctaLabel, ctaHref, onCta, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <Icon size={22} className="mx-auto text-ink/25 mb-2" strokeWidth={1.75} />
      <p className="text-sm text-ink-muted">{message}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="inline-block mt-3 text-sm font-semibold text-brand hover:underline">{ctaLabel}</Link>
      )}
      {ctaLabel && onCta && !ctaHref && (
        <button onClick={onCta} className="mt-3 text-sm font-semibold text-brand hover:underline">{ctaLabel}</button>
      )}
    </div>
  );
}
