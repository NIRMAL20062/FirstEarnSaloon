import { NextRequest, NextResponse } from "next/server";
import { fromSalonRow } from "@/lib/models/mappers";
import { requireAuth } from "@/lib/server/auth";
import { ApiError, dbError, parseJsonBody, withErrorHandling } from "@/lib/server/http";
import { upsertProfileFromToken } from "@/lib/server/profiles";
import { createSalonSchema } from "@/lib/server/schemas";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const decoded = await requireAuth(request);
  const input = await parseJsonBody(request, createSalonSchema);

  // salons.owner_id has a foreign key to profiles(id) — make sure the row
  // exists before inserting. There's no separate "sign up" step in this
  // app, so this is the natural place to create it.
  await upsertProfileFromToken(decoded);

  const { data, error } = await getSupabaseAdmin()
    .from("salons")
    .insert({ owner_id: decoded.uid, name: input.name, slug: input.slug })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      // Distinguish which unique constraint fired: the owner_id one (see
      // supabase/migrations/0004_salon_owner_unique.sql) means this owner
      // already has a salon — not that their chosen slug collided.
      if (error.message.includes("salons_owner_id_key")) {
        throw new ApiError(409, "You already have a salon.");
      }
      throw new ApiError(409, `"${input.slug}" is already taken — try a different slug.`);
    }
    throw dbError(error);
  }

  return NextResponse.json({ salon: fromSalonRow(data) }, { status: 201 });
});
