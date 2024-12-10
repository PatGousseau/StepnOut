import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabaseUrl = 'https://kiplxlahalqyahstmmjg.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcGx4bGFoYWxxeWFoc3RtbWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkzOTExNTEsImV4cCI6MjA0NDk2NzE1MX0.pgTmWgtFGiB3zpx-pFDEgytawrGi85lFiz1tGpgDckk';
export const supabaseStorageUrl = `${supabaseUrl}/storage/v1/object/public/challenge-uploads`;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});