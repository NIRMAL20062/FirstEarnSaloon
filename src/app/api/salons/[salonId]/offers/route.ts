import { NextRequest, NextResponse } from "next/server";
import { fromOfferRow } from "@/lib/models/mappers";
import { requireSalonOwnership, requireUid } from "@/lib/server/auth";
import { ApiError, parseJsonBody, withErrorHandling } from "@/lib/server/http";
import { offerCreateSchema } from "@/lib/server/schemas";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";

type Context = { params: Promise<{ salonId: string }> };

// Owner-only listing (active + inactive) — the public salon page reads
// active offers directly from Supabase with the anon key instead (see
// src/lib/queries/offers.ts#getActiveOffers).
export const GET = withErrorHandling(async (request: NextRequest, context: Context) => {
  const { salonId } = await context.params;
  const uid = await requireUid(request);
  await requireSalonOwnership(uid, salonId);

  const { data, error } = await getSupabaseAdmin()
    .from("offers")
    .select("*")
    .eq("salon_id", salonId)
    .order("sort_order", { ascending: true });

  if (error) throw new ApiError(500, error.message);
  return NextResponse.json({ offers: (data ?? []).map(fromOfferRow) });
});

export const POST = withErrorHandling(async (request: NextRequest, context: Context) => {
  const { salonId } = await context.params;
  const uid = await requireUid(request);
  await requireSalonOwnership(uid, salonId);
  const input = await parseJsonBody(request, offerCreateSchema);

  const { data, error } = await getSupabaseAdmin()
    .from("offers")
    .insert({
      salon_id: salonId,
      title: input.title,
      description: input.description,
      price: input.price,
      old_price: input.oldPrice,
      image_url: input.imageUrl,
      active: input.active,
      valid_until: input.validUntil ? new Date(input.validUntil).toISOString().slice(0, 10) : null,
      sort_order: input.sortOrder,
    })
    .select("*")
    .single();

  if (error) throw new ApiError(500, error.message);
  return NextResponse.json({ offer: fromOfferRow(data) }, { status: 201 });
});
