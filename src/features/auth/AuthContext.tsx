import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { isDemoMode, supabase } from '@/lib/supabase';
import { demoProfiles } from '@/lib/demo/store';
import type { Profile, UserRole } from '@/types';

export interface AuthUser extends Profile {
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  loginAsDemo(role: UserRole): void;
  refreshProfile(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function demoUserFor(role: UserRole): AuthUser {
  const profile = demoProfiles.find((item) => item.role === role) ?? demoProfiles[0];
  if (!profile) throw new Error('Data demo tidak tersedia.');
  return { ...profile, email: `${role}@klinik.demo` };
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    id: data.id,
    fullName: data.full_name,
    role: data.role,
    specialization: data.specialization,
    sipNumber: data.sip_number,
    createdAt: data.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (isDemoMode) return;
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setUser(null);
      return;
    }
    const profile = await fetchProfile(authData.user.id);
    if (!profile) {
      setUser(null);
      return;
    }
    setUser({ ...profile, email: authData.user.email ?? '' });
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      setUser(demoUserFor('admin'));
      setIsLoading(false);
      return;
    }

    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (!data.session) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await fetchProfile(data.session.user.id);
        if (!active) return;
        if (profile) {
          setUser({ ...profile, email: data.session?.user.email ?? '' });
        } else {
          await supabase.auth.signOut();
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession) {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error('Email atau kata sandi salah.');
    if (!data.session) throw new Error('Gagal membuat sesi login.');
    setSession(data.session);
    await refreshProfile();
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      setUser(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setSession(null);
    setUser(null);
  }, []);

  const loginAsDemo = useCallback((role: UserRole) => {
    setUser(demoUserFor(role));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, session, isLoading, isDemoMode, signIn, signOut, loginAsDemo, refreshProfile }),
    [user, session, isLoading, signIn, signOut, loginAsDemo, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus dipakai di dalam AuthProvider.');
  return context;
}
