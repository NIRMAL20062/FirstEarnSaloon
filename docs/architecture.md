# Salon QR Digital Menu — Architecture

This is the current architecture. An earlier draft
(`docs/architecture-original-supabase-draft.md`) proposed Supabase Auth +
Supabase everything; this version keeps Supabase for the database and file
storage but uses **Firebase Auth** for sign-in instead. For the exact
implementation-level reasoning and file layout, see `CLAUDE.md` — this
document stays at the product/architecture level.

## 1. Product overview

A lightweight web application for salons where customers scan a physical QR
code placed inside the salon and immediately see the salon's services and
offers.

### Customer

```
Physical QR
    ↓
Public salon page
    ↓
Services + offers
```

Customers do **not** need: login, signup, app installation, a customer
account, booking, or payment.

### Salon owner

The salon owner signs in with Google or email/password and manages the
salon's services and offers.

```
Owner
  ↓
/admin/login (Firebase Auth: Google or email/password)
  ↓
Admin dashboard
  ↓
Create / edit / delete services & offers
```

---

## 2. Core architecture

```
                         ┌──────────────────────┐
                         │       CUSTOMER        │
                         │     Scan QR code      │
                         └──────────┬────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   PUBLIC SALON PAGE   │
                         │    /salon/[slug]      │
                         └──────────┬────────────┘
                                    │ anon-key read (RLS: active/public rows only)
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│                              SUPABASE                              │
│  Postgres: profiles, salons, services, offers                     │
│  Storage: salon-images (public bucket)                            │
└───────────────────────────────────┬───────────────────────────────┘
                                    ▲
                                    │ service-role read/write,
                                    │ only after Firebase ID token
                                    │ verification + ownership check
                         ┌──────────┴────────────┐
                         │   ADMIN DASHBOARD      │
                         │       /admin           │
                         │                        │
                         │  Firebase Auth login    │
                         │  Services CRUD          │
                         │  Offers CRUD            │
                         │  Salon settings         │
                         └────────────────────────┘
```

The owner's browser never talks to Supabase directly for anything other
than reading their own already-public data the same way a customer would.
Every write — and every read of data that isn't public (e.g. inactive
services) — goes through a Next.js Route Handler under `/api/salons/**`,
which verifies the caller's Firebase identity and salon ownership before
using a Supabase service-role key. See CLAUDE.md § Architecture for why.

---

## 3. Technology stack

| Layer          | Technology                          |
| -------------- | ------------------------------------ |
| Framework      | Next.js (App Router, TypeScript)     |
| UI             | React, Tailwind CSS                  |
| Authentication | Firebase Auth (Google + Email/Password) |
| Database       | Supabase (Postgres)                  |
| File storage   | Supabase Storage                     |
| Hosting        | Vercel                               |
| QR code        | `qrcode.react`                       |

Initial infrastructure cost: **₹0** — this fits comfortably inside
Firebase's and Supabase's free tiers for an initial small deployment.

---

## 4. Routes

### Public

```
/salon/[slug]
```

This is the URL encoded into the physical QR code, e.g.
`https://yourdomain.com/salon/abc-salon`.

### Admin (all require a signed-in owner)

```
/admin/login
/admin                (dashboard overview)
/admin/services
/admin/offers
/admin/settings
```

### API (used by the admin dashboard only; see CLAUDE.md)

```
POST   /api/salons
GET    /api/salons/mine
PATCH  /api/salons/[salonId]
GET    /api/salons/[salonId]/services       POST   /api/salons/[salonId]/services
PATCH  /api/salons/[salonId]/services/[id]  DELETE /api/salons/[salonId]/services/[id]
GET    /api/salons/[salonId]/offers         POST   /api/salons/[salonId]/offers
PATCH  /api/salons/[salonId]/offers/[id]    DELETE /api/salons/[salonId]/offers/[id]
POST   /api/salons/[salonId]/images
```

