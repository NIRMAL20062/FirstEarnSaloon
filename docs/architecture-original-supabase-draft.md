# Salon QR Digital Menu --- Architecture

## 1. Product Overview

A lightweight web application for salons where customers scan a physical
QR code placed inside the salon and immediately see the salon's services
and offers.

### Customer

``` text
Physical QR
    ↓
Public Salon Page
    ↓
Services + Offers
```

Customers do **not** need: - Login - Signup - App installation -
Customer account - Booking - Payment

### Salon Owner

The salon owner can authenticate with Google and manage the salon's
services and offers.

``` text
Owner
  ↓
Admin Login
  ↓
Google Authentication
  ↓
Admin Dashboard
  ↓
Create / Edit / Delete Services & Offers
```

------------------------------------------------------------------------

# 2. Core Architecture

``` text
                         ┌──────────────────────┐
                         │      CUSTOMER        │
                         │                      │
                         │     Scan QR Code     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   PUBLIC SALON PAGE  │
                         │ /salon/[slug]        │
                         └──────────┬───────────┘
                                    │
                                    │ Read public data
                                    ▼
┌────────────────────────────────────────────────────────┐
│                       SUPABASE                          │
│                                                        │
│  PostgreSQL Database                                   │
│  ├── profiles                                          │
│  ├── salons                                            │
│  ├── services                                          │
│  └── offers                                            │
│                                                        │
│  Authentication                                        │
│  └── Google OAuth                                      │
│                                                        │
│  Storage                                               │
│  └── Salon logos / offer images / service images       │
└───────────────────────┬────────────────────────────────┘
                        ▲
                        │
                        │ Authenticated writes
                        │
              ┌─────────┴──────────┐
              │    ADMIN PANEL     │
              │                    │
              │ /admin             │
              │                    │
              │ Google Login       │
              │ Services CRUD      │
              │ Offers CRUD        │
              │ Salon Settings     │
              └────────────────────┘
```

------------------------------------------------------------------------

# 3. Technology Stack

  Layer             Technology
  ----------------- ------------------------------
  Framework         Next.js
  Language          TypeScript
  UI                React
  Styling           Tailwind CSS
  Database          Supabase PostgreSQL
  Authentication    Supabase Auth + Google OAuth
  Image Storage     Supabase Storage
  Hosting           Vercel
  Version Control   GitHub
  QR Code           QR code library

### Initial infrastructure cost

**₹0**

The project should fit within free tiers for an initial small
deployment.

------------------------------------------------------------------------

# 4. Application Structure

Recommended Next.js App Router structure:

``` text
salon-qr/
│
├── src/
│   ├── app/
│   │   │
│   │   ├── page.tsx
│   │   │
│   │   ├── salon/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── services/
│   │   │   │   └── page.tsx
│   │   │   ├── offers/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── public/
│   │   │   ├── SalonHeader.tsx
│   │   │   ├── OffersSection.tsx
│   │   │   ├── ServicesSection.tsx
│   │   │   └── ContactSection.tsx
│   │   │
│   │   └── admin/
│   │       ├── AdminHeader.tsx
│   │       ├── ServiceForm.tsx
│   │       ├── OfferForm.tsx
│   │       └── DashboardCard.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── auth/
│   │   └── queries/
│   │
│   └── types/
│       └── database.ts
│
├── public/
│
├── .env.local
├── package.json
└── README.md
```

------------------------------------------------------------------------

# 5. Routes

## Public Routes

### Salon page

``` text
/salon/[slug]
```

Example:

``` text
/salon/abc-salon
```

This URL is encoded into the physical QR code.

Customer flow:

``` text
QR
 ↓
https://yourdomain.com/salon/abc-salon
 ↓
Salon page
```

## Admin Routes

``` text
/admin
/admin/services
/admin/offers
/admin/settings
```

Admin routes require authentication.

------------------------------------------------------------------------

# 6. Database Architecture

The system should be multi-salon ready even if the first deployment
contains only one salon.

## Entity Relationship

``` text
┌──────────────┐
│   profiles   │
│              │
│ id           │
│ email        │
│ name         │
│ avatar_url   │
└──────┬───────┘
       │
       │ owner_id
       ▼
┌──────────────┐
│    salons    │
│              │
│ id           │
│ owner_id     │
│ name         │
│ slug         │
│ logo_url     │
│ phone        │
│ address      │
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐   ┌──────────────┐
│   services   │   │    offers    │
│              │   │              │
│ id           │   │ id           │
│ salon_id     │   │ salon_id     │
│ name         │   │ title        │
│ description  │   │ description  │
│ category     │   │ price        │
│ price        │   │ old_price    │
│ image_url    │   │ image_url    │
│ active       │   │ active       │
│ sort_order   │   │ valid_until  │
└──────────────┘   └──────────────┘
```

------------------------------------------------------------------------

# 7. Database Tables

## `profiles`

Stores authenticated owners.

``` text
id
email
name
avatar_url
created_at
```

