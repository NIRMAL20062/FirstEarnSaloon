@AGENTS.md

# Salon QR Menu

A lightweight web app for salons: customers scan a QR code placed in the
salon and immediately see that salon's services and current offers — no
login, no app install, no booking, no payment. The salon owner signs in
separately to manage their services/offers/salon info from an admin
dashboard. Full product spec and phased rollout plan: `docs/architecture.md`
(an earlier draft, written against Supabase Auth, lives at
`docs/architecture-original-supabase-draft.md` for reference only — this
file and `docs/architecture.md` are the current source of truth).

## Tech stack

| Layer          | Technology                                             |
| -------------- | ------------------------------------------------------- |
| Framework      | Next.js (App Router, TypeScript)                       |
| UI             | React, Tailwind CSS                                    |
| Authentication | **Firebase Auth** (Google + Email/Password)             |
| Database       | **Supabase** (Postgres)                                 |
| File storage   | **Supabase Storage** (salon logos, service/offer images) |
| Hosting        | Vercel                                                  |
| QR code        | `qrcode.react`                                          |

This is a deliberate hybrid: identity lives in Firebase, data lives in
Supabase. Read the next section before touching any data-access code — the
split has one direct consequence on how authorization works here.

## Architecture: why Route Handlers, not Supabase RLS + `auth.uid()`

Supabase's row-level security is built around `auth.uid()`, which is only
ever populated from a **Supabase-issued** JWT. Nobody in this app signs in
to Supabase — everybody signs in to Firebase — so `auth.uid()` is always
null here. An RLS policy like `using (owner_id = auth.uid())` would look
correct and would deny every single request.

So authorization is handled in application code instead, in exactly one
place: every mutating (or owner-only-read) endpoint lives under
`src/app/api/salons/**` and follows this shape:

```ts
const { salonId } = await context.params;
const uid = await requireUid(request); // verifies the Firebase ID token
await requireSalonOwnership(uid, salonId); // 404 / 403 as appropriate
// ...then read/write with the Supabase SERVICE ROLE client, which
// bypasses RLS entirely (that's expected — it's how it's authorized).
```

- `src/lib/server/firebaseAdmin.ts` verifies the caller's Firebase ID token
  (sent as `Authorization: Bearer <token>` from the browser).
- `src/lib/server/auth.ts` — `requireUid()` / `requireAuth()` wrap that
  verification; `requireSalonOwnership()` checks `salons.owner_id` against
  the verified uid.
- `src/lib/server/supabaseAdmin.ts` is the **service-role** Supabase client
  — server-only, never import it from a Client Component.
- `src/lib/supabase/publicClient.ts` is the **anon-key** Supabase client —
  used only for the public salon page's reads (active services/offers,
  public salon fields). RLS policies in
  `supabase/migrations/0001_init.sql` define exactly what that key can see;
  they have no write rules at all, because the anon key never writes
  anything.
- `src/lib/api/client.ts` (`apiFetch`) is how Client Components call the
  Route Handlers, attaching the current Firebase ID token
  (`await user.getIdToken()`) to every request.

**Consequence for you:** never add an RLS policy that references
`auth.uid()`, and never call `getSupabaseAdmin()` from a Client Component.
See `.claude/skills/add-salon-resource/SKILL.md` for the full checklist
when adding a table, field, or endpoint — follow it exactly.

## Directory structure

```
src/
  app/
    page.tsx                    marketing/landing page
    salon/[slug]/page.tsx       public salon page (Server Component, anon Supabase reads)
    admin/
      login/page.tsx            Google + email/password sign-in (ungated)
      (dashboard)/layout.tsx    auth + "has a salon?" gate, wraps everything below
      (dashboard)/page.tsx      dashboard overview
      (dashboard)/services/     services CRUD
      (dashboard)/offers/       offers CRUD
      (dashboard)/settings/     salon settings, logo upload, QR code
    api/salons/**                Route Handlers — see Architecture above
  components/
    public/                     presentational, used by the salon page
    admin/                      presentational + forms, used by the dashboard
  lib/
    firebase/client.ts           Firebase Auth only (lazy-initialized — see below)
    supabase/publicClient.ts     anon-key Supabase client (public reads)
    server/                      firebase-admin, service-role Supabase client, auth/ownership checks, zod schemas — server-only
    auth/                        AuthContext (React), sign-in/out actions
    salon/SalonContext.tsx       the current salon, provided by the dashboard layout
    queries/                     salons.ts / services.ts / offers.ts — the data layer components call
    models/mappers.ts            snake_case (Postgres) → camelCase (app) row mappers
    api/client.ts                apiFetch() — attaches the Firebase ID token to /api/** calls
    hooks/useOwnerSalon.ts        loads the signed-in owner's salon
  types/
    database.ts                  hand-written Supabase schema types (see file header to regenerate)
    models.ts                    app-facing Salon/Service/Offer types
supabase/migrations/             SQL migrations — see Setup below
```

## Why Firebase/Supabase clients are lazily initialized

`src/lib/firebase/client.ts`, `src/lib/supabase/publicClient.ts`, and
`src/lib/server/supabaseAdmin.ts` all create their client **lazily**
(inside a `get...()` function), not as an eager module-level `const`.
Firebase's SDK throws synchronously the moment `getAuth()` runs against a
missing/invalid config, and Next.js imports every route module while
collecting page data at build time — so an eager `export const auth =
getAuth(...)` breaks `next build` for the *entire app* the moment
`.env.local` isn't fully populated, even for routes that never touch
Auth/Supabase. Keep new Firebase/Supabase usage behind a function the same
way; don't hoist a client to module scope.

## Setup

You need **two** separate backend projects:

### 1. Firebase project (Authentication only)

1. Create a project at console.firebase.google.com.
2. Authentication → Sign-in method → enable **Google** and **Email/Password**.
3. Project settings → General → Your apps → add a Web app → copy the config
   into `NEXT_PUBLIC_FIREBASE_*` in `.env.local` (copy `.env.local.example` first).
4. Project settings → Service accounts → Generate new private key → download
   the JSON → `base64 -w0 the-file.json` → paste into
   `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`. This is what
   `src/lib/server/firebaseAdmin.ts` uses to verify ID tokens; it's the only
   thing that makes the Route Handlers trust who's calling.

### 2. Supabase project (Database + Storage)

1. Create a project at supabase.com.
2. Run the migrations in `supabase/migrations/` against it, in order — either
   paste each file into the SQL Editor, or, with the Supabase CLI:
   ```
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
3. Project Settings → API → copy the Project URL, `anon` key, and
   `service_role` key into `.env.local`.

Then `npm install && npm run dev`.

## Commands

```
npm run dev      # local dev server
npm run build    # production build (also type-checks)
npm run lint     # eslint
```

## V1 scope

See `docs/architecture.md` §20. In short: services, offers, salon
logo/phone/WhatsApp/address/hours, Google/email admin login, services &
offers CRUD with active/inactive toggling, QR code, mobile-first public
page. **Not** in V1: customer accounts, booking, payments, reviews,
loyalty, notifications, multi-language, analytics.
