---
name: add-salon-resource
description: Add a new owner-managed resource (like services/offers) or a new field to an existing one, following this project's Firebase-Auth + Supabase-service-role pattern. Use when asked to add a new table/entity under a salon, or add/change a field on salons/services/offers.
---

# Adding a salon resource or field

This project's data layer has one consistent shape everywhere (see
`CLAUDE.md` → Architecture for the why). Follow it exactly rather than
improvising — the pattern exists specifically because Supabase's Row Level
Security can't see Firebase identities, so every privileged operation is
hand-authorized in a Route Handler instead of in the database.

## Adding a field to an existing table (services/offers/salons)

Touch these files, in this order:

1. **`supabase/migrations/000N_description.sql`** — a new migration (never
   edit an already-applied one) with `alter table ... add column ...`.
2. **`src/types/database.ts`** — add the column to that table's `Row`,
   `Insert`, and (if owner-editable) `Update` types. Keep `Relationships: []`
   and the schema's `Views`/`Functions`/`Enums`/`CompositeTypes` as-is.
3. **`src/lib/models/mappers.ts`** — map the new `snake_case` column to its
   `camelCase` app field in the relevant `from*Row` function.
4. **`src/types/models.ts`** — add the field to the corresponding app type
   (`Salon`/`Service`/`Offer`) and to its `*Input` type if the owner can set
   it.
5. **`src/lib/server/schemas.ts`** — add validation for the new field to the
   relevant zod schema(s) (create *and* update, if both apply).
6. **The Route Handler(s)** under `src/app/api/salons/[salonId]/...` — add
   the column to the `columns` object literal (create/insert calls can
   usually just spread `input`; `update` handlers build `columns` field by
   field with `...(patch.x !== undefined && { x: patch.x })` — see any
   existing PATCH handler for the pattern, and note *why* it's written that
   way: `.update()` rejects a loosely-typed `Record<string, unknown>`, so
   `columns` must be declared with the exact `Database[...]["Update"]` type).
7. **The admin form** (`ServiceForm.tsx`/`OfferForm.tsx`/settings page) — add
   the input control, and thread the value through `onSubmit`.
8. If the public salon page should show it, thread it through the relevant
   `components/public/*` component too.

## Adding a whole new resource (a new table alongside services/offers)

Repeat the full pattern already used for services/offers:

- **Migration**: new table with `salon_id uuid references salons(id) on
  delete cascade`, RLS enabled, and — if customers should ever see it — a
  `for select using (active = true)` (or similar) public policy. Nothing
  else: there is no INSERT/UPDATE/DELETE policy for anyone, ever, because
  all writes go through the service-role client.
- **`src/types/database.ts`**: add the table (Row/Insert/Update/Relationships).
- **`src/lib/models/mappers.ts`** + **`src/types/models.ts`**: add the
  `from*Row` mapper and the app-facing type + `*Input` type.
- **Public read** (if applicable) in `src/lib/queries/<resource>.ts`, using
  `getSupabasePublic()` — mirror `getActiveServices`/`getActiveOffers`.
- **Owner CRUD** in `src/lib/queries/<resource>.ts`, calling `apiFetch()`
  against new Route Handlers — mirror `services.ts`/`offers.ts` exactly
  (list/add/update/setActive/delete).
- **Route Handlers** under `src/app/api/salons/[salonId]/<resource>/route.ts`
  (GET list + POST create) and `.../[resourceId]/route.ts` (PATCH + DELETE).
  Every handler starts the same way:
  ```ts
  const { salonId } = await context.params;
  const uid = await requireUid(request);
  await requireSalonOwnership(uid, salonId);
  ```
  Never skip `requireSalonOwnership` — it's the *only* thing standing
  between an owner and someone else's data for a resource reached by
  `salonId` in the URL.
- **UI**: an admin list page (mirror `services/page.tsx`), a form component
  (mirror `ServiceForm.tsx`), and a public component if customers see it.

## Don't

- Don't add an RLS policy that references `auth.uid()` — it will always be
  null here (nobody signs in to Supabase itself) and silently deny
  everything. Ownership checks belong in `requireSalonOwnership()`, not SQL.
- Don't call `getSupabaseAdmin()` from a Client Component — it holds the
  service-role key and only works in `server-only`-guarded files.
- Don't build `.update()` payloads as `Record<string, unknown>` — type them
  as `Database[...]["Update"]` and use the conditional-spread pattern, or
  `@supabase/supabase-js` will reject the call at compile time.
