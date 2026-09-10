'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

// Trois variantes sémantiques (rapport_gandall.md, design system) : avant,
// les CTA de l'app mélangeaient bg-brand/bg-ink, rounded-lg/rounded-full et
// des paddings différents selon la page, sans hiérarchie prévisible.
// - primary   : l'action principale d'un écran (une seule à la fois, idéalement)
// - secondary : action alternative, moins engageante (contour, pas de fond)
// - ghost     : action tertiaire, texte seul (Réessayer, Retour...)
// Rayon 12px (rounded-xl) partout, dans la fourchette 10-12px recommandée
// pour les contrôles — les grands CTA de l'accueil étaient jusqu'ici en
// rounded-2xl (24px), plus proche d'une pilule que d'un bouton standard.
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark disabled:opacity-50',
  secondary: 'bg-white text-ink border border-ink/15 hover:border-ink/30 disabled:opacity-50',
  ghost: 'bg-transparent text-ink-muted hover:text-ink disabled:opacity-40',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-2 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2',
};

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  className?: string;
  children: React.ReactNode;
}

type AsButton = ButtonOwnProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> & { href?: undefined };
type AsLink = ButtonOwnProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps | 'href'> & { href: string };

export default function Button(props: AsButton | AsLink) {
  const {
    variant = 'primary', size = 'md', fullWidth, loading, loadingLabel,
    icon: Icon, iconPosition = 'right', className = '', children, ...rest
  } = props;

  const classes = [
    'inline-flex min-h-11 items-center justify-center rounded-xl font-semibold transition-colors',
    'disabled:cursor-not-allowed',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  const iconSize = size === 'lg' ? 17 : size === 'sm' ? 13 : 15;
  const content = (
    <>
      {Icon && iconPosition === 'left' && !loading && <Icon size={iconSize} />}
      {loading ? (loadingLabel || 'Chargement...') : children}
      {Icon && iconPosition === 'right' && !loading && <Icon size={iconSize} />}
    </>
  );

  if ('href' in props && props.href) {
    const { href, ...anchorRest } = rest as Omit<AsLink, keyof ButtonOwnProps>;
    return <Link href={href} className={classes} {...anchorRest}>{content}</Link>;
  }

  const buttonRest = rest as Omit<AsButton, keyof ButtonOwnProps>;
  return (
    <button {...buttonRest} className={classes} disabled={loading || buttonRest.disabled} aria-busy={loading || undefined}>
      {content}
    </button>
  );
}
