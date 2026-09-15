import "server-only";
import { z } from "zod";

// Shared validation for every /api/** Route Handler body. Nothing here is
// optional-by-accident: these routes bypass Row Level Security (they use
// the service-role Supabase client), so malformed or malicious input has
// to be caught here rather than relying on the database to reject it.

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const createSalonSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).regex(slugPattern, "Use lowercase letters, numbers and hyphens only"),
});

export const updateSalonSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    logoUrl: z.string().url().nullable(),
    phone: z.string().trim().max(40).nullable(),
    whatsapp: z.string().trim().max(40).nullable(),
    address: z.string().trim().max(500).nullable(),
    openingHours: z.string().trim().max(200).nullable(),
  })
  .partial();

const serviceInputBase = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).nullable(),
  category: z.string().trim().min(1).max(100),
  price: z.number().min(0).max(1_000_000),
  imageUrl: z.string().url().nullable(),
  active: z.boolean(),
  sortOrder: z.number().int(),
});

export const serviceCreateSchema = serviceInputBase;
export const serviceUpdateSchema = serviceInputBase.partial();

const offerInputBase = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).nullable(),
  price: z.number().min(0).max(1_000_000),
  oldPrice: z.number().min(0).max(1_000_000).nullable(),
  imageUrl: z.string().url().nullable(),
  active: z.boolean(),
  validUntil: z.number().int().nullable(), // epoch ms
  sortOrder: z.number().int(),
});

export const offerCreateSchema = offerInputBase;
export const offerUpdateSchema = offerInputBase.partial();
