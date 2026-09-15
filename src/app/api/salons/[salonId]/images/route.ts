import { NextRequest, NextResponse } from "next/server";
import { requireSalonOwnership, requireUid } from "@/lib/server/auth";
import { ApiError, withErrorHandling } from "@/lib/server/http";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";

const ALLOWED_FOLDERS = new Set(["logo", "services", "offers"]);
const MAX_BYTES = 5 * 1024 * 1024;
const BUCKET = "salon-images";

type Context = { params: Promise<{ salonId: string }> };

// Uploads a logo/service/offer image to Supabase Storage. The browser
// never talks to Supabase Storage directly — Storage RLS has the same
// "doesn't know about Firebase identities" problem as Postgres RLS does
// (see supabase/migrations/0001_init.sql), so uploads go through this
// authenticated Route Handler and the service-role client instead.
export const POST = withErrorHandling(async (request: NextRequest, context: Context) => {
  const { salonId } = await context.params;
  const uid = await requireUid(request);
  await requireSalonOwnership(uid, salonId);

  const form = await request.formData();
  const file = form.get("file");
  const folder = form.get("folder");

  if (!(file instanceof File)) throw new ApiError(400, "Missing file");
  if (typeof folder !== "string" || !ALLOWED_FOLDERS.has(folder)) {
    throw new ApiError(400, "Invalid folder");
  }
  if (!file.type.startsWith("image/")) throw new ApiError(400, "File must be an image");
  if (file.size > MAX_BYTES) throw new ApiError(400, "Image must be smaller than 5MB");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const path = `${salonId}/${folder}/${Date.now()}-${safeName}`;

  const supabase = getSupabaseAdmin();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (uploadError) throw new ApiError(500, uploadError.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
});
