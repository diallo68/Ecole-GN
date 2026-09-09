'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ArrowRight, Zap, MessageCircle, Sigma, Languages, Atom, FlaskConical, Leaf, Landmark, Map, HelpCircle, Search, CalendarCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { repetiteurApi, quizApi } from '@/lib/api';
import ErrorState from '@/components/ErrorState';
import Button from '@/components/Button';
import { niveauLabel, tarifLabel, CYCLES, niveauxDuCycle } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import type { Repetiteur, QuizSummary, Cycle, Niveau } from '@/types';

// Chargé en différé (pas au chargement initial de l'accueil) : le panneau
// n'est utilisé qu'après une interaction volontaire, ssr:false l'exclut du
// rendu serveur et de l'empaquetage JS initial de la page.
const AssistantWidget = dynamic(() => import('@/components/AssistantWidget'), { ssr: false });

const MATIERE_ICONS: Record<string, LucideIcon> = {
  'Mathématiques': Sigma,
  'Calcul & Problèmes': Sigma,
  'Français': Languages,
  'Physique': Atom,
  'Chimie': FlaskConical,
  'Biologie': Leaf,
  'Sciences': Leaf,
  'Histoire': Landmark,
  'Géographie': Map,
};

export default function HomePage() {
  const { user } = useAuthStore();
  const [repetiteurs, setRepetiteurs] = useState<Repetiteur[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [cycle, setCycle] = useState<Cycle | ''>('');
  const [niveau, setNiveau] = useState<Niveau | ''>('');
  // Une panne d'API ne doit pas ressembler à "aucune offre" — sans ceci, un
  // visiteur qui tombe sur un accueil vide pendant une panne réelle en
  // conclut à tort que Gandal n'a ni enseignant ni quiz.
  const [repetiteursError, setRepetiteursError] = useState(false);
  const [quizzesError, setQuizzesError] = useState(false);

  const chargerRepetiteurs = () => {
    setRepetiteursError(false);
    repetiteurApi.list({ limit: 4 }).then(d => setRepetiteurs(d.repetiteurs)).catch(() => setRepetiteursError(true));
  };
  useEffect(chargerRepetiteurs, []);

  // Pré-sélectionne le niveau de l'élève connecté, sans l'imposer (il peut changer).
  useEffect(() => {
    if (user?.eleve?.niveau) {
      const n = niveauxDuCycle('primaire').concat(niveauxDuCycle('college'), niveauxDuCycle('lycee')).find(x => x.value === user.eleve!.niveau);
      if (n) { setCycle(n.cycle); setNiveau(n.value); }
    }
  }, [user]);

  const chargerQuizzes = () => {
    setQuizzesError(false);
    quizApi.list({ niveau: niveau || undefined }).then(d => setQuizzes(d.quizzes.slice(0, 6))).catch(() => setQuizzesError(true));
  };
  useEffect(chargerQuizzes, [niveau]);

  return (
    <>
    {/* 80px entre sections sur toute la largeur rendait l'accueil très long
        à faire défiler sur mobile — espacement responsive (48/64/80px). */}
    <div className="space-y-12 md:space-y-16 lg:space-y-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-flag/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center gap-10 lg:gap-14 py-8 lg:py-12">
          <div className="w-full lg:w-[55%] flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink/5 border border-ink/10 text-sm font-medium text-ink-muted">
              <span className="w-2 h-2 rounded-full bg-brand" />
              Soutien scolaire du primaire au lycée
            </span>

            <h1 className="text-[2.25rem] md:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.08] text-ink">
              Le savoir à portée de main, <br className="hidden md:block" />
              <span className="text-brand">partout en Guinée.</span>
            </h1>

            <p className="text-base md:text-lg text-ink-muted leading-relaxed max-w-xl">
              Connectez-vous avec des enseignants de la Guinée, dont le profil est vérifié par notre équipe avant publication. Séances à domicile ou en ligne, adaptées au rythme de chaque élève.
            </p>

            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 mt-1">
              <Button href="/repetiteurs" size="lg" icon={ArrowRight} className="shadow-lg shadow-brand/20">
                Trouver un enseignant
              </Button>
              <Button href="/quiz" variant="secondary" size="lg" icon={Zap} iconPosition="left" className="shadow-sm">
                Faire un quiz gratuit
              </Button>
            </div>
          </div>

          <div className="w-full lg:w-[45%] relative h-[260px] lg:h-[340px] hidden md:block">
            <div className="absolute top-1/2 -left-6 w-20 h-20 bg-accent/10 rounded-full blur-xl -translate-y-1/2" />
            <div className="absolute inset-0 rounded-[2.5rem_0.75rem_2.5rem_0.75rem] overflow-hidden shadow-xl bg-ink/5">
              {/* priority : seule image au-dessus de la ligne de flottaison sur
                  desktop, candidate naturelle au LCP. sizes reflète sa largeur
                  réelle (45% de max-w-5xl à partir de lg, pleine largeur avant). */}
              <Image src="/accueil/hero.jpeg" alt="Séance de soutien scolaire Gandal à Fria, Guinée" fill priority
                sizes="(min-width: 1024px) 460px, (min-width: 768px) 400px, 100vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white/95 backdrop-blur-md border border-white p-4 rounded-2xl shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-light text-brand-dark grid place-items-center shrink-0 font-bold">✓</div>
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wider font-semibold">Vérification</p>
                <p className="text-sm font-bold text-ink leading-none mt-1">Profil vérifié par Gandal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche — le parcours réel : recherche, échange par
          message, demande de séance que l'enseignant confirme. Pas de
          paiement en ligne sur la plateforme à ce stade, donc on ne
          l'évoque pas ici. */}
      <section>
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">Comment ça marche</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Search, titre: 'Cherchez', texte: 'Filtrez par matière, classe et ville pour trouver un enseignant vérifié.' },
            { icon: MessageCircle, titre: 'Échangez', texte: 'Discutez directement avec l\'enseignant pour préciser vos besoins.' },
            { icon: CalendarCheck, titre: 'Réservez', texte: 'Demandez une séance, présentielle ou en ligne — l\'enseignant la confirme.' },
          ].map(({ icon: Icon, titre, texte }) => (
            <div key={titre} className="bg-white rounded-2xl border border-ink/10 p-5 text-center">
              <div className="w-11 h-11 mx-auto rounded-xl bg-brand-light text-brand-dark grid place-items-center mb-3">
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <p className="font-bold text-ink mb-1">{titre}</p>
              <p className="text-sm text-ink-muted">{texte}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Enseignants */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">Enseignants disponibles</h2>
            <p className="text-ink-muted text-sm mt-1">Des profils vérifiés, passionnés par la transmission du savoir.</p>
          </div>
          <Link href="/repetiteurs" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-brand font-semibold hover:text-brand-dark shrink-0">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        {repetiteursError ? (
          <ErrorState message="Impossible de charger les enseignants." onRetry={chargerRepetiteurs} />
        ) : repetiteurs.length === 0 ? (
          <p className="text-ink-muted text-sm">Aucun enseignant disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {repetiteurs.map(r => (
              <Link key={r._id} href={`/repetiteurs/${r._id}`} className="bg-white rounded-2xl border border-ink/10 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-sand text-brand-dark font-bold grid place-items-center border border-ink/10">
                    {r.prenom?.[0]}{r.nom?.[0]}
                  </div>
                  {r.repetiteur.ratingCount > 0 && (
                    <div className="flex items-center gap-1 bg-sand px-2 py-1 rounded-lg text-xs font-semibold">
                      ★ {r.repetiteur.avgRating}
                    </div>
                  )}
                </div>
                <p className="font-bold text-ink">{r.prenom} {r.nom}</p>
                <p className="text-sm text-ink-muted mt-0.5">{r.repetiteur.matieres?.join(', ')}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink/10">
                  <span className="text-xs text-ink-muted">{r.city}</span>
                  {r.repetiteur.tarif?.montant && <span className="text-sm font-bold text-brand">{tarifLabel(r.repetiteur.tarif)}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quiz */}
      <section>
        <div className="text-center max-w-xl mx-auto mb-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">Testez-vous — quiz gratuits</h2>
          <p className="text-ink-muted text-sm mt-1">Révisez à votre rythme, conçus selon le programme national guinéen.</p>
        </div>

        {/* Filtres niveau : cycle puis classe précise */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            <FilterChip active={!cycle} onClick={() => { setCycle(''); setNiveau(''); }} label="Tous niveaux" />
            {CYCLES.map(c => (
              <FilterChip key={c.value} active={cycle === c.value} onClick={() => { setCycle(c.value); setNiveau(''); }} label={c.label} />
            ))}
          </div>
          {cycle && (
            <div className="flex flex-wrap justify-center gap-2">
              <FilterChip active={!niveau} onClick={() => setNiveau('')} label={`Toutes les classes (${CYCLES.find(c => c.value === cycle)?.label})`} small />
              {niveauxDuCycle(cycle).map(n => (
                <FilterChip key={n.value} active={niveau === n.value} onClick={() => setNiveau(n.value)} label={n.label} small />
              ))}
            </div>
          )}
        </div>

        {quizzesError ? (
          <ErrorState message="Impossible de charger les quiz." onRetry={chargerQuizzes} />
        ) : quizzes.length === 0 ? (
          <p className="text-ink-muted text-sm text-center">Aucun quiz publié pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {quizzes.map(q => {
              const Icon = MATIERE_ICONS[q.matiere] || HelpCircle;
              return (
                <Link key={q._id} href={`/quiz/${q._id}`} className="bg-white rounded-2xl border border-ink/10 p-4 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className="w-14 h-14 rounded-xl bg-sand grid place-items-center shrink-0">
                    <Icon size={24} className="text-ink-muted" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wide bg-ink/5 text-ink-muted px-2 py-0.5 rounded">{q.matiere}</span>
                      <span className="text-xs font-bold uppercase tracking-wide bg-ink/5 text-ink-muted px-2 py-0.5 rounded">{niveauLabel(q.niveau)}</span>
                    </div>
                    <p className="font-bold text-ink leading-tight truncate">{q.titre}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand mt-1">
                      Commencer <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {CYCLES.map(c => (
            <Link key={c.value} href={`/quiz?cycle=${c.value}`}
              className="bg-white rounded-2xl border border-ink/10 p-6 flex flex-col items-center gap-1 text-center hover:border-brand hover:shadow-md transition-all">
              <span className="font-bold text-ink">{c.label}</span>
              <span className="text-xs text-ink-muted">{c.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Terrain — vraies séances Gandal, preuve concrète en attendant les avis */}
      <section>
        <div className="text-center max-w-xl mx-auto mb-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">On était sur le terrain</h2>
          <p className="text-ink-muted text-sm mt-1">Premières séances Gandal, en direct des salles de classe de Fria.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden bg-ink/5 aspect-square md:aspect-auto">
            <video src="/accueil/video.mp4" poster="/accueil/classe-1.jpeg" controls preload="metadata" className="w-full h-full object-cover" />
          </div>
          {['classe-1', 'classe-2', 'classe-3', 'classe-4', 'classe-5', 'classe-6'].map(photo => (
            <div key={photo} className="relative rounded-2xl overflow-hidden bg-ink/5 aspect-square">
              {/* Sous la ligne de flottaison : chargement différé par défaut
                  (comportement standard de next/image, pas de priority ici). */}
              <Image src={`/accueil/${photo}.jpeg`} alt="Séance de soutien scolaire Gandal à Fria, Guinée" fill
                sizes="(min-width: 768px) 25vw, 50vw" className="object-cover hover:scale-105 transition-transform" />
            </div>
          ))}
        </div>
      </section>

      {/* Avis — pas encore de vrais avis à afficher, section honnête en attendant */}
      <section id="avis" className="text-center bg-sand rounded-3xl py-14 px-6">
        <MessageCircle size={28} className="mx-auto text-brand mb-3" strokeWidth={1.5} />
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">Les avis arrivent bientôt</h2>
        <p className="text-ink-muted text-sm mt-2 max-w-md mx-auto">
          Gandal vient de démarrer en Guinée — les retours de nos premiers élèves, parents et enseignants apparaîtront ici dès qu'ils seront publiés.
        </p>
      </section>
    </div>
    <AssistantWidget />
    </>
  );
}

function FilterChip({ active, onClick, label, small }: { active: boolean; onClick: () => void; label: string; small?: boolean }) {
  return (
    <button onClick={onClick}
      className={`rounded-full font-semibold border transition-colors ${small ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs'} ${
        active ? 'bg-brand text-white border-brand' : 'bg-white border-ink/15 text-ink-muted hover:border-brand/40'
      }`}>
      {label}
    </button>
  );
}
