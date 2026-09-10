import type { Metadata } from 'next';
import QuizPlayClient from './QuizPlayClient';
import { niveauLabel } from '@/lib/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gandall.net/api';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/quiz/${params.id}`, { next: { revalidate: 300 } });
    if (!res.ok) return { title: 'Quiz' };
    const { quiz } = await res.json();
    const titre = `${quiz.titre} · ${quiz.matiere} ${niveauLabel(quiz.niveau)}`;
    const description = `Quiz gratuit de ${quiz.matiere} pour le niveau ${niveauLabel(quiz.niveau)} : teste tes connaissances sur Gandal.`;
    return { title: titre, description, openGraph: { title: titre, description } };
  } catch {
    return { title: 'Quiz' };
  }
}

export default function Page() {
  return <QuizPlayClient />;
}