`id` should correspond to the authenticated Supabase user ID.

------------------------------------------------------------------------

## `salons`

Stores salon information.

``` text
id
owner_id
name
slug
logo_url
phone
whatsapp
address
opening_hours
created_at
updated_at
```

### Important

``` text
owner_id → profiles.id
```

Each salon belongs to an owner.

`slug` should be unique.

Example:

``` text
abc-salon
royal-gents-salon
style-studio
```

------------------------------------------------------------------------

## `services`

Stores normal salon services.

``` text
id
salon_id
name
description
category
price
image_url
active
sort_order
created_at
updated_at
```

Example:

``` text
name: Haircut
category: Hair
price: 299
active: true
```

------------------------------------------------------------------------

## `offers`

Stores promotional offers.

``` text
id
salon_id
title
description
price
old_price
image_url
active
valid_until
sort_order
created_at
updated_at
```

Example:

``` text
title: Haircut + Beard Combo
old_price: 499
price: 349
active: true
valid_until: 2026-09-30
```

------------------------------------------------------------------------

# 8. Authentication

Only salon owners/admins need authentication.

Use:

``` text
Supabase Auth
      +
Google OAuth
```

### Login Flow

``` text
/admin
   ↓
Check authentication
   ↓
Not logged in
   ↓
Google Login
   ↓
Google
   ↓
Supabase Auth
   ↓
Authenticated session
   ↓
Admin Dashboard
```

Customers never go through this flow.

------------------------------------------------------------------------

# 9. Authorization

Authentication answers:

> Who is the user?

Authorization answers:

> What is the user allowed to modify?

Use **Supabase Row Level Security (RLS)**.

### Public users

Can read public salon data:

``` text
SELECT salons
SELECT services
SELECT offers
```

Only active/public records should be exposed where appropriate.

### Salon owner

Can modify only data belonging to their salon:

``` text
INSERT own services
UPDATE own services
DELETE own services

INSERT own offers
UPDATE own offers
DELETE own offers

UPDATE own salon
```

The database must enforce this using RLS.

Do not rely only on frontend checks.

------------------------------------------------------------------------

# 10. Public Customer Page

The public page should be optimized for mobile because users access it
immediately after scanning a QR code.

### Layout

``` text
┌─────────────────────────────┐
│                             │
│         SALON LOGO          │
│         SALON NAME          │
│                             │
├─────────────────────────────┤
│                             │
│      SPECIAL OFFERS         │
│                             │
│  ┌───────────────────────┐  │
│  │ Hair + Beard          │  │
│  │ ₹499 → ₹349           │  │
│  │ Special Combo         │  │
│  └───────────────────────┘  │
│                             │
├─────────────────────────────┤
│                             │
│       SERVICES              │
│                             │
│  HAIR                       │
│  Haircut             ₹299   │
│  Styling             ₹499   │
│                             │
│  BEARD                      │
│  Beard Trim          ₹149   │
│                             │
│  SKIN                       │
│  Facial              ₹599   │
│                             │
├─────────────────────────────┤
│                             │
│  Call       WhatsApp        │
│                             │
│  Address / Location         │
│                             │
└─────────────────────────────┘
```

### Important UX requirements

-   Mobile-first
-   Fast loading
-   No customer login
-   No unnecessary animations
-   Easy-to-read prices
-   Clear offer section
-   Clear service categories
-   Works on Android and iPhone
-   Works well on slow mobile networks

------------------------------------------------------------------------

# 11. Admin Dashboard

The admin dashboard should remain simple.

``` text
ADMIN DASHBOARD

ABC SALON

┌─────────────────────────────┐
│ SERVICES                    │
│                             │
│ Haircut             ₹299    │
│ Beard               ₹149    │
│ Facial              ₹599    │
│                             │
│       + Add Service         │
└─────────────────────────────┘

┌─────────────────────────────┐
│ OFFERS                      │
│                             │
│ Hair + Beard        ₹349    │
│ Facial Combo        ₹499    │
│                             │
│        + Add Offer          │
└─────────────────────────────┘
```

------------------------------------------------------------------------

# 12. Service CRUD

The admin needs:

``` text
CREATE
READ
UPDATE
DELETE
```

### Add Service

``` text
Service Name
Category
Description
Price
Image
Active
Sort Order
```

### Edit Service

Owner can change any of the above.

### Delete Service

Delete or preferably deactivate the service.

### Active / Inactive

Instead of deleting everything immediately:

``` text
active = false
```

means the service is hidden from customers.

------------------------------------------------------------------------

# 13. Offer CRUD

The admin needs:

``` text
CREATE
READ
UPDATE
DELETE
```

Fields:

``` text
Title
Description
Original Price
Offer Price
Image
Valid Until
Active
Sort Order
```

Example:

``` text
Haircut + Beard

Original Price: ₹499
Offer Price: ₹349

Valid Until: 30 September 2026
Active: Yes
```

After expiry, the application can hide the offer.

------------------------------------------------------------------------

