import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase, initializeSupabase } from "../lib/supabase";

type AuthContextType = {
  session: Session | null;
  user: Session["user"] | null;
  loading: boolean;
  isAdmin: boolean;
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
      supabase.auth
        .getSession()
        .then(async ({ data: { session } }) => {
          setSession(session);
          if (session?.user) {
            const { data } = await supabase
              .from("profiles")
              .select("is_admin")
              .eq("id", session.user.id)
              .single();
            setIsAdmin(data?.is_admin || false);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });

      // Handle subsequent auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", session.user.id)
            .single();
          setIsAdmin(data?.is_admin || false);
        } else {
          setIsAdmin(false);
        }
      });

      return () => subscription.unsubscribe();
    });
  }, []);

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
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        loading,
        isAdmin,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
