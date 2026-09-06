import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user:  User | null;
  token: string | null;
  refreshToken: string | null;

  login:  (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;

  isLoggedIn: () => boolean;
  isRole: (role: User['role']) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,

      login: (user, token, refreshToken) => {
        if (typeof window !== 'undefined') localStorage.setItem('gandal_token', token);
        set({ user, token, refreshToken });
      },
      logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('gandal_token');
        set({ user: null, token: null, refreshToken: null });
      },
      setUser: (user) => set({ user }),

      isLoggedIn: () => !!get().token,
      isRole: (role) => get().user?.role === role,
    }),
    { name: 'gandal-auth', storage: createJSONStorage(() => localStorage) },
  ),
);
