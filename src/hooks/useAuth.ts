import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';

export interface User {
  id: string;
  discordId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  banner: string | null;
  role: 'user' | 'admin' | 'mod';
  createdAt: string;
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

let _fetchPromise: Promise<User | null> | null = null;

async function fetchCurrentUser(): Promise<User | null> {
  if (!_fetchPromise) {
    _fetchPromise = fetch('/api/v1/user/@me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .finally(() => { _fetchPromise = null; });
  }
  return _fetchPromise;
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [isLoading, setIsLoading] = useState(() => !useAuthStore.getState()._hasChecked);

  useEffect(() => {
    const { _hasChecked } = useAuthStore.getState();
    if (_hasChecked) {
      setIsLoading(false);
      return;
    }

    fetchCurrentUser()
      .then((u) => setUser(u))
      .finally(() => setIsLoading(false));
  }, []);

  const logout = () => {
    fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' })
      .catch((err) => console.error('Logout request failed:', err));
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  };
}
