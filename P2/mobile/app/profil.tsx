import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, FlatList, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Colors, ALL_CITIES } from '@/lib/constants';
import FileUploadField from '@/components/FileUploadField';

const ROLE_LABELS: Record<string, string> = { eleve: 'Élève', parent: 'Parent', repetiteur: 'Enseignant', admin: 'Admin' };

export default function ProfilScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [photo, setPhoto] = useState('');
  const [pieceIdentite, setPieceIdentite] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setPrenom(user.prenom || '');
    setNom(user.nom || '');
    setAge(user.age?.toString() || '');
    setPhone(user.phone || '');
    setCity(user.city || '');
    setPhoto(user.photo || '');
    setPieceIdentite(user.pieceIdentite || '');
  }, [user]);

  const save = async () => {
    if (!prenom.trim()) { Toast.show({ type: 'error', text1: 'Le prénom est obligatoire' }); return; }
    setLoading(true);
    try {
      const { user: updated } = await authApi.updateMe({
        prenom, nom, phone, city,
        age: age ? Number(age) : null,
        photo: photo || undefined,
        pieceIdentite: pieceIdentite || undefined,
      });
      setUser(updated);
      Toast.show({ type: 'success', text1: 'Profil mis à jour !' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message || 'Erreur' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: Colors.surfaceBg }}>
        <Text style={{ color: Colors.inkMuted, marginBottom: 16 }}>Connecte-toi pour accéder à ton profil.</Text>
        <TouchableOpacity onPress={() => router.push('/login')} style={{ backgroundColor: Colors.brand, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28 }}>
          <Text style={{ color: Colors.white, fontWeight: '800' }}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initiales = `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surfaceBg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={{ backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 16, padding: 16, gap: 16 }}>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: Colors.surfaceBorder }} />
          ) : (
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.surfaceBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.surfaceBorder }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.brandDark }}>{initiales || '?'}</Text>
            </View>
          )}
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.inkMuted, textTransform: 'uppercase' }}>{ROLE_LABELS[user.role] || user.role}</Text>
            <FileUploadField value={photo} onChange={setPhoto} kind="photo" label="Changer la photo" />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.inkMuted }}>Prénom</Text>
            <TextInput value={prenom} onChangeText={setPrenom}
              style={{ borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.ink }} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.inkMuted }}>Nom</Text>
            <TextInput value={nom} onChangeText={setNom}
              style={{ borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.ink }} />
          </View>
        </View>

        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.inkMuted }}>Email</Text>
          <View style={{ borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: Colors.surfaceBg }}>
            <Text style={{ fontSize: 14, color: Colors.inkSubtle }}>{user.email}</Text>
          </View>
          <Text style={{ fontSize: 11, color: Colors.inkSubtle }}>Non modifiable (identifiant de connexion).</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.inkMuted }}>Téléphone</Text>
            <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="622 00 00 00" placeholderTextColor={Colors.inkSubtle}
              style={{ borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.ink }} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.inkMuted }}>Âge</Text>
            <TextInput value={age} onChangeText={setAge} keyboardType="number-pad"
              style={{ borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.ink }} />
          </View>
        </View>

        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.inkMuted }}>Ville</Text>
          <TouchableOpacity onPress={() => { setCitySearch(''); setShowCityPicker(true); }}
            style={{ borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}>
            <Text style={{ fontSize: 14, color: city ? Colors.ink : Colors.inkSubtle }}>{city || 'Choisir une ville...'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.inkMuted }}>Pièce d'identité (optionnel)</Text>
          <FileUploadField value={pieceIdentite} onChange={setPieceIdentite} kind="document" label="Ajouter une pièce d'identité" />
        </View>

        <TouchableOpacity onPress={save} disabled={loading}
          style={{ backgroundColor: Colors.brand, borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: loading ? 0.6 : 1 }}>
          {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={{ color: Colors.white, fontWeight: '800' }}>Enregistrer</Text>}
        </TouchableOpacity>
      </View>

      <Modal visible={showCityPicker} transparent animationType="slide" onRequestClose={() => setShowCityPicker(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} activeOpacity={1} onPress={() => setShowCityPicker(false)} />
        <View style={{ backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '75%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder }}>
            <TouchableOpacity onPress={() => setShowCityPicker(false)}>
              <Text style={{ color: Colors.inkMuted, fontSize: 15 }}>Annuler</Text>
            </TouchableOpacity>
            <Text style={{ fontWeight: '800', fontSize: 15, color: Colors.ink }}>Choisir une ville</Text>
            <View style={{ width: 60 }} />
          </View>
          <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceBg, borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.surfaceBorder }}>
              <Ionicons name="search-outline" size={16} color={Colors.inkMuted} style={{ marginRight: 8 }} />
              <TextInput value={citySearch} onChangeText={setCitySearch} placeholder="Rechercher une ville..." placeholderTextColor={Colors.inkMuted}
                style={{ flex: 1, paddingVertical: 10, fontSize: 14, color: Colors.ink }} autoFocus />
            </View>
          </View>
          <FlatList
            data={ALL_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))}
            keyExtractor={c => c}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: c }) => (
              <TouchableOpacity onPress={() => { setCity(c); setShowCityPicker(false); }}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder, backgroundColor: city === c ? Colors.brandLight : Colors.white }}>
                <Text style={{ fontSize: 15, color: Colors.ink, fontWeight: city === c ? '700' : '400' }}>{c}</Text>
                {city === c && <Ionicons name="checkmark" size={17} color={Colors.brand} />}
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}
