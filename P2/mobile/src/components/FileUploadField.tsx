import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import { uploadApi } from '@/lib/api';
import { Colors } from '@/lib/constants';

// Sélecteur de fichier générique — "photo" utilise la pellicule (image
// uniquement), "document" ouvre le sélecteur de fichiers (image ou PDF),
// pour la pièce d'identité.
export default function FileUploadField({ value, onChange, label = 'Ajouter un fichier', kind = 'document' }: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  kind?: 'photo' | 'document';
}) {
  const [uploading, setUploading] = useState(false);

  const upload = async (uri: string, name: string, mimeType: string) => {
    setUploading(true);
    try {
      const { url } = await uploadApi.file(uri, name, mimeType);
      onChange(url);
      Toast.show({ type: 'success', text1: 'Fichier envoyé !' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message || "Erreur d'envoi" });
    } finally {
      setUploading(false);
    }
  };

  const pick = async () => {
    if (kind === 'photo') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Toast.show({ type: 'error', text1: 'Accès aux photos refusé' }); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      await upload(asset.uri, asset.fileName || 'photo.jpg', asset.mimeType || 'image/jpeg');
    } else {
      const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      await upload(asset.uri, asset.name || 'document', asset.mimeType || 'application/octet-stream');
    }
  };

  if (value) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: Colors.white }}>
        <Ionicons name="checkmark-circle" size={16} color={Colors.brand} />
        <Text style={{ flex: 1, fontSize: 13, color: Colors.ink, fontWeight: '600' }} numberOfLines={1}>Fichier envoyé</Text>
        <TouchableOpacity onPress={() => onChange('')} hitSlop={8}>
          <Ionicons name="close" size={16} color={Colors.inkMuted} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={pick} disabled={uploading}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.surfaceBorder, borderRadius: 10, paddingVertical: 12, opacity: uploading ? 0.6 : 1 }}>
      {uploading ? <ActivityIndicator size="small" color={Colors.brand} /> : <Ionicons name="attach-outline" size={16} color={Colors.inkMuted} />}
      <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.inkMuted }}>{uploading ? 'Envoi...' : label}</Text>
    </TouchableOpacity>
  );
}
