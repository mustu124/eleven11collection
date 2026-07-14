import "server-only";
import { createSupabaseServerClient } from "./server-session";

/**
 * Every admin Server Action must call this before touching data. Middleware
 * already blocks unauthenticated visits to /admin pages, but a Server
 * Action is its own POST endpoint — defense in depth, not redundant.
 */
export async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  return user;
}
