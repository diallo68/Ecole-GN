'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ArrowRight, Zap, MessageCircle, Sigma, Languages, Atom, FlaskConical, Leaf, Landmark, Map, HelpCircle, Search, CalendarCheck, GraduationCap, BookOpen, Backpack } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { repetiteurApi, quizApi } from '@/lib/api';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import FavoriButton from '@/components/FavoriButton';
import Button from '@/components/Button';
import HomeSearch from '@/components/HomeSearch';
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
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [quizzesLoading, setQuizzesLoading] = useState(true);

  const chargerRepetiteurs = () => {
    setRepetiteursError(false);
    setTeachersLoading(true);
    repetiteurApi.list({ limit: 4 }).then(d => setRepetiteurs(d.repetiteurs)).catch(() => setRepetiteursError(true)).finally(() => setTeachersLoading(false));
  };
  useEffect(chargerRepetiteurs, []);

  // Pré-sélectionne le niveau de l'élève connecté, sans l'imposer (il peut changer).
  useEffect(() => {
    if (user?.eleve?.niveau) {
      const n = niveauxDuCycle('primaire').concat(niveauxDuCycle('college'), niveauxDuCycle('lycee')).find(x => x.value === user.eleve!.niveau);
      if (n) { setCycle(n.cycle); setNiveau(n.value); }
    }
  }, [user]);

  const [quizReload, setQuizReload] = useState(0);
  const chargerQuizzes = () => setQuizReload(value => value + 1);
  useEffect(() => {
    let active = true;
    setQuizzesLoading(true);
    setQuizzesError(false);
    quizApi.list({ niveau: niveau || undefined }).then(d => {
      if (!active) return;
      const levels = cycle ? niveauxDuCycle(cycle).map(n => n.value) : [];
      setQuizzes(d.quizzes.filter(q => !cycle || levels.includes(q.niveau)).slice(0, 6));
    }).catch(() => { if (active) setQuizzesError(true); })
      .finally(() => { if (active) setQuizzesLoading(false); });
    return () => { active = false; };
  }, [niveau, cycle, quizReload]);

  return (
    <>
    {/* 80px entre sections sur toute la largeur rendait l'accueil très long
        à faire défiler sur mobile — espacement responsive (48/64/80px). */}
    <div className="space-y-12 md:space-y-16 lg:space-y-20">
      <section aria-labelledby="home-title">
        <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 pt-3 lg:pt-6">
          <div className="min-w-0 py-2 lg:py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-5">Soutien scolaire en Guinée</p>
            <h1 id="home-title" className="text-[2rem] sm:text-[2.75rem] lg:text-[3.25rem] font-bold tracking-tight leading-[1.1]">
              Un enseignant pour progresser,<br />
              <span className="text-brand">du primaire au lycée.</span>
            </h1>
            <p className="mt-5 text-base lg:text-lg leading-relaxed text-ink-muted max-w-lg">
              Trouvez un accompagnement adapté à votre classe et révisez à votre rythme avec les quiz Gandal.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
              <Button href="/repetiteurs" size="lg" icon={ArrowRight}>Trouver un enseignant</Button>
              <Button href="/quiz" variant="secondary" size="lg">Découvrir les quiz</Button>
            </div>
            <p className="mt-7 font-hand text-xl text-brand relative inline-block">
              Apprendre aujourd’hui, bâtir demain.
              <svg viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true" className="absolute left-0 -bottom-1.5 w-full h-2.5 text-accent">
                <path d="M2 6 Q 50 -2 100 6 T 198 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </p>
          </div>
          <figure className="relative min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-brand-light lg:aspect-[1.12/1]">
              <Image src="/accueil/hero-illustration.jpg" alt="Illustration d'un enseignant accompagnant deux élèves autour d'un livre, dans une salle de classe" fill priority
                sizes="(min-width: 1152px) 540px, (min-width: 1024px) 48vw, (min-width: 640px) 90vw, calc(100vw - 32px)" className="object-cover" />
            </div>
          </figure>
        </div>
        <HomeSearch />
        <div id="comment-ca-marche" className="scroll-mt-24 grid gap-6 sm:grid-cols-3 border-b border-ink/10 py-8 lg:py-10">
          <h2 className="sr-only">Comment ça marche</h2>
          {[
            { icon: Search, titre: 'Choisissez', texte: 'La matière, la classe et votre ville.' },
            { icon: MessageCircle, titre: 'Échangez', texte: 'Discutez de vos besoins avec l’enseignant.' },
            { icon: CalendarCheck, titre: 'Demandez une séance', texte: 'L’enseignant confirme votre demande.' },
          ].map(({ icon: Icon, titre, texte }, index) => (
            <div key={titre} className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/20 text-xs font-semibold">0{index + 1}</span>
              <Icon size={24} className="hidden lg:block shrink-0 text-brand mt-1" aria-hidden="true" />
              <div><h3 className="font-semibold">{titre}</h3><p className="mt-1 text-sm leading-relaxed text-ink-muted">{texte}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="cycles-title">
        <p className="text-xs uppercase tracking-[0.16em] font-semibold text-brand mb-3">Apprendre à son rythme</p>
        <h2 id="cycles-title" className="text-2xl md:text-3xl font-bold tracking-tight">À chaque classe, ses révisions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {CYCLES.map((c, index) => {
            const Icon = [Backpack, BookOpen, GraduationCap][index];
            const descriptions = ['Des quiz pour consolider les bases et prendre confiance.', 'Révisez les notions clés et progressez à votre rythme.', 'Préparez vos examens et visez plus loin.'];
            return (
              <Link key={c.value} href={`/quiz?cycle=${c.value}`} className="group flex items-start gap-4 rounded-2xl border border-ink/10 bg-white p-5 lg:p-6 transition-colors hover:border-brand/40">
                <span className="size-14 shrink-0 rounded-full bg-accent/25 text-brand grid place-items-center"><Icon size={27} strokeWidth={1.6} aria-hidden="true" /></span>
                <div className="min-w-0"><h3 className="text-xl font-bold">{c.label}</h3><p className="text-sm text-ink-muted leading-relaxed mt-2">{descriptions[index]}</p><span className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-brand">Explorer les quiz <ArrowRight size={15} aria-hidden="true" /></span></div>
              </Link>
            );
          })}
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
        {teachersLoading ? <HomeSkeleton count={4} /> : repetiteursError ? (
          <ErrorState message="Impossible de charger les enseignants." onRetry={chargerRepetiteurs} />
        ) : repetiteurs.length === 0 ? (
          <EmptyState icon={GraduationCap} message="Aucun profil enseignant n'est actuellement proposé." ctaLabel="Découvrir les quiz" ctaHref="/quiz" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {repetiteurs.map(r => (
              <Link key={r._id} href={`/repetiteurs/${r._id}`} className="bg-white rounded-2xl border border-ink/10 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-sand text-brand-dark font-bold grid place-items-center border border-ink/10">
                    {r.prenom?.[0]}{r.nom?.[0]}
                  </div>
                  <div className="flex items-center gap-2">
                    {r.repetiteur.ratingCount > 0 && (
                      <div className="flex items-center gap-1 bg-sand px-2 py-1 rounded-lg text-xs font-semibold">
                        ★ {r.repetiteur.avgRating}
                      </div>
                    )}
                    <FavoriButton repetiteurId={r._id} />
                  </div>
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">Testez-vous avec nos quiz gratuits</h2>
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

        {quizzesLoading ? <HomeSkeleton count={3} /> : quizzesError ? (
          <ErrorState message="Impossible de charger les quiz." onRetry={chargerQuizzes} />
        ) : quizzes.length === 0 ? (
          <EmptyState icon={HelpCircle} message="Aucun quiz n'est publié pour le moment." />
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
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wide bg-ink/5 text-ink-muted px-2 py-0.5 rounded">{q.matiere}</span>
                      <span className="text-xs font-bold uppercase tracking-wide bg-ink/5 text-ink-muted px-2 py-0.5 rounded">{niveauLabel(q.niveau)}</span>
                    </div>
                    <p className="font-bold text-ink leading-snug">{q.titre}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand mt-1">
                      Commencer <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

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

      <section className="rounded-2xl bg-brand-light border border-brand/10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div><h2 className="text-2xl font-bold text-brand-dark">Vous êtes enseignant ?</h2><p className="mt-2 text-ink-muted">Partagez vos connaissances et accompagnez les élèves en Guinée.</p></div>
        <Button href="/register" className="shrink-0">Rejoindre Gandal <ArrowRight size={16} aria-hidden="true" /></Button>
      </section>
    </div>
    <AssistantWidget />
    </>
  );
}

function FilterChip({ active, onClick, label, small }: { active: boolean; onClick: () => void; label: string; small?: boolean }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={`rounded-full font-semibold border transition-colors ${small ? 'px-3 py-2 text-sm min-h-11' : 'px-4 py-2 text-sm min-h-11'} ${
        active ? 'bg-brand text-white border-brand' : 'bg-white border-ink/15 text-ink-muted hover:border-brand/40'
      }`}>
      {label}
    </button>
  );
}

function HomeSkeleton({ count }: { count: number }) {
  return <div role="status" aria-label="Chargement du contenu" className={`grid gap-4 sm:grid-cols-2 ${count === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
    <span className="sr-only">Chargement en cours…</span>
    {Array.from({ length: count }, (_, i) => <div key={i} aria-hidden="true" className="rounded-2xl border border-ink/10 bg-white p-5 space-y-4 motion-safe:animate-pulse"><div className="size-12 rounded-full bg-sand" /><div className="h-4 w-3/4 rounded bg-sand" /><div className="h-3 w-1/2 rounded bg-sand" /></div>)}
  </div>;
}
