import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars."
  );
}

/**
 * Server-side Supabase client scoped to the anon key, bound to the current
 * request's cookies so it sees whoever is actually logged in (or nobody).
 * Still subject to RLS — this is what lets the admin dashboard read
 * `orders` via the `authenticated_read_orders` policy, as the logged-in
 * admin user, rather than needing the service-role client for a plain
 * read. Use in Server Components and Route Handlers only (needs
 * `cookies()`); create a fresh one per request, don't module-cache it.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component (not a Route Handler/Server
          // Action) — cookies() there is read-only. Middleware still
          // refreshes the session on every request, so this is safe to
          // swallow rather than throw.
        }
      },
    },
  });
}
