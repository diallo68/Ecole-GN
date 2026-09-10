import type { Metadata } from 'next';
import RepetiteurDetailClient from './RepetiteurDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gandall.net/api';

// Titre/description génériques ("Enseignant · Gandal") si l'API ne répond
// pas ou que le profil est introuvable — jamais d'erreur qui casse la page.
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/repetiteurs/${params.id}`, { next: { revalidate: 300 } });
    if (!res.ok) return { title: 'Enseignant' };
    const { repetiteur } = await res.json();
    const matieres: string[] = repetiteur?.repetiteur?.matieres || [];
    const titre = `${repetiteur.prenom} ${repetiteur.nom}${matieres.length ? ` · ${matieres.join(', ')}` : ''}`;
    const description = `${repetiteur.prenom} ${repetiteur.nom}, enseignant${matieres.length ? ` en ${matieres.join(', ')}` : ''}${repetiteur.city ? ` à ${repetiteur.city}` : ''} sur Gandal.`;
    return {
      title: titre,
      description,
      openGraph: { title: titre, description, images: repetiteur.photo ? [repetiteur.photo] : undefined },
    };
  } catch {
    return { title: 'Enseignant' };
  }
}

export default function Page() {
  return <RepetiteurDetailClient />;
}
