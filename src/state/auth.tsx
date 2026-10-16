import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as api from '@/api';
import type { User } from '@/types';

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Access token lives in memory. The rotating refresh token is stored with
 * expo-secure-store (or localStorage on web).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    api
      .restoreSession()
      .then((restored) => {
        if (!cancelled && restored) setUser(restored);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setUser(await api.login(email, password));
  }, []);

  const signUp = useCallback(
    async (input: { name: string; email: string; phone: string; password: string }) => {
      setUser(await api.register(input));
    },
    [],
  );

  const signOut = useCallback(async () => {
    await api.logout();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({ user, ready, signIn, signUp, signOut, updateUser: setUser }),
    [user, ready, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

/** For screens that only render while signed in (guarded by protected routes). */
export function useCurrentUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error('useCurrentUser called while signed out');
  return user;
}
