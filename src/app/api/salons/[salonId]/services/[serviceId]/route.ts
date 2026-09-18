import { NextRequest, NextResponse } from "next/server";
import { fromServiceRow } from "@/lib/models/mappers";
import { requireSalonOwnership, requireUid } from "@/lib/server/auth";
import { dbError, parseJsonBody, withErrorHandling } from "@/lib/server/http";
import { serviceUpdateSchema } from "@/lib/server/schemas";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";
import type { Database } from "@/types/database";

type Context = { params: Promise<{ salonId: string; serviceId: string }> };

export const PATCH = withErrorHandling(async (request: NextRequest, context: Context) => {
  const { salonId, serviceId } = await context.params;
  const uid = await requireUid(request);
  await requireSalonOwnership(uid, salonId);
  const patch = await parseJsonBody(request, serviceUpdateSchema);

  const columns: Database["public"]["Tables"]["services"]["Update"] = {
    ...(patch.name !== undefined && { name: patch.name }),
    ...(patch.description !== undefined && { description: patch.description }),
    ...(patch.category !== undefined && { category: patch.category }),
    ...(patch.price !== undefined && { price: patch.price }),
    ...(patch.imageUrl !== undefined && { image_url: patch.imageUrl }),
    ...(patch.active !== undefined && { active: patch.active }),
    ...(patch.sortOrder !== undefined && { sort_order: patch.sortOrder }),
  };

  const { data, error } = await getSupabaseAdmin()
    .from("services")
    .update(columns)
    .eq("id", serviceId)
    .eq("salon_id", salonId)
    .select("*")
    .single();

  if (error) throw dbError(error);
  return NextResponse.json({ service: fromServiceRow(data) });
});

export const DELETE = withErrorHandling(async (request: NextRequest, context: Context) => {
  const { salonId, serviceId } = await context.params;
  const uid = await requireUid(request);
  await requireSalonOwnership(uid, salonId);

  const { error } = await getSupabaseAdmin()
    .from("services")
    .delete()
    .eq("id", serviceId)
    .eq("salon_id", salonId);

  if (error) throw dbError(error);
  return NextResponse.json({ ok: true });
});
