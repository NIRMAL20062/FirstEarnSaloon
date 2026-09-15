import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Server-only Supabase client authenticated with the SERVICE ROLE key,
 * which bypasses Row Level Security entirely. Every /api/** Route Handler
 * uses this — never the anon key — for owner reads/writes, after
 * `requireUid()` (src/lib/server/auth.ts) has verified the caller's
 * Firebase ID token and an ownership check has confirmed they own the
 * salon being modified. NEVER import this from a Client Component or
 * expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
let client: SupabaseClient<Database> | undefined;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set — see .env.local.example."
    );
  }

  client = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
