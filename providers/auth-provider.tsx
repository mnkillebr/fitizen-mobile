import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Provider, Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  signIn: (email: string) => Promise<void>;
  signInSocial: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;

}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const auth = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!auth) {
      throw new Error('useAuth must be wrapped in a <SessionProvider />');
    }
  }

  return auth;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const {data: { subscription }} = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setSession(null)
        } else if (session) {
          setSession(session)
        }
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      console.error('Error signing in:', error.message);
    }
  };

  const signInSocial = async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      console.error(`Error signing in with ${provider}:`, error.message);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, signIn, signInSocial, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};