# 14. QR Code Architecture

The QR code should contain only the permanent public URL.

Example:

``` text
https://yourdomain.com/salon/abc-salon
```

### Never encode the actual services/offers into the QR.

Correct:

``` text
QR
 ↓
URL
 ↓
Database
 ↓
Current offers/services
```

Incorrect:

``` text
QR
 ↓
Haircut ₹299
Facial ₹599
...
```

The correct architecture allows the owner to update the database without
replacing the physical QR.

------------------------------------------------------------------------

# 15. Data Flow

## Customer

``` text
Customer scans QR
        ↓
Browser opens /salon/[slug]
        ↓
Next.js loads salon
        ↓
Query active offers
        ↓
Query active services
        ↓
Render page
```

## Owner

``` text
Owner opens /admin
        ↓
Google authentication
        ↓
Supabase session
        ↓
Load owner profile
        ↓
Find owned salon
        ↓
Load services/offers
        ↓
Owner edits data
        ↓
Supabase database updated
        ↓
Public page displays new data
```

------------------------------------------------------------------------

# 16. Security Rules

### Never expose

``` text
SUPABASE_SERVICE_ROLE_KEY
```

to the browser.

Only use the public/anon key where appropriate.

### Use RLS

Every salon-owned table should enforce ownership.

Conceptually:

``` text
service.salon_id
      ↓
salon.owner_id
      ↓
auth.uid()
```

An owner should never be able to edit another salon's data by changing
an ID in a request.

### Public access

Public visitors can read only the data required for the public salon
page.

------------------------------------------------------------------------

# 17. Environment Variables

`.env.local`

``` env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Server-only secrets, if later required, must not use `NEXT_PUBLIC_`.

------------------------------------------------------------------------

# 18. Deployment

Recommended deployment:

``` text
Developer
    ↓
GitHub
    ↓
Vercel
    ↓
Production
```

Supabase remains the backend.

Initial deployment:

``` text
https://your-project.vercel.app
```

Later, optionally connect:

``` text
https://salonname.com
```

------------------------------------------------------------------------

# 19. Development Phases

## Phase 1 --- UI

Build the public mobile page using static data.

Goal:

``` text
QR → Beautiful mobile salon page
```

Do not start with the admin panel.

------------------------------------------------------------------------

## Phase 2 --- Database

Create:

``` text
profiles
salons
services
offers
```

Connect the public page to Supabase.

Goal:

``` text
Database → Public page
```

------------------------------------------------------------------------

## Phase 3 --- Authentication

Implement:

``` text
Google Login
```

Protect `/admin`.

------------------------------------------------------------------------

## Phase 4 --- Admin

Implement:

``` text
Services CRUD
Offers CRUD
Salon Settings
```

------------------------------------------------------------------------

## Phase 5 --- Security

Implement and test:

``` text
RLS
Ownership checks
Authenticated admin access
Public read access
```

------------------------------------------------------------------------

## Phase 6 --- QR

Generate QR for:

``` text
/salon/[slug]
```

Print and test it physically.

------------------------------------------------------------------------

## Phase 7 --- Deployment

Deploy:

``` text
Next.js → Vercel
Database/Auth → Supabase
```

------------------------------------------------------------------------

# 20. V1 Scope

### Include

-   Public salon page
-   QR code
-   Services
-   Offers
-   Prices
-   Categories
-   Salon logo
-   Phone
-   WhatsApp
-   Address
-   Google authentication
-   Admin dashboard
-   Service CRUD
-   Offer CRUD
-   Active/inactive status
-   Mobile responsive design

### Do NOT include in V1

-   Customer accounts
-   Customer login
-   Appointment booking
-   Online payments
-   Customer reviews
-   Loyalty system
-   Notifications
-   Rider/home-service system
-   Complex analytics
-   Chat
-   Subscription billing

Keep V1 focused.

------------------------------------------------------------------------

# 21. Future Multi-Salon Architecture

Although the first customer is one salon, keep the database multi-tenant
ready.

``` text
                    PLATFORM
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Salon A      Salon B      Salon C
          │            │            │
        QR A          QR B          QR C
          │            │            │
      Customers    Customers    Customers
```

Each salon has:

``` text
owner_id
```

and each service/offer has:

``` text
salon_id
```

This allows the same application to support many salons later.

------------------------------------------------------------------------

# 22. Final V1 Architecture

``` text
                         CUSTOMER
                            │
                         Scan QR
                            │
                            ▼
                  /salon/[slug]
                            │
                            ▼
                       Next.js
                            │
                            ▼
                       Supabase
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
           Salon         Services        Offers
             ▲              ▲              ▲
             │              │              │
             └──────────────┼──────────────┘
                            │
                      Owner Dashboard
                            │
                       Google Login
                            │
                         /admin
```

## Core principle

**QR is permanent. Database is dynamic.**

The physical QR points to the salon's public page. The salon owner
changes the database through the authenticated admin dashboard.
Customers simply scan and view the latest services and offers.
