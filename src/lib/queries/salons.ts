import { apiFetch } from "@/lib/api/client";
import { fromSalonRow } from "@/lib/models/mappers";
import { getSupabasePublic } from "@/lib/supabase/publicClient";
import type { Salon } from "@/types/models";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Public: used by the customer-facing salon page. No auth required. */
export async function getSalonBySlug(slug: string): Promise<Salon | null> {
  const { data, error } = await getSupabasePublic()
    .from("salons")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? fromSalonRow(data) : null;
}

/** Owner-only: the salon the signed-in user owns, or null if they haven't created one yet. */
export async function fetchMySalon(token: string): Promise<Salon | null> {
  const { salon } = await apiFetch<{ salon: Salon | null }>("/api/salons/mine", { token });
  return salon;
}

export async function createSalon(
  token: string,
  input: { name: string; slug: string }
): Promise<Salon> {
  const { salon } = await apiFetch<{ salon: Salon }>("/api/salons", {
    token,
    method: "POST",
    body: input,
  });
  return salon;
}

export type SalonSettingsInput = Partial<
  Pick<Salon, "name" | "logoUrl" | "phone" | "whatsapp" | "address" | "openingHours">
>;

export async function updateSalonSettings(
  token: string,
  salonId: string,
  patch: SalonSettingsInput
): Promise<Salon> {
  const { salon } = await apiFetch<{ salon: Salon }>(`/api/salons/${salonId}`, {
    token,
    method: "PATCH",
    body: patch,
  });
  return salon;
}