---

## 5. Data model

The system is multi-salon ready even though the first deployment has a
single salon.

```
profiles                 salons                    services / offers
──────────                ──────                    ──────────────────
id (Firebase uid)  ──┐    id (uuid)                 id (uuid)
email               │    owner_id ─────────────►    salon_id ───► salons.id
name                └──► name                       name / title
avatar_url               slug (unique)               description
created_at               logo_url                    price [/ old_price]
                          phone / whatsapp             image_url
                          address                      active
                          opening_hours                sort_order
                          created_at / updated_at      [valid_until — offers only]
                                                        created_at / updated_at
```

`profiles.id` is a Firebase Auth **uid** (a text string), not a
Supabase-generated id — see CLAUDE.md for why. Full column definitions and
RLS policies live in `supabase/migrations/0001_init.sql` (schema) and
`0002_storage.sql` (the `salon-images` bucket).

---

## 6. Authentication & authorization

**Authentication** ("who is this?") is Firebase Auth. Customers never go
through it at all.

**Authorization** ("what can they touch?") happens in Next.js Route
Handlers, not in Postgres RLS — see CLAUDE.md § Architecture for the full
explanation of why RLS's `auth.uid()` doesn't work here and what replaces
it (`requireUid()` + `requireSalonOwnership()`).

Public visitors can only ever read: salon name/logo/contact info, and
active services/offers — enforced by RLS on the anon key
(`supabase/migrations/0001_init.sql`), independent of the app-level checks.

---

## 7. Public customer page

Optimized for mobile — customers land here immediately after scanning a
QR code, often on a slow connection.

```
┌─────────────────────────────┐
│         SALON LOGO          │
│         SALON NAME          │
├─────────────────────────────┤
│      SPECIAL OFFERS         │
│  Hair + Beard  ₹499 → ₹349  │
├─────────────────────────────┤
│       SERVICES               │
│  HAIR                        │
│   Haircut             ₹299   │
│   Styling              ₹499  │
│  BEARD                       │
│   Beard Trim           ₹149  │
├─────────────────────────────┤
│  Call        WhatsApp        │
│  Address / location          │
└─────────────────────────────┘
```

Requirements: mobile-first, fast-loading, no login, no unnecessary
animation, clear prices, clear categories, works on slow networks.

---

## 8. QR code

The QR code encodes **only** the permanent public URL
(`https://yourdomain.com/salon/[slug]`) — never the actual services/offers.
The owner can update services and offers freely without ever reprinting the
QR code.

```
QR → URL → database → current offers/services
```

---

## 9. Development phases

1. **UI** — build the public mobile page against static data.
2. **Database** — stand up Supabase (`profiles`, `salons`, `services`,
   `offers`), connect the public page to it via the anon key.
3. **Authentication** — Firebase Auth (Google + email/password), gate `/admin`.
4. **Admin** — services CRUD, offers CRUD, salon settings, via `/api/salons/**`.
5. **Security** — verify ownership checks on every Route Handler; confirm
   the anon key truly can't write anything and can't read inactive rows.
6. **QR** — generate and print the QR code for `/salon/[slug]`.
7. **Deployment** — Next.js → Vercel; Supabase + Firebase stay hosted as-is.

---

## 10. V1 scope

### Include

Public salon page, QR code, services, offers, prices, categories, salon
logo, phone, WhatsApp, address, Google/email admin auth, admin dashboard,
service CRUD, offer CRUD, active/inactive status, mobile-responsive design.

### Do NOT include in V1

Customer accounts, customer login, appointment booking, online payments,
customer reviews, loyalty system, notifications, rider/home-service system,
complex analytics, chat, subscription billing.

---

## 11. Future: multi-salon

Although the first customer is one salon, the schema is already
multi-tenant: every salon has an `owner_id`, every service/offer has a
`salon_id`. The same application can support many salons without a schema
change.
