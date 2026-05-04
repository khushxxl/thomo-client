import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Thrown at import time so misconfiguration shows up immediately in dev
  throw new Error(
    "Missing Supabase env vars — set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in client/.env",
  );
}

const supabaseProjectRef = new URL(supabaseUrl).hostname.split(".")[0];
export const SUPABASE_STORAGE_KEY = `sb-${supabaseProjectRef}-auth-token`;

/**
 * Client-side Supabase instance.
 *
 * Uses the anon key, which relies on Row Level Security policies (defined in
 * the migration) to keep each user's data isolated. Never ship the service
 * role key to the app.
 *
 * Session persistence goes through AsyncStorage so the user stays signed in
 * across app restarts.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    storageKey: SUPABASE_STORAGE_KEY,
    persistSession: true,
    autoRefreshToken: true,
    // React Native doesn't expose URL-based session detection
    detectSessionInUrl: false,
  },
});
