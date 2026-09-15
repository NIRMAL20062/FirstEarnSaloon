import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * The public (anon key) Supabase client — used ONLY for the customer-facing
 * salon page. It can read salons and active services/offers per
 * supabase/migrations/0001_init.sql's RLS policies, and nothing else. Every
 * write, and every read of an owner's full (including inactive) data, goes
 * through an authenticated Route Handler instead (src/lib/server/).
 */
let client: SupabaseClient<Database> | undefined;

export function getSupabasePublic(): SupabaseClient<Database> {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set — see .env.local.example."
    );
  }

  client = createClient<Database>(url, anonKey, { auth: { persistSession: false } });
  return client;
}
