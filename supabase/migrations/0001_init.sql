-- Salon QR Menu — initial schema.
--
-- Auth model: identity lives entirely in Firebase Auth, not in Supabase
-- Auth. Nobody ever signs in to Supabase itself, so Postgres's built-in
-- `auth.uid()` (which is only ever populated from a Supabase-issued JWT)
-- is NEVER populated here and must not be used in RLS policies on these
-- tables. Ownership is instead checked in application code: every
-- privileged request first verifies the caller's Firebase ID token
-- (via firebase-admin, see src/lib/server/) and then reads/writes through
-- src/lib/server/supabaseAdmin.ts, which uses the Postgres SERVICE ROLE
-- key and therefore bypasses RLS entirely. The RLS policies below exist
-- only to define what the PUBLIC anon key may read directly (the
-- customer-facing salon page) — they intentionally have no write rules,
-- because the anon key is never used to write anything.

create table if not exists profiles (
  id text primary key, -- Firebase Auth uid (NOT a Supabase auth id)
  email text,
  name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists salons (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null references profiles(id),
  name text not null,
  slug text not null unique,
  logo_url text,
  phone text,
  whatsapp text,
  address text,
  opening_hours text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists salons_owner_id_idx on salons(owner_id);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons(id) on delete cascade,
  name text not null,
  description text,
  category text not null,
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists services_salon_id_idx on services(salon_id);

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons(id) on delete cascade,
  title text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  old_price numeric(10, 2) check (old_price is null or old_price >= price),
  image_url text,
  active boolean not null default true,
  valid_until date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists offers_salon_id_idx on offers(salon_id);

-- Row Level Security -----------------------------------------------------
-- Enabled on every table so that even if the anon/publishable key were
-- ever used for something unexpected, it can only ever SELECT the rows
-- below — never write, and never see inactive services/offers or the
-- profiles table.

alter table profiles enable row level security;
alter table salons enable row level security;
alter table services enable row level security;
alter table offers enable row level security;

-- Salon contact/branding info is the whole point of the public QR page.
create policy "Public can read salons" on salons
  for select to anon, authenticated
  using (true);

create policy "Public can read active services" on services
  for select to anon, authenticated
  using (active = true);

create policy "Public can read active offers" on offers
  for select to anon, authenticated
  using (active = true);

-- No policy on profiles: it's never read or written via the anon key.
-- (RLS with zero policies denies all access by default.)

-- Keep updated_at current on every UPDATE, for the tables that track it.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger salons_set_updated_at
  before update on salons
  for each row execute function set_updated_at();

create trigger services_set_updated_at
  before update on services
  for each row execute function set_updated_at();

create trigger offers_set_updated_at
  before update on offers
  for each row execute function set_updated_at();
