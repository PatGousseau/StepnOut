import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const AsyncStorageAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
export const supabaseStorageUrl = `${supabaseUrl}/storage/v1/object/public/challenge-uploads`;

// Hard timeout on every request. Without this, a token-refresh fetch that
// stalls on app resume (e.g. network still waking from suspension) never
// resolves or rejects. supabase-js de-dupes refreshes onto a single shared
// promise, so that one dead fetch wedges getSession() — and therefore every
// query — until the app is force-killed. The AbortController guarantees the
// stuck request fails instead of hanging forever, releasing the client.
const REQUEST_TIMEOUT_MS = 15000;
const fetchWithTimeout = (input: RequestInfo | URL, init?: RequestInit) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timeout)
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: fetchWithTimeout,
  },
});

// Supabase's required React Native pattern: the auto-refresh timer is a JS
// setInterval, which the OS freezes while the app is backgrounded. Driving it
// off AppState means we do exactly one clean refresh on foreground and stop the
// timer while backgrounded, instead of leaving it to fire a doomed refresh at
// an arbitrary moment during resume.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export const initializeSupabase = async () => {
  try {
    return await supabase.auth.getSession();
  } catch {
    return null;
  }
};
