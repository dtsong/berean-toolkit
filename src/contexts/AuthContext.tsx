/**
 * Authentication context for managing user sessions
 * Provides auth state and methods throughout the app
 */

'use client';

import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, AuthError } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchProfile = useCallback(
    async (userId: string) => {
      if (!supabase) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();

      setProfile(data);
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  // Initialize auth state and subscribe to changes
  useEffect(() => {
    // If supabase client isn't available (e.g., during build), just set loading to false
    if (!supabase) {
      setLoading(false);
      return;
    }

    const initializeAuth = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | null }> => {
    if (!supabase) {
      return { error: { message: 'Auth not available', status: 500 } as AuthError };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<{ error: AuthError | null }> => {
    if (!supabase) {
      return { error: { message: 'Auth not available', status: 500 } as AuthError };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    // Create profile if signup successful
    if (!error && data.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('profiles') as any).insert({
        id: data.user.id,
        display_name: displayName ?? null,
        preferred_translation: 'ESV',
      });
    }

    return { error };
  };

  const signInWithGoogle = async (): Promise<{ error: AuthError | null }> => {
    if (!supabase) {
      return { error: { message: 'Auth not available', status: 500 } as AuthError };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signOut = async (): Promise<void> => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signInWithEmail,
    signUp,
    signInWithGoogle,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
