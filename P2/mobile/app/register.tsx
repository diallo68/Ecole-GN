import { useState, useRef, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Colors, ALL_CITIES, CYCLES, niveauxDuCycle } from '@/lib/constants';
import FileUploadField from '@/components/FileUploadField';
import Toast from 'react-native-toast-message';
import type { Role, Niveau, Cycle } from '@/types';

// Même parcours "une question à la fois" que sur YouGouYouGou (moins intimidant
// qu'un long formulaire) — adapté à Gandal, avec un choix de profil en 2 étapes
// (Élève/Parent d'élève puis, si besoin, lequel).
type AccountChoice = 'eleve_parent' | 'repetiteur' | '';
type SubRole = 'eleve' | 'parent' | '';
type Step = 'form' | 'otp' | 'documents';
type QuestionId = 'accountType' | 'subRole' | 'nameCombo' | 'phone' | 'email' | 'password' | 'password2' | 'city' | 'cycle' | 'niveau';
interface Question { id: QuestionId }

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, setUser } = useAuthStore();

  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [qIndex, setQIndex] = useState(0);

  const [accountType, setAccountType] = useState<AccountChoice>('');
  const [subRole, setSubRole] = useState<SubRole>('');
  const [fullName, setFullName] = useState('');
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
  const [photo, setPhoto] = useState('');
  const [pieceIdentite, setPieceIdentite] = useState('');

  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const answerRef = useRef<TextInput>(null);
  const advancing = useRef(false);

  const handleFullNameChange = (v: string) => {
    setFullName(v);
    const parts = v.trim().split(/\s+/);
    setPrenom(parts[0] || '');
    setNom(parts.slice(1).join(' '));
  };

  const role: Role | '' = accountType === 'repetiteur' ? 'repetiteur' : subRole;

  const questions: Question[] = useMemo(() => {
    const q: Question[] = [{ id: 'accountType' }];
    if (accountType === 'eleve_parent') q.push({ id: 'subRole' });
    q.push({ id: 'nameCombo' }, { id: 'phone' }, { id: 'email' }, { id: 'password' }, { id: 'password2' }, { id: 'city' });
    if (role === 'eleve') q.push({ id: 'cycle' }, { id: 'niveau' });
    return q;
  }, [accountType, role]);

  const q = questions[Math.min(qIndex, questions.length - 1)];
  const progress = Math.round(((qIndex + 1) / questions.length) * 100);
  const pwMatch = password && password2 ? password === password2 : null;

  useEffect(() => {
    const t = setTimeout(() => answerRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, [qIndex]);

  const validateCurrent = (): string | null => {
    switch (q.id) {
      case 'nameCombo': return prenom.trim() ? null : 'Le prénom est obligatoire';
      case 'phone':     return phone.trim().length >= 6 ? null : 'Entrez un numéro de téléphone valide';
      case 'email':     return email.trim() ? null : 'Entrez votre adresse email';
      case 'password':  return password.length >= 8 ? null : 'Mot de passe trop court (8 caractères min.)';
      case 'password2': return password === password2 ? null : 'Les mots de passe ne correspondent pas';
      case 'city':      return city ? null : 'Choisissez votre ville';
      default:          return null;
    }
  };

  const sendCode = async () => {
    setLoading(true);
    try {
      const res = await authApi.sendCode({ email, prenom });
      if (res.sendFailed) {
        Toast.show({ type: 'error', text1: "L'envoi du code a échoué", text2: 'Réessayez dans un instant.' });
        return;
      }
      Toast.show({ type: 'success', text1: 'Code envoyé par email !' });
      setStep('otp');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message || 'Erreur' });
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    const err = validateCurrent();
    if (err) { Toast.show({ type: 'error', text1: err }); return; }
    if (qIndex < questions.length - 1) setQIndex(i => i + 1);
    else sendCode();
  };
  const goBack = () => { if (qIndex > 0) setQIndex(i => i - 1); };

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
    if (code.length !== 6) { Toast.show({ type: 'error', text1: 'Entrez le code à 6 chiffres' }); return; }
    setLoading(true);
    try {
      const data = await authApi.register({
        prenom, nom, phone, email, password, city, code, role,
        ...(role === 'eleve' ? { niveau } : {}),
      });
      await login(data.user, data.token);
      Toast.show({ type: 'success', text1: 'Compte créé !' });
      setStep('documents');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message || 'Erreur' });
    } finally {
      setLoading(false);
    }
  };

  const finishDocuments = async () => {
    if (photo || pieceIdentite) {
      setLoading(true);
      try {
        const { user } = await authApi.updateMe({ photo: photo || undefined, pieceIdentite: pieceIdentite || undefined });
        setUser(user);
      } catch (e: any) {
        Toast.show({ type: 'error', text1: e.message || 'Erreur' });
      } finally {
        setLoading(false);
      }
    }
    router.replace('/(tabs)');
  };

  // ── Documents Step (facultatif, après création du compte) ──
  if (step === 'documents') {
    return (
      <View style={[styles.otpContainer, { justifyContent: 'flex-start', paddingTop: insets.top + 40 }]}>
        <View style={styles.otpLogoWrap}>
          <Ionicons name="card-outline" size={32} color={Colors.brand} />
        </View>
        <Text style={styles.otpTitle}>Complète ton profil</Text>
        <Text style={styles.otpSubtitle}>Une photo et une pièce d'identité — facultatif pour le moment.</Text>

        <View style={{ width: '100%', gap: 16 }}>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.inkMuted }}>Photo (optionnel)</Text>
            <FileUploadField value={photo} onChange={setPhoto} label="Ajouter une photo" kind="photo" />
          </View>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.inkMuted }}>Pièce d'identité (optionnel)</Text>
            <FileUploadField value={pieceIdentite} onChange={setPieceIdentite} label="Ajouter une pièce d'identité" kind="document" />
          </View>

          <TouchableOpacity onPress={finishDocuments} disabled={loading} style={[styles.btnPrimary, loading && styles.btnDisabled, { marginTop: 8 }]}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.btnPrimaryText}>{(photo || pieceIdentite) ? 'Continuer' : 'Passer cette étape'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── OTP Step ──
  if (step === 'otp') {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.otpContainer}>
          <View style={styles.otpLogoWrap}>
            <Ionicons name="mail-outline" size={32} color={Colors.brand} />
          </View>
          <Text style={styles.otpTitle}>Code de vérification</Text>
          <Text style={styles.otpSubtitle}>Envoyé à {email}</Text>

          <TextInput
            value={code}
            onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor={Colors.inkMuted}
            style={styles.otpInput}
          />

          <TouchableOpacity
            onPress={verifyAndRegister}
            disabled={loading || code.length < 6}
            style={[styles.btnPrimary, (loading || code.length < 6) && styles.btnDisabled]}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color={Colors.white} />
                <Text style={styles.btnPrimaryText}>Vérification...</Text>
              </View>
            ) : (
              <Text style={styles.btnPrimaryText}>Valider et créer mon compte</Text>
            )}
          </TouchableOpacity>

          <View style={styles.otpActions}>
            <TouchableOpacity onPress={() => { setStep('form'); setCode(''); advancing.current = false; }}>
              <Text style={styles.otpActionSecondary}>← Modifier mes infos</Text>
            </TouchableOpacity>
            <Text style={styles.otpDot}>·</Text>
            <TouchableOpacity onPress={sendCode} disabled={loading}>
              <Text style={styles.otpActionPrimary}>Renvoyer le code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Parcours conversationnel : une question à la fois ──────────────────
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.wizard, { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 20) }]}>

        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="close" size={22} color={Colors.inkMuted} />
          </TouchableOpacity>
        </View>
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressLabel}>Question {qIndex + 1} sur {questions.length}</Text>
        </View>

        <View key={qIndex} style={styles.questionBody}>

          {q.id === 'accountType' && (
            <>
              <Text style={styles.eyebrow}>👋 Bienvenue sur Gandal</Text>
              <Text style={styles.question}>Vous êtes ?</Text>
              <View style={styles.choiceRow}>
                <ChoiceCard icon="🎓" label="Élève / Parent d'élève" active={accountType === 'eleve_parent'} onPress={() => pickAccountType('eleve_parent')} />
                <ChoiceCard icon="👨‍🏫" label="Enseignant" active={accountType === 'repetiteur'} onPress={() => pickAccountType('repetiteur')} />
              </View>
            </>
          )}

          {q.id === 'subRole' && (
            <>
              <Text style={styles.question}>Vous inscrivez-vous en tant que ?</Text>
              <View style={styles.choiceRow}>
                <ChoiceCard icon="🧑‍🎓" label="Élève" active={subRole === 'eleve'} onPress={() => pickSubRole('eleve')} />
                <ChoiceCard icon="👪" label="Parent" active={subRole === 'parent'} onPress={() => pickSubRole('parent')} />
              </View>
            </>
          )}

          {q.id === 'nameCombo' && (
            <View style={styles.qGroup}>
              <Text style={styles.question}>Quel est votre prénom et nom ?</Text>
              <TextInput ref={answerRef} value={fullName} onChangeText={handleFullNameChange} onSubmitEditing={goNext}
                placeholder="Mamadou Diallo" placeholderTextColor={Colors.inkSubtle} autoComplete="name"
                autoCapitalize="words" returnKeyType="next" style={styles.underlineInputSolo} />
            </View>
          )}

          {q.id === 'phone' && (
            <View style={styles.qGroup}>
              <Text style={styles.question}>Votre numéro de téléphone ?</Text>
              <TextInput ref={answerRef} value={phone} onChangeText={setPhone} onSubmitEditing={goNext}
                placeholder="622 00 00 00" placeholderTextColor={Colors.inkSubtle} keyboardType="phone-pad"
                autoComplete="tel" returnKeyType="next" style={styles.underlineInputSolo} />
            </View>
          )}

          {q.id === 'email' && (
            <View style={styles.qGroup}>
              <Text style={styles.question}>Votre adresse email ?</Text>
              <TextInput ref={answerRef} value={email} onChangeText={setEmail} onSubmitEditing={goNext}
                placeholder="votre@email.com" placeholderTextColor={Colors.inkSubtle} keyboardType="email-address"
                autoComplete="email" autoCapitalize="none" returnKeyType="next" style={styles.underlineInputSolo} />
            </View>
          )}

          {q.id === 'password' && (
            <View style={styles.qGroup}>
              <Text style={styles.question}>Créez un mot de passe</Text>
              <Text style={styles.hintSmall}>8 caractères min.</Text>
              <TextInput ref={answerRef} value={password} onChangeText={setPassword} onSubmitEditing={goNext}
                placeholder="••••••••" placeholderTextColor={Colors.inkSubtle} secureTextEntry
                autoComplete="password-new" returnKeyType="next" style={styles.underlineInputSolo} />
            </View>
          )}

          {q.id === 'password2' && (
            <View style={styles.qGroup}>
              <Text style={styles.question}>Confirmez le mot de passe</Text>
              <TextInput ref={answerRef} value={password2} onChangeText={setPassword2} onSubmitEditing={goNext}
                placeholder="Répétez le mot de passe" placeholderTextColor={Colors.inkSubtle} secureTextEntry
                autoComplete="password-new" returnKeyType="done" style={styles.underlineInputSolo} />
              {pwMatch === false && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="close-circle" size={12} color={Colors.danger} />
                  <Text style={styles.hintError}>Les mots de passe ne correspondent pas</Text>
                </View>
              )}
              {pwMatch === true && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                  <Text style={styles.hintSuccess}>Les mots de passe correspondent</Text>
                </View>
              )}
            </View>
          )}

          {q.id === 'city' && (
            <View style={styles.qGroup}>
              <Text style={styles.question}>Votre ville de résidence ?</Text>
              <TouchableOpacity onPress={() => { setCitySearch(''); setShowCityPicker(true); }} style={styles.underlineInputSolo}>
                <Text style={city ? styles.underlineValue : styles.underlinePlaceholder}>{city || 'Choisir votre ville...'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {q.id === 'cycle' && (
            <>
              <Text style={styles.question}>Ton niveau d'étude ?</Text>
              <View style={styles.choiceRow}>
                {CYCLES.map(c => (
                  <ChoiceCard key={c.value} label={c.label} active={cycle === c.value} onPress={() => pickCycle(c.value)} compact />
                ))}
              </View>
            </>
          )}

          {q.id === 'niveau' && cycle && (
            <>
              <Text style={styles.question}>Ta classe précise ?</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
                {niveauxDuCycle(cycle).map(n => (
                  <TouchableOpacity key={n.value} onPress={() => pickNiveau(n.value)}
                    style={[styles.choiceCard, styles.choiceCardCompact, { flexBasis: '30%', flexGrow: 0 }, niveau === n.value && styles.choiceCardActive]}>
                    <Text style={[styles.choiceLabel, niveau === n.value && styles.choiceLabelActive]}>{n.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {q.id !== 'accountType' && q.id !== 'subRole' && q.id !== 'cycle' && q.id !== 'niveau' && (
          <View style={styles.navRow}>
            <TouchableOpacity onPress={goBack}>
              <Text style={styles.navBack}>← Retour</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goNext} disabled={loading} style={[styles.btnPrimary, styles.btnCompact, loading && styles.btnDisabled]}>
              {loading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.btnPrimaryText}>{qIndex === questions.length - 1 ? 'Recevoir mon code →' : 'Suivant →'}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        {q.id === 'accountType' && (
          <View style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Déjà un compte ?</Text>
            <TouchableOpacity onPress={() => { router.back(); router.push('/login'); }}>
              <Text style={styles.loginLinkAction}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        )}
        {(q.id === 'subRole' || q.id === 'cycle' || q.id === 'niveau') && (
          <TouchableOpacity onPress={goBack} style={{ alignSelf: 'flex-start' }}>
            <Text style={styles.navBack}>← Retour</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal sélecteur de ville */}
      <Modal visible={showCityPicker} transparent animationType="slide" onRequestClose={() => setShowCityPicker(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowCityPicker(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCityPicker(false)}>
              <Text style={styles.modalCancel}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Choisir une ville</Text>
            <View style={{ width: 60 }} />
          </View>
          <View style={styles.modalSearchWrap}>
            <View style={styles.modalSearchRow}>
              <Ionicons name="search-outline" size={16} color={Colors.inkMuted} style={{ marginRight: 8 }} />
              <TextInput
                value={citySearch}
                onChangeText={setCitySearch}
                placeholder="Rechercher une ville..."
                placeholderTextColor={Colors.inkMuted}
                style={styles.modalSearchInput}
                autoFocus
              />
              {citySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCitySearch('')}>
                  <Ionicons name="close" size={16} color={Colors.inkMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <FlatList
            data={ALL_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))}
            keyExtractor={c => c}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: c }) => (
              <TouchableOpacity
                onPress={() => { setCity(c); setShowCityPicker(false); }}
                style={[styles.cityItem, city === c && styles.cityItemSelected]}
              >
                <Text style={[styles.cityItemText, city === c && styles.cityItemTextSelected]}>{c}</Text>
                {city === c && <Ionicons name="checkmark" size={17} color={Colors.brand} />}
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function ChoiceCard({ icon, label, active, onPress, compact }: {
  icon?: string; label: string; active: boolean; onPress: () => void; compact?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.choiceCard, compact && styles.choiceCardCompact, active && styles.choiceCardActive]}>
      {icon && <Text style={{ fontSize: 24 }}>{icon}</Text>}
      <Text style={[styles.choiceLabel, active && styles.choiceLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wizard: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  progressWrap: { marginBottom: 8 },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceBg,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.brand,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.inkSubtle,
  },
  questionBody: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.brandDark,
  },
  question: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.ink,
    marginTop: -2,
  },
  hintSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.inkSubtle,
    marginTop: -4,
  },
  qGroup: {
    gap: 8,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  choiceCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 22,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
  },
  choiceCardCompact: {
    paddingVertical: 16,
  },
  choiceCardActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brandLight,
  },
  choiceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
  },
  choiceLabelActive: {
    color: Colors.brandDark,
  },
  underlineInputSolo: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.ink,
    borderBottomWidth: 2,
    borderBottomColor: Colors.surfaceBorder,
    paddingBottom: 10,
    padding: 0,
    paddingVertical: 0,
  },
  underlineValue: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.ink,
    paddingBottom: 10,
  },
  underlinePlaceholder: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.inkSubtle,
    paddingBottom: 10,
  },
  hintError: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: '600',
  },
  hintSuccess: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  navBack: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.inkMuted,
  },
  btnPrimary: {
    backgroundColor: Colors.brand,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCompact: {
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPrimaryText: {
    color: Colors.white,
    fontWeight: '900',
    fontSize: 15,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
    gap: 4,
  },
  loginLinkText: {
    fontSize: 13,
    color: Colors.inkMuted,
  },
  loginLinkAction: {
    fontSize: 13,
    color: Colors.brand,
    fontWeight: '700',
  },
  // OTP step
  otpContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpLogoWrap: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: Colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  otpTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  otpSubtitle: {
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: 'center',
    marginBottom: 28,
  },
  otpInput: {
    width: 200,
    borderWidth: 1.5,
    borderRadius: 12,
    borderColor: Colors.surfaceBorder,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 8,
    color: Colors.ink,
    backgroundColor: Colors.surfaceBg,
    paddingVertical: 12,
    marginBottom: 28,
  },
  otpActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  otpActionSecondary: {
    color: Colors.inkMuted,
    fontSize: 13,
  },
  otpDot: {
    color: Colors.inkMuted,
  },
  otpActionPrimary: {
    color: Colors.brand,
    fontWeight: '700',
    fontSize: 13,
  },
  // Modal ville
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  modalCancel: {
    color: Colors.inkMuted,
    fontSize: 15,
  },
  modalTitle: {
    fontWeight: '800',
    fontSize: 15,
    color: Colors.ink,
  },
  modalSearchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  modalSearchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.ink,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    backgroundColor: Colors.white,
  },
  cityItemSelected: {
    backgroundColor: Colors.brandLight,
  },
  cityItemText: {
    fontSize: 15,
    color: Colors.ink,
    fontWeight: '400',
  },
  cityItemTextSelected: {
    fontWeight: '700',
  },
});
