import { create } from 'zustand';
import { api, setToken, getToken } from '../lib/api';

export type User = {
  id: string;
  email: string;
  displayName: string | null;
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName?: string) => Promise<boolean>;
  logout: () => void;
  restore: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
      setToken(data.token);
      set({ user: data.user, isLoading: false });
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Login failed', isLoading: false });
      return false;
    }
  },

  register: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post<{ user: User; token: string }>('/auth/register', {
        email,
        password,
        ...(displayName ? { displayName } : {}),
      });
      setToken(data.token);
      set({ user: data.user, isLoading: false });
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Registration failed', isLoading: false });
      return false;
    }
  },

  logout: () => {
    setToken(null);
    set({ user: null, error: null });
  },

  /**
   * Re-validates a stored token on app load. The anonymous token is
   * deliberately left in place so signed-out users keep their history.
   */
  restore: async () => {
    if (!getToken()) {
      set({ user: null });
      return;
    }
    set({ isLoading: true });
    try {
      const user = await api.get<User>('/auth/me');
      set({ user, isLoading: false });
    } catch {
      // Expired or invalid token — clear it rather than leaving the app in a
      // half-authenticated state.
      setToken(null);
      set({ user: null, isLoading: false });
    }
  },
}));
