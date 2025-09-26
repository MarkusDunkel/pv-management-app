import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  email: string;
  displayName: string;
  roles: string[];
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setSession: (token, user) => set({ token, user, isAuthenticated: true }),
      clearSession: () => set({ token: null, user: null, isAuthenticated: false })
    }),
    {
      name: 'pv-auth-storage'
    }
  )
);
