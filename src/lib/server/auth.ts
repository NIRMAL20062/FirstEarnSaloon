import "server-only";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/server/firebaseAdmin";
import { ApiError } from "@/lib/server/http";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";

/**
 * Verifies the `Authorization: Bearer <Firebase ID token>` header on an
 * incoming request and returns the decoded token (uid + whatever profile
 * claims Firebase included, e.g. email/name/picture for a Google sign-in).
 * Throws ApiError (401) if the header is missing or the token is
 * invalid/expired.
 */
export async function requireAuth(request: NextRequest): Promise<DecodedIdToken> {
  const header = request.headers.get("authorization") ?? "";
  const idToken = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!idToken) {
    throw new ApiError(401, "Missing Authorization header");
  }

  try {
    return await verifyFirebaseIdToken(idToken);
  } catch {
    throw new ApiError(401, "Invalid or expired session — please sign in again");
  }
}

/** Convenience wrapper for routes that only need the caller's uid. */
export async function requireUid(request: NextRequest): Promise<string> {
  return (await requireAuth(request)).uid;
}

/**
 * Confirms `uid` owns `salonId`, throwing 404 if the salon doesn't exist
 * and 403 if it exists but belongs to someone else. Every /api/salons/[id]/**
 * route calls this before touching that salon's services/offers/settings.
 */
export async function requireSalonOwnership(uid: string, salonId: string): Promise<void> {
  const { data, error } = await getSupabaseAdmin()
    .from("salons")
    .select("owner_id")
    .eq("id", salonId)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(404, "Salon not found");
  if (data.owner_id !== uid) throw new ApiError(403, "You don't own this salon");
}
