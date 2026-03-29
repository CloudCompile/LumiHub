import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../api/client';

export interface UserSettings {
  customDisplayName?: string;
  nsfwEnabled: boolean;
  nsfwUnblurred: boolean;
  defaultIncludeTags: string[];
  defaultExcludeTags: string[];
}

export interface User {
  id: string;
  discordId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  banner: string | null;
  role: 'user' | 'admin' | 'moderator';
  createdAt: string;
  settings?: UserSettings;
}

interface AuthState {
  user: User | null;
  _hasChecked: boolean;
  setUser: (user: User | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      _hasChecked: false,
      setUser: (user) => set({ user, _hasChecked: true }),
      reset: () => set({ user: null, _hasChecked: false }),
    }),
    { name: 'lumihub-auth' }
  )
);

let fetchPromise: Promise<User | null> | null = null;

async function fetchCurrentUser(): Promise<User | null> {
  if (!fetchPromise) {
    fetchPromise = (async () => {
      try {
        const res = await apiFetch('/api/v1/users/me');
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    })().finally(() => {
      fetchPromise = null;
    });
  }

  return fetchPromise;
}

export async function bootstrapAuth(force = false): Promise<User | null> {
  if (force) {
    fetchPromise = null;
  }

  const user = await fetchCurrentUser();
  useAuthStore.getState().setUser(user);
  return user;
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const hasChecked = useAuthStore((s) => s._hasChecked);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  const logout = () => {
    apiFetch('/api/v1/auth/logout', { method: 'POST' }, { retryOn401: false })
      .catch((err) => console.error('Logout request failed:', err));
    setUser(null);
    queryClient.clear();
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: !hasChecked,
    logout,
  };
}
