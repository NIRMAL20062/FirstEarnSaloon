import { NextRequest, NextResponse } from "next/server";
import { fromSalonRow } from "@/lib/models/mappers";
import { requireSalonOwnership, requireUid } from "@/lib/server/auth";
import { ApiError, parseJsonBody, withErrorHandling } from "@/lib/server/http";
import { updateSalonSchema } from "@/lib/server/schemas";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";
import type { Database } from "@/types/database";

type Context = { params: Promise<{ salonId: string }> };

export const PATCH = withErrorHandling(async (request: NextRequest, context: Context) => {
  const { salonId } = await context.params;
  const uid = await requireUid(request);
  await requireSalonOwnership(uid, salonId);
  const patch = await parseJsonBody(request, updateSalonSchema);

  const columns: Database["public"]["Tables"]["salons"]["Update"] = {
    ...(patch.name !== undefined && { name: patch.name }),
    ...(patch.logoUrl !== undefined && { logo_url: patch.logoUrl }),
    ...(patch.phone !== undefined && { phone: patch.phone }),
    ...(patch.whatsapp !== undefined && { whatsapp: patch.whatsapp }),
    ...(patch.address !== undefined && { address: patch.address }),
    ...(patch.openingHours !== undefined && { opening_hours: patch.openingHours }),
  };

  const { data, error } = await getSupabaseAdmin()
    .from("salons")
    .update(columns)
    .eq("id", salonId)
    .select("*")
    .single();

  if (error) throw new ApiError(500, error.message);
  return NextResponse.json({ salon: fromSalonRow(data) });
});
