import { apiFetch } from "@/lib/api/client";
import { fromServiceRow } from "@/lib/models/mappers";
import { getSupabasePublic } from "@/lib/supabase/publicClient";
import type { Service, ServiceInput } from "@/types/models";

/** Public: only active services, cheapest sort first. No auth required. */
export async function getActiveServices(salonId: string): Promise<Service[]> {
  const { data, error } = await getSupabasePublic()
    .from("services")
    .select("*")
    .eq("salon_id", salonId)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(fromServiceRow);
}

/** Owner-only: every service (active + inactive), for the admin dashboard. */
export async function listAllServices(token: string, salonId: string): Promise<Service[]> {
  const { services } = await apiFetch<{ services: Service[] }>(
    `/api/salons/${salonId}/services`,
    { token }
  );
  return services;
}

export async function addService(
  token: string,
  salonId: string,
  input: ServiceInput
): Promise<Service> {
  const { service } = await apiFetch<{ service: Service }>(`/api/salons/${salonId}/services`, {
    token,
    method: "POST",
    body: input,
  });
  return service;
}

export async function updateService(
  token: string,
  salonId: string,
  serviceId: string,
  patch: Partial<ServiceInput>
): Promise<Service> {
  const { service } = await apiFetch<{ service: Service }>(
    `/api/salons/${salonId}/services/${serviceId}`,
    { token, method: "PATCH", body: patch }
  );
  return service;
}

export async function setServiceActive(
  token: string,
  salonId: string,
  serviceId: string,
  active: boolean
): Promise<Service> {
  return updateService(token, salonId, serviceId, { active });
}

export async function deleteService(
  token: string,
  salonId: string,
  serviceId: string
): Promise<void> {
  await apiFetch<{ ok: true }>(`/api/salons/${salonId}/services/${serviceId}`, {
    token,
    method: "DELETE",
  });
}
