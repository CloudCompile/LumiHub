import { useQuery, useQueryClient } from '@tanstack/react-query';

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

async function fetchUser(): Promise<User | null> {
  let res = await fetch('/api/v1/user/@me', { credentials: 'include' });
  
  if (res.status === 401 || res.status === 403) {
    const refreshRes = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (refreshRes.ok) {
      res = await fetch('/api/v1/user/@me', { credentials: 'include' });
    } else {
      return null;
    }
  }

  if (res.ok) {
    return res.json();
  }
  
  return null;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logout = () => {
    fetch('/api/v1/auth/logout', { method: 'POST' }).catch((err) => console.error('Logout request failed:', err));
    queryClient.setQueryData(['auth', 'user'], null);
  };

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
    error,
    logout,
  };
}
