'use client';

import { AlertCircle } from 'lucide-react';

// Bloc réutilisable pour une panne réellement identifiée (réseau, 5xx...) —
// à ne jamais confondre avec un état "aucune donnée" : ce composant ne
// s'affiche qu'après une réponse API en échec, jamais par défaut pendant
// le chargement ou faute de résultats.
export default function ErrorState({ message = 'Une erreur est survenue.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="text-center py-8">
      <AlertCircle size={22} className="mx-auto text-flag mb-2" strokeWidth={1.75} />
      <p className="text-sm text-ink-muted mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-semibold text-brand hover:underline">Réessayer</button>
      )}
    </div>
  );
}
