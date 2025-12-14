import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase, initializeSupabase } from "../lib/supabase";
import { captureEvent, identifyUser, resetPostHog, setUserProperties } from "../lib/posthog";
import { AUTH_EVENTS, USER_PROPERTIES } from "../constants/analyticsEvents";

type SignUpOptions = {
  // Required for email/password signup, not needed for Google
  email?: string;
  password?: string;
  // Required for all signups
  username: string;
  displayName: string;
  // Optional for all signups
  profileMediaId?: number | null;
  instagram?: string;
  // Flag to indicate Google signup
  isGoogleUser?: boolean;
};

type AuthContextType = {
  session: Session | null;
  user: Session["user"] | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (options: SignUpOptions) => Promise<string>;
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
            .select("is_admin")
            .eq("id", session.user.id)
            .single();
          setIsAdmin(data?.is_admin || false);
          // Identify user in PostHog on auth state change
          identifyUser(session.user.id, {
            [USER_PROPERTIES.EMAIL]: session.user.email,
            [USER_PROPERTIES.USERNAME]: session.user.user_metadata?.username,
            [USER_PROPERTIES.DISPLAY_NAME]: session.user.user_metadata?.display_name,
            [USER_PROPERTIES.IS_ADMIN]: data?.is_admin || false,
          });
        } else {
          setIsAdmin(false);
          // Reset PostHog when user logs out
          resetPostHog();
        }
      });

      return () => subscription.unsubscribe();
    });
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

    // Track sign up event
    captureEvent(AUTH_EVENTS.SIGNED_UP, {
      [USER_PROPERTIES.USERNAME]: username,
      [USER_PROPERTIES.DISPLAY_NAME]: displayName,
      [USER_PROPERTIES.HAS_PROFILE_PICTURE]: !!profileMediaId,
      [USER_PROPERTIES.HAS_INSTAGRAM]: !!instagram,
    });
  };

  // Unified signup function for both email/password and Google users
  const signUp = async (options: SignUpOptions): Promise<string> => {
    const { email, password, username, displayName, profileMediaId, instagram, isGoogleUser } = options;

    let userId: string;

    if (isGoogleUser) {
      // Google signup: user already authenticated, just need to complete profile
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("No active session");
      }
      userId = session.user.id;

      // Check username availability (excluding current user since profile exists)
      await checkUsernameAvailable(username, userId);
    } else {
      // Email/password signup: need to create auth user first
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Check username availability (no exclusion since user doesn't exist yet)
      await checkUsernameAvailable(username);

      // Create auth user (triggers DB to create profile with username/displayName from metadata)
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
      if (!user) throw new Error("No user returned after signup");
      userId = user.id;
    }

    // Build profile updates
    const updates: Record<string, any> = {};

    // Google users need username/displayName set explicitly (not from DB trigger)
    if (isGoogleUser) {
      updates.id = userId; // Required for upsert
      updates.username = username;
      updates.name = displayName;
      updates.first_login = true;
    }

    // Both flows can have optional profile picture and instagram
    if (profileMediaId) updates.profile_media_id = profileMediaId;
    if (instagram) updates.instagram = instagram;

    // Update profile if there's anything to update
    if (Object.keys(updates).length > 0) {
      if (isGoogleUser) {
        // Use upsert for Google users to ensure profile exists
        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert(updates, { onConflict: 'id' });

        if (upsertError) throw upsertError;
      } else {
        // Regular update for email/password users (profile already created by DB trigger)
        const { error: updateError } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", userId);

        if (updateError) throw updateError;
      }
    }

    // Create welcome post
    await createWelcomePost(userId);

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
