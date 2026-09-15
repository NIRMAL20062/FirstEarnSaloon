import type { Database } from "@/types/database";
import type { Offer, Salon, Service } from "@/types/models";

// Plain snake_case (Postgres) → camelCase (app) row mappers. Shared by the
// public Supabase queries (src/lib/queries/*.ts) and the /api/** Route
// Handlers (src/app/api/**), so there's exactly one place that knows the
// column names.

export function fromSalonRow(row: Database["public"]["Tables"]["salons"]["Row"]): Salon {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url,
    phone: row.phone,
    whatsapp: row.whatsapp,
    address: row.address,
    openingHours: row.opening_hours,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export function fromServiceRow(row: Database["public"]["Tables"]["services"]["Row"]): Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    price: Number(row.price),
    imageUrl: row.image_url,
    active: row.active,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export function fromOfferRow(row: Database["public"]["Tables"]["offers"]["Row"]): Offer {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    oldPrice: row.old_price !== null ? Number(row.old_price) : null,
    imageUrl: row.image_url,
    active: row.active,
    validUntil: row.valid_until ? new Date(row.valid_until).getTime() : null,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}
