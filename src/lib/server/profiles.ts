import "server-only";
import type { VerifiedFirebaseToken } from "@/lib/server/firebaseAdmin";
import { ApiError } from "@/lib/server/http";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";

/**
 * Ensures profiles/{uid} exists (salons.owner_id has a foreign key to it),
 * keeping email/name/avatar in sync with whatever Firebase last reported.
 * Called once, right before a salon is created — there's no standalone
 * "sign up" step, so this is the natural place for it.
 */
export async function upsertProfileFromToken(decoded: VerifiedFirebaseToken): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("profiles")
    .upsert({
      id: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
      avatar_url: decoded.picture ?? null,
    });

  if (error) throw new ApiError(500, error.message);
}
