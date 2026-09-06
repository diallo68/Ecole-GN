import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types';

interface AuthState {
  user:  User | null;
  token: string | null;
  hydrated: boolean;

  login:  (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  hydrate: () => Promise<void>;

  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  hydrated: false,

  login: async (user, token) => {
    await AsyncStorage.setItem('gandal_token', token);
    await AsyncStorage.setItem('gandal_user', JSON.stringify(user));
    set({ user, token });
  },
  logout: async () => {
    await AsyncStorage.multiRemove(['gandal_token', 'gandal_user']);
    set({ user: null, token: null });
  },
  setUser: (user) => {
    AsyncStorage.setItem('gandal_user', JSON.stringify(user));
    set({ user });
  },
  // Recharge la session sauvegardée au démarrage de l'app (SecureStore/AsyncStorage
  // best-effort — l'utilisateur ne doit jamais être bloqué par un Keystore défaillant).
  hydrate: async () => {
    try {
      const [token, userRaw] = await Promise.all([
        AsyncStorage.getItem('gandal_token'),
        AsyncStorage.getItem('gandal_user'),
      ]);
      if (token && userRaw) set({ token, user: JSON.parse(userRaw) });
    } catch {
      // silencieux — l'utilisateur devra juste se reconnecter
    } finally {
      set({ hydrated: true });
    }
  },

  isLoggedIn: () => !!get().token,
}));
