import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars."
  );
}

/**
 * Browser/client-side Supabase client, scoped to the anon key. Subject to
 * RLS — safe to import from client components. Uses createBrowserClient
 * (not the plain supabase-js createClient) so the auth session is synced
 * into cookies, not just localStorage — middleware and Server Components
 * can only see cookies, so admin auth would be invisible to them otherwise.
 */
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
