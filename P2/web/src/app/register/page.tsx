'use client';
// Inscription "conversationnelle" : une question à la fois (façon Typeform),
// même parcours que sur YouGouYouGou — sans numéro de téléphone (email uniquement).

import { useState, useRef, useEffect, useMemo, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { ALL_CITIES, CYCLES, niveauxDuCycle } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import FileUploadField from '@/components/FileUploadField';
import type { Role, Niveau, Cycle } from '@/types';

type AccountChoice = 'eleve_parent' | 'repetiteur' | '';
type SubRole = 'eleve' | 'parent' | '';
type Step = 'form' | 'otp' | 'documents';
type QuestionId = 'accountType' | 'subRole' | 'nameCombo' | 'phone' | 'email' | 'password' | 'password2' | 'city' | 'cycle' | 'niveau';
interface Question { id: QuestionId }

export default function RegisterPage() {
  const router = useRouter();
  const { login, setUser } = useAuthStore();

  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [qIndex, setQIndex] = useState(0);

  const [accountType, setAccountType] = useState<AccountChoice>('');
  const [subRole, setSubRole] = useState<SubRole>('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [city, setCity] = useState('');
  const [cycle, setCycle] = useState<Cycle | ''>('');
  const [niveau, setNiveau] = useState<Niveau | ''>('');
  const [code, setCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [photo, setPhoto] = useState('');
  const [pieceIdentite, setPieceIdentite] = useState('');
  const [documentsError, setDocumentsError] = useState(false);

  const answerRef = useRef<HTMLInputElement & HTMLSelectElement>(null);
  const advancing = useRef(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // Rôle réellement envoyé au backend
  const role: Role | '' = accountType === 'repetiteur' ? 'repetiteur' : subRole;

  const questions: Question[] = useMemo(() => {
    const q: Question[] = [{ id: 'accountType' }];
    if (accountType === 'eleve_parent') q.push({ id: 'subRole' });
    q.push({ id: 'nameCombo' }, { id: 'phone' }, { id: 'email' }, { id: 'password' }, { id: 'password2' }, { id: 'city' });
    if (role === 'eleve') q.push({ id: 'cycle' }, { id: 'niveau' });
    return q;
  }, [accountType, role]);

  const q = questions[Math.min(qIndex, questions.length - 1)];
  // Sur (questions.length + 2), pas juste questions.length : il reste encore
  // le code de vérification et les documents après ce formulaire — la barre
  // ne doit pas donner l'impression que tout est fini à la dernière question.
  const progress = Math.round(((qIndex + 1) / (questions.length + 2)) * 100);
  const pwMatch = password && password2 ? password === password2 : null;

  useEffect(() => {
    const t = setTimeout(() => answerRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, [qIndex]);

  const validateCurrent = (): string | null => {
    switch (q.id) {
      case 'nameCombo': return prenom.trim() ? null : 'Le prénom est obligatoire';
      case 'phone':     return phone.trim().length >= 6 ? null : 'Entrez un numéro de téléphone valide';
      case 'email':     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? null : 'Entrez une adresse email valide (ex : nom@exemple.com)';
      case 'password':  return password.length >= 8 ? null : 'Mot de passe trop court (8 caractères min.)';
      case 'password2': return password === password2 ? null : 'Les mots de passe ne correspondent pas';
      case 'city':      return city ? null : 'Choisissez votre ville';
      default:          return null; // accountType/subRole/niveau gérés par choix (auto-avance)
    }
  };

  const sendCode = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const res = await authApi.sendCode({ email, prenom });
      if (res.sendFailed) {
        toast.error("L'envoi du code a échoué. Réessaie dans un instant.");
        return;
      }
      toast.success('Code envoyé par email !');
      setStep('otp');
      setResendCooldown(30);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    const err = validateCurrent();
    if (err) { toast.error(err); return; }
    if (qIndex < questions.length - 1) setQIndex(i => i + 1);
    else sendCode();
  };
  const goBack = () => { if (qIndex > 0) setQIndex(i => i - 1); };
  const handleEnter = (e: React.KeyboardEvent) => { if (e.key === 'Enter') goNext(); };

  const pickAccountType = (v: AccountChoice) => {
    if (advancing.current) return;
    advancing.current = true;
    setAccountType(v);
    setSubRole('');
    setTimeout(() => { advancing.current = false; setQIndex(i => i + 1); }, 200);
  };
  const pickSubRole = (v: SubRole) => {
    if (advancing.current) return;
    advancing.current = true;
    setSubRole(v);
    setTimeout(() => { advancing.current = false; setQIndex(i => i + 1); }, 200);
  };
  const pickCycle = (v: Cycle) => {
    if (advancing.current) return;
    advancing.current = true;
    setCycle(v);
    setNiveau('');
    setTimeout(() => { advancing.current = false; setQIndex(i => i + 1); }, 200);
  };
  const pickNiveau = (v: Niveau) => {
    if (advancing.current) return;
    advancing.current = true;
    setNiveau(v);
    setTimeout(() => { advancing.current = false; goNext(); }, 200);
  };

  const verifyAndRegister = async () => {
    if (code.length !== 6) { toast.error('Entre le code à 6 chiffres'); return; }
    setLoading(true);
    try {
      const data = await authApi.register({
        prenom, nom, phone, email, password, city, code, role,
        ...(role === 'eleve' ? { niveau } : {}),
      });
      login(data.user, data.token, data.refreshToken);
      toast.success('Compte créé !');
      setStep('documents');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const finishDocuments = async () => {
    if (!photo && !pieceIdentite) { router.push('/dashboard'); return; }
    setLoading(true);
    setDocumentsError(false);
    try {
      const { user } = await authApi.updateMe({ photo: photo || undefined, pieceIdentite: pieceIdentite || undefined });
      setUser(user);
      router.push('/dashboard');
    } catch (err) {
      // Ne redirige plus comme si c'était enregistré — reste sur l'étape et
      // propose explicitement de réessayer ou de continuer sans ces documents.
      setDocumentsError(true);
      toast.error(err instanceof Error ? err.message : "L'envoi a échoué");
    } finally {
      setLoading(false);
    }
  };

  if (step === 'documents') {
    return (
      <div className="max-w-sm mx-auto bg-white rounded-2xl border border-ink/10 p-6 space-y-5">
        <div className="text-center">
          <div className="text-4xl mb-2">🪪</div>
          <p className="text-xs font-bold text-ink-muted uppercase tracking-wide">Étape 3 sur 3</p>
          <p className="font-bold text-ink mt-1">Complète ton profil</p>
          <p className="text-sm text-ink-muted mt-1">
            {role === 'repetiteur'
              ? "Une photo et une pièce d'identité — utilisées par notre équipe pour vérifier ton profil avant sa mise en ligne."
              : "Une photo de profil — facultatif."}
          </p>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-ink-muted">Photo (optionnel)</label>
          <FileUploadField value={photo} onChange={setPhoto} accept="image/*" label="Ajouter une photo" />
        </div>
        {role === 'repetiteur' && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-ink-muted">Pièce d'identité (optionnel pour le moment)</label>
            <FileUploadField value={pieceIdentite} onChange={setPieceIdentite} accept="image/*,.pdf" label="Ajouter une pièce d'identité" />
          </div>
        )}
        <button onClick={finishDocuments} disabled={loading} className="w-full bg-brand text-white rounded-lg py-2 font-semibold hover:bg-brand-dark disabled:opacity-50">
          {loading ? 'Envoi...' : documentsError ? 'Réessayer' : (photo || pieceIdentite) ? 'Continuer' : 'Passer cette étape'}
        </button>
        {documentsError && (
          <button onClick={() => router.push('/dashboard')} className="w-full text-center text-sm text-ink-muted hover:underline">
            Continuer sans enregistrer ces documents
          </button>
        )}
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="max-w-sm mx-auto bg-white rounded-2xl border border-ink/10 p-6 space-y-5">
        <div className="text-center">
          <div className="text-4xl mb-2">📧</div>
          <p className="text-xs font-bold text-ink-muted uppercase tracking-wide">Étape 2 sur 3</p>
          <p className="font-bold text-ink mt-1">Code de vérification</p>
          <p className="text-sm text-ink-muted mt-1">Envoyé à {email}</p>
        </div>
        <input placeholder="Code à 6 chiffres" maxLength={6} inputMode="numeric" autoComplete="one-time-code"
          value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          className="w-full border border-ink/15 rounded-lg px-3 py-2 text-center text-lg tracking-widest" />
        <button onClick={verifyAndRegister} disabled={loading} className="w-full bg-brand text-white rounded-lg py-2 font-semibold hover:bg-brand-dark disabled:opacity-50">
          {loading ? 'Vérification...' : 'Valider et créer mon compte'}
        </button>
        <div className="text-center">
          <button onClick={() => { setStep('form'); setCode(''); }} className="text-sm text-ink-muted hover:underline">← Modifier mes infos</button>
          <span className="mx-2 text-ink-muted">·</span>
          <button onClick={sendCode} disabled={resendCooldown > 0} className="text-sm text-brand font-semibold hover:underline disabled:opacity-40 disabled:no-underline disabled:text-ink-muted">
            {resendCooldown > 0 ? `Renvoyer le code (${resendCooldown}s)` : 'Renvoyer le code'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl border border-ink/10 p-6">
      <div className="flex flex-col gap-2 mb-6">
        <div className="h-1 rounded-full bg-ink/10 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-bold text-ink-muted">Étape 1 sur 3 — question {qIndex + 1} sur {questions.length}</span>
      </div>

      <div key={qIndex} className="flex flex-col gap-4 min-h-[280px] justify-center">
        {q.id === 'accountType' && (
          <>
            <p className="text-sm font-bold text-brand-dark">👋 Bienvenue sur Gandal</p>
            <h1 className="text-xl font-extrabold text-ink -mt-1">Vous êtes ?</h1>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <ChoiceCard icon="🎓" label="Élève / Parent d'élève" active={accountType === 'eleve_parent'} onClick={() => pickAccountType('eleve_parent')} />
              <ChoiceCard icon="👨‍🏫" label="Enseignant" active={accountType === 'repetiteur'} onClick={() => pickAccountType('repetiteur')} />
            </div>
          </>
        )}

        {q.id === 'subRole' && (
          <>
            <h1 className="text-xl font-extrabold text-ink">Vous inscrivez-vous en tant que ?</h1>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <ChoiceCard icon="🧑‍🎓" label="Élève" active={subRole === 'eleve'} onClick={() => pickSubRole('eleve')} />
              <ChoiceCard icon="👪" label="Parent" active={subRole === 'parent'} onClick={() => pickSubRole('parent')} />
            </div>
          </>
        )}

        {q.id === 'nameCombo' && (
          <div className="flex flex-col gap-5">
            <h1 className="text-xl font-extrabold text-ink">Votre prénom et nom ?</h1>
            <div className="flex flex-col gap-2">
              <label htmlFor="reg-prenom" className="text-xs font-semibold text-ink-muted">Prénom</label>
              <input id="reg-prenom" ref={answerRef} value={prenom} onChange={e => setPrenom(e.target.value)} onKeyDown={handleEnter}
                placeholder="Mamadou" autoComplete="given-name"
                className="text-xl font-semibold text-ink bg-transparent outline-none border-b-2 border-ink/15 focus:border-brand pb-2 placeholder:text-ink-muted placeholder:font-medium" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="reg-nom" className="text-xs font-semibold text-ink-muted">Nom (optionnel)</label>
              <input id="reg-nom" value={nom} onChange={e => setNom(e.target.value)} onKeyDown={handleEnter}
                placeholder="Diallo" autoComplete="family-name"
                className="text-xl font-semibold text-ink bg-transparent outline-none border-b-2 border-ink/15 focus:border-brand pb-2 placeholder:text-ink-muted placeholder:font-medium" />
            </div>
          </div>
        )}

        {q.id === 'phone' && (
          <QuestionInput ref={answerRef} label="Votre numéro de téléphone ?" type="tel" value={phone} onChange={setPhone} onEnter={handleEnter} placeholder="622 00 00 00" autoComplete="tel" />
        )}

        {q.id === 'email' && (
          <QuestionInput ref={answerRef} label="Votre adresse email ?" type="email" value={email} onChange={setEmail} onEnter={handleEnter} placeholder="votre@email.com" autoComplete="email" />
        )}

        {q.id === 'password' && (
          <QuestionInput ref={answerRef} label="Créez un mot de passe" hint="8 caractères min." type="password" value={password} onChange={setPassword} onEnter={handleEnter} placeholder="••••••••" autoComplete="new-password" />
        )}

        {q.id === 'password2' && (
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-extrabold text-ink">Confirmez le mot de passe</h1>
            <input ref={answerRef} type="password" value={password2} onChange={e => setPassword2(e.target.value)} onKeyDown={handleEnter}
              placeholder="Répétez le mot de passe" autoComplete="new-password"
              className="text-xl font-semibold text-ink bg-transparent outline-none border-b-2 border-ink/15 focus:border-brand pb-2 placeholder:text-ink-muted placeholder:font-medium" />
            {pwMatch === false && <p className="text-xs text-flag font-semibold">Les mots de passe ne correspondent pas</p>}
            {pwMatch === true && <p className="text-xs text-green-600 font-semibold">Les mots de passe correspondent</p>}
          </div>
        )}

        {q.id === 'city' && (
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-extrabold text-ink">Votre ville de résidence ?</h1>
            <select ref={answerRef} value={city} onChange={e => setCity(e.target.value)}
              className="text-xl font-semibold text-ink bg-transparent outline-none border-b-2 border-ink/15 focus:border-brand pb-2 appearance-none cursor-pointer">
              <option value="">Choisir votre ville...</option>
              {ALL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {q.id === 'cycle' && (
          <>
            <h1 className="text-xl font-extrabold text-ink">Ton niveau d'étude ?</h1>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {CYCLES.map(c => (
                <ChoiceCard key={c.value} label={c.label} active={cycle === c.value} onClick={() => pickCycle(c.value)} />
              ))}
            </div>
          </>
        )}

        {q.id === 'niveau' && cycle && (
          <>
            <h1 className="text-xl font-extrabold text-ink">Ta classe précise ?</h1>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {niveauxDuCycle(cycle).map(n => (
                <ChoiceCard key={n.value} label={n.label} active={niveau === n.value} onClick={() => pickNiveau(n.value)} />
              ))}
            </div>
          </>
        )}
      </div>

      {q.id !== 'accountType' && q.id !== 'subRole' && q.id !== 'cycle' && q.id !== 'niveau' && (
        <div className="flex items-center justify-between mt-6">
          <button onClick={goBack} className="text-sm font-bold text-ink-muted hover:text-ink">← Retour</button>
          <button onClick={goNext} disabled={loading} className="bg-brand text-white rounded-lg py-2.5 px-6 font-semibold hover:bg-brand-dark disabled:opacity-50">
            {loading ? 'Envoi...' : qIndex === questions.length - 1 ? 'Recevoir mon code →' : 'Suivant →'}
          </button>
        </div>
      )}
      {q.id === 'accountType' && (
        <p className="text-center text-sm text-ink-muted mt-6">
          Déjà un compte ? <a href="/login" className="text-brand font-bold hover:underline">Se connecter</a>
        </p>
      )}
      {(q.id === 'subRole' || q.id === 'cycle' || q.id === 'niveau') && (
        <button onClick={goBack} className="text-sm font-bold text-ink-muted hover:text-ink mt-6">← Retour</button>
      )}
    </div>
  );
}

function ChoiceCard({ icon, label, active, onClick }: { icon?: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex flex-col items-center gap-2 py-5 rounded-2xl border-2 transition-colors ${active ? 'border-brand bg-brand-light' : 'border-ink/15 hover:border-brand/40'}`}>
      {icon && <span className="text-2xl">{icon}</span>}
      <span className="text-sm font-bold text-ink text-center px-1">{label}</span>
    </button>
  );
}

const QuestionInput = forwardRef<HTMLInputElement, {
  label: string; hint?: string; value: string; onChange: (v: string) => void;
  onEnter: (e: React.KeyboardEvent) => void; placeholder?: string; type?: string; autoComplete?: string;
}>(({ label, hint, value, onChange, onEnter, placeholder, type = 'text', autoComplete }, ref) => (
  <div className="flex flex-col gap-2">
    <h1 className="text-xl font-extrabold text-ink">{label}</h1>
    {hint && <p className="text-xs text-ink-muted font-semibold -mt-1">{hint}</p>}
    <input
      ref={ref} type={type} value={value} onChange={e => onChange(e.target.value)} onKeyDown={onEnter}
      placeholder={placeholder} autoComplete={autoComplete}
      className="text-xl font-semibold text-ink bg-transparent outline-none border-b-2 border-ink/15 focus:border-brand pb-2 placeholder:text-ink-muted placeholder:font-medium"
    />
  </div>
));
QuestionInput.displayName = 'QuestionInput';
