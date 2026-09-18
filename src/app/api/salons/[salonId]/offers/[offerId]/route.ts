import { NextRequest, NextResponse } from "next/server";
import { fromOfferRow } from "@/lib/models/mappers";
import { requireSalonOwnership, requireUid } from "@/lib/server/auth";
import { dbError, parseJsonBody, withErrorHandling } from "@/lib/server/http";
import { offerUpdateSchema } from "@/lib/server/schemas";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";
import type { Database } from "@/types/database";

type Context = { params: Promise<{ salonId: string; offerId: string }> };

export const PATCH = withErrorHandling(async (request: NextRequest, context: Context) => {
  const { salonId, offerId } = await context.params;
  const uid = await requireUid(request);
  await requireSalonOwnership(uid, salonId);
  const patch = await parseJsonBody(request, offerUpdateSchema);

  const columns: Database["public"]["Tables"]["offers"]["Update"] = {
    ...(patch.title !== undefined && { title: patch.title }),
    ...(patch.description !== undefined && { description: patch.description }),
    ...(patch.price !== undefined && { price: patch.price }),
    ...(patch.oldPrice !== undefined && { old_price: patch.oldPrice }),
    ...(patch.imageUrl !== undefined && { image_url: patch.imageUrl }),
    ...(patch.active !== undefined && { active: patch.active }),
    ...(patch.validUntil !== undefined && {
      valid_until: patch.validUntil ? new Date(patch.validUntil).toISOString().slice(0, 10) : null,
    }),
    ...(patch.sortOrder !== undefined && { sort_order: patch.sortOrder }),
  };

  const { data, error } = await getSupabaseAdmin()
    .from("offers")
    .update(columns)
    .eq("id", offerId)
    .eq("salon_id", salonId)
    .select("*")
    .single();

  if (error) throw dbError(error);
  return NextResponse.json({ offer: fromOfferRow(data) });
});

export const DELETE = withErrorHandling(async (request: NextRequest, context: Context) => {
  const { salonId, offerId } = await context.params;
  const uid = await requireUid(request);
  await requireSalonOwnership(uid, salonId);

  const { error } = await getSupabaseAdmin()
    .from("offers")
    .delete()
    .eq("id", offerId)
    .eq("salon_id", salonId);

  if (error) throw dbError(error);
  return NextResponse.json({ ok: true });
});
