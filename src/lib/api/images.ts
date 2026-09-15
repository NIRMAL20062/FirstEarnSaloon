"use client";

import { ApiRequestError } from "@/lib/api/client";

/**
 * Uploads an image to Supabase Storage via POST /api/salons/[salonId]/images
 * and returns its public URL. Separate from apiFetch() because this sends
 * multipart/form-data — the browser needs to set its own Content-Type
 * (with the multipart boundary), not the JSON one apiFetch always sends.
 */
export async function uploadSalonImage(
  token: string,
  salonId: string,
  folder: "logo" | "services" | "offers",
  file: File
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  const response = await fetch(`/api/salons/${salonId}/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiRequestError(response.status, json?.error ?? "Upload failed");
  }
  return json.url as string;
}
