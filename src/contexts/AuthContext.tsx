import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase, initializeSupabase, resetSupabaseClient } from "../lib/supabase";
import { captureEvent, identifyUser, resetPostHog, setUserProperties } from "../lib/posthog";
import { AUTH_EVENTS, USER_PROPERTIES } from "../constants/analyticsEvents";

type SignUpOptions = {
  // Required for all signups
  username: string;
  displayName: string;
  // Optional for all signups
  profileMediaId?: number | null;
  instagram?: string;
  // Flag to indicate social (Google/Apple) signup
  isSocialUser?: boolean;
};

type AuthContextType = {
  session: Session | null;
  user: Session["user"] | null;
  loading: boolean;
  isAdmin: boolean;
  username: string | null;
  signUp: (options: SignUpOptions) => Promise<string>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);

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
              .select("is_admin, username")
              .eq("id", session.user.id)
              .single();
            setIsAdmin(data?.is_admin || false);
            setUsername(data?.username || null);
            // Identify user in PostHog when session is restored
            identifyUser(session.user.id, {
              [USER_PROPERTIES.EMAIL]: session.user.email,
              [USER_PROPERTIES.USERNAME]: session.user.user_metadata?.username,
              [USER_PROPERTIES.DISPLAY_NAME]: session.user.user_metadata?.display_name,
              [USER_PROPERTIES.IS_ADMIN]: data?.is_admin || false,
            });
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
            .select("is_admin, username")
            .eq("id", session.user.id)
            .single();
          setIsAdmin(data?.is_admin || false);
          setUsername(data?.username || null);
          // Identify user in PostHog on auth state change
          identifyUser(session.user.id, {
            [USER_PROPERTIES.EMAIL]: session.user.email,
            [USER_PROPERTIES.USERNAME]: session.user.user_metadata?.username,
            [USER_PROPERTIES.DISPLAY_NAME]: session.user.user_metadata?.display_name,
            [USER_PROPERTIES.IS_ADMIN]: data?.is_admin || false,
          });
        } else {
          setIsAdmin(false);
          setUsername(null);
          // Reset PostHog when user logs out
          resetPostHog();
        }
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  // Handle app state changes - reset Supabase client when returning from background
  // This fixes a bug where the GoTrue auth client's internal state gets stuck
  // See: https://github.com/supabase/supabase-js/issues/1594
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // Reset the Supabase client to clear any stuck internal state
        resetSupabaseClient();

        // Restore session with the fresh client
        try {
          const result = await Promise.race([
            supabase.auth.getSession(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
          ]);

          if (!result.error && result.data.session) {
            setSession(result.data.session);
          }
        } catch {
          // Timeout - session will be restored on next successful auth operation
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // Helper: Check if username is taken
  const checkUsernameAvailable = async (username: string, excludeUserId?: string) => {
    let query = supabase
      .from("profiles")
      .select("username")
      .eq("username", username);
    
    if (excludeUserId) {
      query = query.neq("id", excludeUserId);
    }

    const { data: existingUser, error: checkError } = await query.single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existingUser) {
      throw new Error("Username is already taken");
    }
  };

  // Helper: Create welcome post
  const createWelcomePost = async (userId: string) => {
    await supabase.from("post").insert({
      user_id: userId,
      body: "",
      is_welcome: true,
    });
  };

  // Signup function for completing profile (user already authenticated)
  const signUp = async (options: SignUpOptions): Promise<string> => {
    const { username, displayName, profileMediaId, instagram } = options;

    // Get the already-authenticated user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error("No active session");
    }
    const userId = session.user.id;

    // Check username availability (excluding current user)
    await checkUsernameAvailable(username, userId);

    // Build profile updates
    const updates: Record<string, string | number | boolean | null> = {
      id: userId,
      username,
      name: displayName,
      first_login: true,
    };

    // Optional fields
    if (profileMediaId) updates.profile_media_id = profileMediaId;
    if (instagram) updates.instagram = instagram;

    // Upsert profile
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(updates, { onConflict: 'id' });

    if (upsertError) throw upsertError;

    setUsername(username);

    // Create welcome post
    await createWelcomePost(userId);

    // Track sign up event
    captureEvent(AUTH_EVENTS.SIGNED_UP, {
      [USER_PROPERTIES.USERNAME]: username,
      [USER_PROPERTIES.DISPLAY_NAME]: displayName,
      [USER_PROPERTIES.HAS_PROFILE_PICTURE]: !!profileMediaId,
      [USER_PROPERTIES.HAS_INSTAGRAM]: !!instagram,
    });

    return userId;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      // Track failed sign in attempt
      captureEvent(AUTH_EVENTS.SIGN_IN_FAILED, {
        error: error.message,
      });
      throw error;
    }
    // Track successful sign in
    captureEvent(AUTH_EVENTS.SIGNED_IN);
    // Update last active
    setUserProperties({
      [USER_PROPERTIES.LAST_ACTIVE]: new Date().toISOString(),
    });
  };

  const signOut = async () => {
    // Track sign out event before actually signing out
    captureEvent(AUTH_EVENTS.SIGNED_OUT);
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
        username,
        signUp,
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
