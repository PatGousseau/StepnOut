import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Session } from "@supabase/supabase-js";
import { supabase, initializeSupabase } from "../lib/supabase";
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
  // Flag to indicate incomplete profile completion (existing user with null username)
  isIncompleteProfile?: boolean;
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

// Store recovery tokens separately to avoid Supabase client state issues
let pendingRecoveryTokens: { accessToken: string; refreshToken: string } | null = null;

export function getRecoveryTokens() {
  return pendingRecoveryTokens;
}

export function clearRecoveryTokens() {
  pendingRecoveryTokens = null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    let authSubscription: { unsubscribe: () => void } | null = null;
    let urlSubscription: { remove: () => void } | null = null;

    const handleIncomingUrl = async (url: string) => {
      try {
        // Handle auth deep links (password recovery, magic links, OAuth callbacks)
        const fragment = url.split('#')[1];
        if (fragment) {
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');

          if (accessToken && refreshToken && type === 'recovery') {
            // Store recovery tokens and navigate - don't use setSession to avoid client state issues
            pendingRecoveryTokens = { accessToken, refreshToken };
            router.replace('/(auth)/reset-password');
            return;
          }

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            return;
          }
        }

        // Handle PKCE code exchange
        const { queryParams } = Linking.parse(url);
        const code = typeof queryParams?.code === 'string' ? queryParams.code : undefined;
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }
      } catch (e) {
        console.error('[auth] deep link error:', e);
      }
    };

    const init = async () => {
      await initializeSupabase();

      // Deep link handling for auth flows (password reset, magic links)
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) await handleIncomingUrl(initialUrl);

      urlSubscription = Linking.addEventListener('url', ({ url }) => {
        handleIncomingUrl(url);
      });

      // Get initial session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("is_admin, username")
            .eq("id", session.user.id)
            .single();
          setIsAdmin(data?.is_admin || false);
          setUsername(data?.username || null);

          identifyUser(session.user.id, {
            [USER_PROPERTIES.EMAIL]: session.user.email,
            [USER_PROPERTIES.USERNAME]: session.user.user_metadata?.username,
            [USER_PROPERTIES.DISPLAY_NAME]: session.user.user_metadata?.display_name,
            [USER_PROPERTIES.IS_ADMIN]: data?.is_admin || false,
          });
        }
      } finally {
        setLoading(false);
      }

      // Handle subsequent auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);

        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("is_admin, username")
            .eq("id", session.user.id)
            .single();
          setIsAdmin(data?.is_admin || false);
          setUsername(data?.username || null);

          identifyUser(session.user.id, {
            [USER_PROPERTIES.EMAIL]: session.user.email,
            [USER_PROPERTIES.USERNAME]: session.user.user_metadata?.username,
            [USER_PROPERTIES.DISPLAY_NAME]: session.user.user_metadata?.display_name,
            [USER_PROPERTIES.IS_ADMIN]: data?.is_admin || false,
          });
        } else {
          setIsAdmin(false);
          setUsername(null);
          resetPostHog();
        }
      });

      authSubscription = subscription;
    };

    init();

    return () => {
      authSubscription?.unsubscribe();
      urlSubscription?.remove();
    };
  }, []);

  // Handle app state changes - refresh session when returning from background
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // Refresh session when app returns from background
        const { data: { session: refreshedSession } } = await supabase.auth.getSession();
        if (refreshedSession) {
          setSession(refreshedSession);
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
    const { username, displayName, profileMediaId, instagram, isIncompleteProfile } = options;

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

    // Create welcome post (skip for existing users completing their profile)
    if (!isIncompleteProfile) {
      await createWelcomePost(userId);
    }

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
