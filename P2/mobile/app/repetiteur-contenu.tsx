import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { contentApi, soumissionApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Colors, NIVEAUX, niveauLabel, matieresDuCycle } from '@/lib/constants';
import FileUploadField from '@/components/FileUploadField';
import type { ContentItem, Soumission, Niveau } from '@/types';

type ContentType = 'video' | 'support' | 'exercice';
const TYPES: { value: ContentType; label: string }[] = [
  { value: 'video', label: 'Vidéos' },
  { value: 'support', label: 'Supports' },
  { value: 'exercice', label: 'Exercices' },
];

export default function RepetiteurContenuScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [type, setType] = useState<ContentType>('video');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [titre, setTitre] = useState('');
  const [niveau, setNiveau] = useState<Niveau>('7e');
  const cycle = NIVEAUX.find(n => n.value === niveau)?.cycle || 'college';
  const matieresDisponibles = matieresDuCycle(cycle);
  const [matiere, setMatiere] = useState(matieresDisponibles[0]);
  const [chapitre, setChapitre] = useState('');
  const [url, setUrl] = useState('');
  const [enonce, setEnonce] = useState('');
  const [correction, setCorrection] = useState('');

  const changerNiveau = (v: Niveau) => {
    setNiveau(v);
    const nouveauCycle = NIVEAUX.find(n => n.value === v)?.cycle || 'college';
    const options = matieresDuCycle(nouveauCycle);
    if (!options.includes(matiere)) setMatiere(options[0]);
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'repetiteur') { router.back(); return; }
  }, [user, router]);

  const charger = () => { contentApi.mine(type).then(setItems).catch(() => setItems([])); };
  useEffect(() => { charger(); }, [type]);

  const publier = async () => {
    if (!titre || (type !== 'exercice' && !url) || (type === 'exercice' && !enonce)) {
      Toast.show({ type: 'error', text1: 'Remplis au moins le titre et le contenu principal' });
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, unknown> = { titre, matiere, niveau, chapitre };
      if (type === 'video') body.url = url;
      if (type === 'support') { body.fichierUrl = url; body.type = 'pdf'; }
      if (type === 'exercice') { body.enonce = enonce; body.correction = correction; body.fichierUrl = url || undefined; }
      await contentApi.create(type, body);
      Toast.show({ type: 'success', text1: 'Publié !' });
      setTitre(''); setChapitre(''); setUrl(''); setEnonce(''); setCorrection('');
      charger();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message || 'Erreur' });
    } finally {
      setLoading(false);
    }
  };

  const supprimer = (id: string) => {
    Alert.alert('Supprimer ce contenu ?', undefined, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await contentApi.remove(type, id);
          setItems(prev => prev.filter(i => i._id !== id));
          Toast.show({ type: 'success', text1: 'Supprimé' });
        } catch { Toast.show({ type: 'error', text1: 'Erreur' }); }
      } },
    ]);
  };

  if (!user || user.role !== 'repetiteur') return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surfaceBg }} contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {TYPES.map(t => (
          <TouchableOpacity key={t.value} onPress={() => setType(t.value)}
            style={{ flex: 1, backgroundColor: type === t.value ? Colors.brand : Colors.white, borderWidth: 1, borderColor: type === t.value ? Colors.brand : Colors.surfaceBorder, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}>
            <Text style={{ color: type === t.value ? Colors.white : Colors.ink, fontWeight: '700', fontSize: 13 }}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 16, padding: 16, gap: 10 }}>
        <Text style={{ fontWeight: '800', color: Colors.ink, fontSize: 15 }}>
          Publier {type === 'video' ? 'une vidéo' : type === 'support' ? 'un support' : 'un exercice'}
        </Text>
        <TextInput value={titre} onChangeText={setTitre} placeholder="Titre" placeholderTextColor={Colors.inkSubtle}
          style={{ borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.ink }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {NIVEAUX.map(n => (
            <TouchableOpacity key={n.value} onPress={() => changerNiveau(n.value)}
              style={{ backgroundColor: niveau === n.value ? Colors.brand : Colors.surfaceBg, borderWidth: 1, borderColor: niveau === n.value ? Colors.brand : Colors.surfaceBorder, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ color: niveau === n.value ? Colors.white : Colors.ink, fontSize: 11, fontWeight: '700' }}>{n.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {matieresDisponibles.map(m => (
            <TouchableOpacity key={m} onPress={() => setMatiere(m)}
              style={{ backgroundColor: matiere === m ? Colors.brand : Colors.surfaceBg, borderWidth: 1, borderColor: matiere === m ? Colors.brand : Colors.surfaceBorder, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ color: matiere === m ? Colors.white : Colors.ink, fontSize: 11, fontWeight: '700' }}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput value={chapitre} onChangeText={setChapitre} placeholder="Chapitre (optionnel)" placeholderTextColor={Colors.inkSubtle}
          style={{ borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.ink }} />

        {type !== 'exercice' && (
          <FileUploadField value={url} onChange={setUrl} kind={type === 'video' ? 'document' : 'document'}
            label={type === 'video' ? 'Ajouter la vidéo' : 'Ajouter le support (PDF, image)'} />
        )}
        {type === 'exercice' && (
          <>
            <TextInput value={enonce} onChangeText={setEnonce} placeholder="Énoncé" multiline numberOfLines={3} placeholderTextColor={Colors.inkSubtle}
              style={{ borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, padding: 12, fontSize: 14, color: Colors.ink, minHeight: 70, textAlignVertical: 'top' }} />
            <TextInput value={correction} onChangeText={setCorrection} placeholder="Correction (optionnelle)" multiline numberOfLines={2} placeholderTextColor={Colors.inkSubtle}
              style={{ borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, padding: 12, fontSize: 14, color: Colors.ink, minHeight: 50, textAlignVertical: 'top' }} />
            <FileUploadField value={url} onChange={setUrl} kind="document" label="Ajouter une pièce jointe (optionnel)" />
          </>
        )}

        <TouchableOpacity onPress={publier} disabled={loading}
          style={{ backgroundColor: Colors.brand, borderRadius: 10, paddingVertical: 12, alignItems: 'center', opacity: loading ? 0.6 : 1 }}>
          {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={{ color: Colors.white, fontWeight: '800' }}>Publier</Text>}
        </TouchableOpacity>
      </View>

      <View style={{ gap: 8 }}>
        {items.length === 0 ? (
          <Text style={{ color: Colors.inkMuted, fontSize: 13 }}>Rien de publié pour l'instant dans cette catégorie.</Text>
        ) : items.map(item => (
          type === 'exercice'
            ? <ExerciceCard key={item._id} item={item} onDelete={() => supprimer(item._id)} />
            : (
              <View key={item._id} style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={{ fontWeight: '800', color: Colors.ink }}>{item.titre}</Text>
                  <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>
                    {item.matiere} · {niveauLabel(item.niveau)}{item.chapitre ? ` · ${item.chapitre}` : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => supprimer(item._id)}>
                  <Text style={{ color: Colors.danger, fontSize: 13, fontWeight: '700' }}>Suppr.</Text>
                </TouchableOpacity>
              </View>
            )
        ))}
      </View>
    </ScrollView>
  );
}

function ExerciceCard({ item, onDelete }: { item: ContentItem; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [soumissions, setSoumissions] = useState<Soumission[] | null>(null);

  const charger = () => {
    soumissionApi.byExercice(item._id).then(d => setSoumissions(d.soumissions)).catch(() => setSoumissions([]));
  };
  const toggleOpen = () => {
    if (!open && soumissions === null) charger();
    setOpen(!open);
  };
  const rendus = soumissions?.filter(s => s.statut === 'rendu').length ?? null;

  return (
    <View style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 14, overflow: 'hidden' }}>
      <View style={{ padding: 14, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ fontWeight: '800', color: Colors.ink }}>{item.titre}</Text>
          <Text style={{ fontSize: 12, color: Colors.inkMuted, marginTop: 2 }}>
            {item.matiere} · {niveauLabel(item.niveau)}{item.chapitre ? ` · ${item.chapitre}` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={onDelete}>
          <Text style={{ color: Colors.danger, fontSize: 13, fontWeight: '700' }}>Suppr.</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={toggleOpen}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.surfaceBorder, backgroundColor: Colors.surfaceBg }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.inkMuted }}>
          Voir les copies{rendus !== null && rendus > 0 ? ` (${rendus} à corriger)` : soumissions ? ` (${soumissions.length})` : ''}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={15} color={Colors.inkMuted} />
      </TouchableOpacity>
      {open && (
        <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: Colors.surfaceBorder, gap: 8 }}>
          {soumissions === null ? (
            <Text style={{ fontSize: 13, color: Colors.inkSubtle }}>Chargement...</Text>
          ) : soumissions.length === 0 ? (
            <Text style={{ fontSize: 13, color: Colors.inkSubtle }}>Aucune copie rendue pour l'instant.</Text>
          ) : soumissions.map(s => <CopieRow key={s._id} soumission={s} onCorrigee={charger} />)}
        </View>
      )}
    </View>
  );
}

function CopieRow({ soumission, onCorrigee }: { soumission: Soumission; onCorrigee: () => void }) {
  const eleve = typeof soumission.eleveId === 'object' ? soumission.eleveId : null;
  const [note, setNote] = useState(soumission.note?.toString() || '');
  const [commentaire, setCommentaire] = useState(soumission.commentaire || '');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(soumission.statut === 'rendu');

  const corriger = async () => {
    setSaving(true);
    try {
      await soumissionApi.corriger(soumission._id, { note: note ? Number(note) : undefined, commentaire: commentaire || undefined });
      Toast.show({ type: 'success', text1: 'Copie corrigée !' });
      setEditing(false);
      onCorrigee();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message || 'Erreur' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ backgroundColor: Colors.surfaceBg, borderRadius: 10, padding: 10, gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.ink }}>{eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève'}</Text>
        <View style={{ backgroundColor: soumission.statut === 'corrige' ? Colors.brandLight : '#fff3cd', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: soumission.statut === 'corrige' ? Colors.brandDark : '#8a6400' }}>
            {soumission.statut === 'corrige' ? `Corrigé — ${soumission.note ?? '—'}/20` : 'À corriger'}
          </Text>
        </View>
      </View>
      {soumission.reponseTexte && <Text style={{ fontSize: 13, color: Colors.ink }}>{soumission.reponseTexte}</Text>}
      {soumission.fichierUrl && <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.brand }}>Pièce jointe : {soumission.fichierUrl.split('/').pop()}</Text>}
      {editing ? (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput value={note} onChangeText={setNote} keyboardType="number-pad" placeholder="/20" placeholderTextColor={Colors.inkSubtle}
            style={{ width: 60, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, fontSize: 13, color: Colors.ink, backgroundColor: Colors.white }} />
          <TextInput value={commentaire} onChangeText={setCommentaire} placeholder="Commentaire" placeholderTextColor={Colors.inkSubtle}
            style={{ flex: 1, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, fontSize: 13, color: Colors.ink, backgroundColor: Colors.white }} />
          <TouchableOpacity onPress={corriger} disabled={saving} style={{ backgroundColor: Colors.brand, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 }}>
            <Text style={{ color: Colors.white, fontSize: 11, fontWeight: '700' }}>{saving ? '...' : 'Valider'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setEditing(true)}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.brand }}>Modifier la note</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
