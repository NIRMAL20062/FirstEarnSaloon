# Salon QR Menu

Customers scan a QR code in a salon and instantly see its services and
offers — no app, no login, no booking. Salon owners sign in separately to
manage their services, offers and salon info.

Auth is Firebase (Google + Email/Password). The database and file storage
are Supabase (Postgres + Storage). See `CLAUDE.md` for the full
architecture and why those two are split, and `docs/architecture.md` for
the product spec.

## Setup

```bash
cp .env.local.example .env.local
# fill in .env.local — see CLAUDE.md § Setup for the Firebase + Supabase steps
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The public salon page
lives at `/salon/[slug]`; the admin dashboard starts at `/admin/login`.

## Commands

```bash
npm run dev      # local dev server
npm run build    # production build (also type-checks)
npm run lint     # eslint
```

## Deployment

Push to GitHub and import the repo on [Vercel](https://vercel.com/new).
Add every variable from `.env.local` to the Vercel project's Environment
Variables before the first deploy — the build succeeds without them (see
CLAUDE.md § "Why Firebase/Supabase clients are lazily initialized"), but
nothing will actually work until they're set.
