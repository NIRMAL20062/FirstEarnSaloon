/**
 * Firestore data model.
 *
 *   profiles/{uid}
 *   salons/{salonId}
 *   salons/{salonId}/services/{serviceId}
 *   salons/{salonId}/offers/{offerId}
 *
 * All timestamps are stored as Firestore Timestamps and surfaced here as
 * epoch milliseconds (`number`) for easy use in components.
 */

export interface Profile {
  id: string; // == Firebase Auth uid
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  createdAt: number;
}

export interface Salon {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  openingHours: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  imageUrl: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  imageUrl: string | null;
  active: boolean;
  /** epoch ms, or null if the offer has no expiry */
  validUntil: number | null;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

/** Fields an owner can set when creating a service; server fills the rest. */
export type ServiceInput = Pick<
  Service,
  "name" | "description" | "category" | "price" | "imageUrl" | "active" | "sortOrder"
>;

/** Fields an owner can set when creating an offer; server fills the rest. */
export type OfferInput = Pick<
  Offer,
  | "title"
  | "description"
  | "price"
  | "oldPrice"
  | "imageUrl"
  | "active"
  | "validUntil"
  | "sortOrder"
>;
