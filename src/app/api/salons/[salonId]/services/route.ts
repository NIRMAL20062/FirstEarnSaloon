import { NextRequest, NextResponse } from "next/server";
import { fromServiceRow } from "@/lib/models/mappers";
import { requireSalonOwnership, requireUid } from "@/lib/server/auth";
import { ApiError, parseJsonBody, withErrorHandling } from "@/lib/server/http";
import { serviceCreateSchema } from "@/lib/server/schemas";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";

type Context = { params: Promise<{ salonId: string }> };

// Owner-only listing (active + inactive) — the public salon page reads
// active services directly from Supabase with the anon key instead (see
// src/lib/queries/services.ts#getActiveServices).
export const GET = withErrorHandling(async (request: NextRequest, context: Context) => {
  const { salonId } = await context.params;
  const uid = await requireUid(request);
  await requireSalonOwnership(uid, salonId);

  const { data, error } = await getSupabaseAdmin()
    .from("services")
    .select("*")
    .eq("salon_id", salonId)
    .order("sort_order", { ascending: true });

  if (error) throw new ApiError(500, error.message);
  return NextResponse.json({ services: (data ?? []).map(fromServiceRow) });
});

export const POST = withErrorHandling(async (request: NextRequest, context: Context) => {
  const { salonId } = await context.params;
  const uid = await requireUid(request);
  await requireSalonOwnership(uid, salonId);
  const input = await parseJsonBody(request, serviceCreateSchema);

  const { data, error } = await getSupabaseAdmin()
    .from("services")
    .insert({
      salon_id: salonId,
      name: input.name,
      description: input.description,
      category: input.category,
      price: input.price,
      image_url: input.imageUrl,
      active: input.active,
      sort_order: input.sortOrder,
    })
    .select("*")
    .single();

  if (error) throw new ApiError(500, error.message);
  return NextResponse.json({ service: fromServiceRow(data) }, { status: 201 });
});
