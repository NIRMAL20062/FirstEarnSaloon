import { apiFetch } from "@/lib/api/client";
import { fromOfferRow } from "@/lib/models/mappers";
import { getSupabasePublic } from "@/lib/supabase/publicClient";
import type { Offer, OfferInput } from "@/types/models";

/**
 * Public: only active offers, cheapest sort first. Expiry (valid_until) is
 * filtered client-side rather than in the query — offer lists are small,
 * and it saves a second index just for this.
 */
export async function getActiveOffers(salonId: string): Promise<Offer[]> {
  const { data, error } = await getSupabasePublic()
    .from("offers")
    .select("*")
    .eq("salon_id", salonId)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  const now = Date.now();
  return (data ?? [])
    .map(fromOfferRow)
    .filter((offer) => offer.validUntil === null || offer.validUntil >= now);
}

/** Owner-only: every offer (active + inactive), for the admin dashboard. */
export async function listAllOffers(token: string, salonId: string): Promise<Offer[]> {
  const { offers } = await apiFetch<{ offers: Offer[] }>(`/api/salons/${salonId}/offers`, {
    token,
  });
  return offers;
}

export async function addOffer(token: string, salonId: string, input: OfferInput): Promise<Offer> {
  const { offer } = await apiFetch<{ offer: Offer }>(`/api/salons/${salonId}/offers`, {
    token,
    method: "POST",
    body: input,
  });
  return offer;
}

export async function updateOffer(
  token: string,
  salonId: string,
  offerId: string,
  patch: Partial<OfferInput>
): Promise<Offer> {
  const { offer } = await apiFetch<{ offer: Offer }>(`/api/salons/${salonId}/offers/${offerId}`, {
    token,
    method: "PATCH",
    body: patch,
  });
  return offer;
}

export async function setOfferActive(
  token: string,
  salonId: string,
  offerId: string,
  active: boolean
): Promise<Offer> {
  return updateOffer(token, salonId, offerId, { active });
}

export async function deleteOffer(token: string, salonId: string, offerId: string): Promise<void> {
  await apiFetch<{ ok: true }>(`/api/salons/${salonId}/offers/${offerId}`, {
    token,
    method: "DELETE",
  });
}
