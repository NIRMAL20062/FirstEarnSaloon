import { NextRequest, NextResponse } from "next/server";
import { fromSalonRow } from "@/lib/models/mappers";
import { requireUid } from "@/lib/server/auth";
import { ApiError, withErrorHandling } from "@/lib/server/http";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";

// V1 keeps this to one salon per owner.
export const GET = withErrorHandling(async (request: NextRequest) => {
  const uid = await requireUid(request);

  const { data, error } = await getSupabaseAdmin()
    .from("salons")
    .select("*")
    .eq("owner_id", uid)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message);
  return NextResponse.json({ salon: data ? fromSalonRow(data) : null });
});
