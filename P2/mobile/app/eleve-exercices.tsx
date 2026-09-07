import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { contentApi, soumissionApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Colors, MATIERES, niveauLabel } from '@/lib/constants';
import FileUploadField from '@/components/FileUploadField';
import type { ContentItem, Soumission } from '@/types';

export default function EleveExercicesScreen() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [soumissions, setSoumissions] = useState<Soumission[]>([]);
  const [matiere, setMatiere] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      contentApi.listAll('exercice', { matiere: matiere || undefined, niveau: user?.eleve?.niveau }),
      soumissionApi.mine().then(d => d.soumissions),
    ]).then(([exos, mine]) => { setItems(exos); setSoumissions(mine); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [matiere, user]);

  const soumissionPour = (exerciceId: string) => soumissions.find(s => (typeof s.exerciceId === 'object' ? s.exerciceId._id : s.exerciceId) === exerciceId);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceBg }}>
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 12, color: Colors.inkMuted, marginBottom: 8 }}>
          Exercices publiés par les enseignants Gandal{user?.eleve?.niveau ? ` — ${niveauLabel(user.eleve.niveau)}` : ''}.
        </Text>
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={[{ value: null, label: 'Toutes matières' }, ...MATIERES.map(m => ({ value: m, label: m }))]}
          keyExtractor={i => i.label}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setMatiere(item.value)}
              style={{ backgroundColor: matiere === item.value ? Colors.brand : Colors.white, borderWidth: 1, borderColor: matiere === item.value ? Colors.brand : Colors.surfaceBorder, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 }}>
              <Text style={{ color: matiere === item.value ? Colors.white : Colors.ink, fontSize: 12, fontWeight: '700' }}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.brand} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i._id}
          contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 10 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: Colors.inkMuted, marginTop: 20 }}>Aucun exercice disponible pour le moment.</Text>}
          renderItem={({ item }) => {
            const auteur = typeof item.repetiteurId === 'object' ? `${item.repetiteurId.prenom} ${item.repetiteurId.nom}` : null;
            const open = openId === item._id;
            const mySoumission = soumissionPour(item._id);
            return (
              <View style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, overflow: 'hidden' }}>
                <TouchableOpacity onPress={() => setOpenId(open ? null : item._id)}
                  style={{ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ fontWeight: '800', color: Colors.ink }}>{item.titre}</Text>
                    <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>{item.matiere}{item.chapitre ? ` · ${item.chapitre}` : ''}{auteur ? ` · Par ${auteur}` : ''}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {mySoumission && (
                      <View style={{ backgroundColor: mySoumission.statut === 'corrige' ? Colors.brandLight : '#fff3cd', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: mySoumission.statut === 'corrige' ? Colors.brandDark : '#8a6400' }}>
                          {mySoumission.statut === 'corrige' ? `Corrigé — ${mySoumission.note ?? '—'}/20` : 'Rendu'}
                        </Text>
                      </View>
                    )}
                    <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.inkSubtle} />
                  </View>
                </TouchableOpacity>
                {open && (
                  <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: Colors.surfaceBorder, gap: 10 }}>
                    <Text style={{ fontSize: 13, color: Colors.ink }}>{item.enonce}</Text>
                    {item.fichierUrl && (
                      <TouchableOpacity onPress={() => Linking.openURL(item.fichierUrl!)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Ionicons name="attach-outline" size={14} color={Colors.brand} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.brand }}>Pièce jointe</Text>
                      </TouchableOpacity>
                    )}
                    <SubmissionForm exerciceId={item._id} existing={mySoumission}
                      onSubmitted={s => setSoumissions(prev => [s, ...prev.filter(p => p._id !== s._id)])} />
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

function SubmissionForm({ exerciceId, existing, onSubmitted }: { exerciceId: string; existing?: Soumission; onSubmitted: (s: Soumission) => void }) {
  const [reponse, setReponse] = useState(existing?.reponseTexte || '');
  const [fichierUrl, setFichierUrl] = useState(existing?.fichierUrl || '');
  const [loading, setLoading] = useState(false);
  const corrige = existing?.statut === 'corrige';

  const envoyer = async () => {
    if (!reponse.trim() && !fichierUrl.trim()) { Toast.show({ type: 'error', text1: 'Écris ta réponse ou ajoute une pièce jointe' }); return; }
    setLoading(true);
    try {
      const { soumission } = await soumissionApi.create({ exerciceId, reponseTexte: reponse || undefined, fichierUrl: fichierUrl || undefined });
      Toast.show({ type: 'success', text1: existing ? 'Réponse mise à jour !' : 'Devoir rendu !' });
      onSubmitted(soumission);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message || 'Erreur' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ backgroundColor: Colors.surfaceBg, borderRadius: 10, padding: 10, gap: 8 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.inkMuted }}>
        {existing ? (corrige ? 'Ta réponse (corrigée)' : 'Ta réponse (rendue)') : 'Rendre ma réponse'}
      </Text>
      {corrige && existing?.commentaire && (
        <Text style={{ fontSize: 12, color: Colors.brandDark, backgroundColor: Colors.brandLight, borderRadius: 8, padding: 8 }}>💬 {existing.commentaire}</Text>
      )}
      <TextInput value={reponse} onChangeText={setReponse} multiline numberOfLines={3} editable={!corrige}
        placeholder="Écris ta réponse ici..." placeholderTextColor={Colors.inkSubtle}
        style={{ borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 8, padding: 10, fontSize: 13, color: Colors.ink, backgroundColor: Colors.white, minHeight: 60, textAlignVertical: 'top', opacity: corrige ? 0.6 : 1 }} />
      {!corrige && <FileUploadField value={fichierUrl} onChange={setFichierUrl} kind="document" label="Joindre un fichier (optionnel)" />}
      {corrige && fichierUrl && <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.brand }}>Pièce jointe envoyée</Text>}
      {!corrige && (
        <TouchableOpacity onPress={envoyer} disabled={loading} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: Colors.brand, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
          <Ionicons name="send" size={12} color={Colors.white} />
          <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '700' }}>{loading ? 'Envoi...' : existing ? 'Mettre à jour' : 'Envoyer'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
