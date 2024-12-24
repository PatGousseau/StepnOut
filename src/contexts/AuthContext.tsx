import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, initializeSupabase } from '../lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: Session['user'] | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, username: string, displayName: string, profileMediaId?: number | null) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Initialize Supabase first
    initializeSupabase().then(() => {
      // Get initial session
      supabase.auth.getSession()
        .then(async ({ data: { session } }) => {
          setSession(session);
          if (session?.user) {
            const { data } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', session.user.id)
              .single();
            setIsAdmin(data?.is_admin || false);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });

      // Handle subsequent auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
          setIsAdmin(data?.is_admin || false);
        } else {
          setIsAdmin(false);
        }
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    username: string, 
    displayName: string,
    profileMediaId?: number | null
  ) => {
    // Check if username is already taken
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingUser) {
      throw new Error('Username is already taken');
    }

    // Sign up the user
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName,
        },
      },
    });
    
    if (error) throw error;
    if (!user) throw new Error('No user returned after signup');

    // If a profile picture was uploaded, update the profile
    if (profileMediaId) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_media_id: profileMediaId })
        .eq('id', user.id);

      if (updateError) throw updateError;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user: session?.user || null, 
      loading, 
      isAdmin, 
      signUp, 
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
