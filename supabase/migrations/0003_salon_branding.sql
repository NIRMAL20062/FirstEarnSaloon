-- Adds optional branding fields for the redesigned public salon page: a
-- short tagline under the salon name, and a wide cover photo for the page
-- hero (separate from logo_url, which stays a small circular avatar).
alter table salons
  add column if not exists tagline text,
  add column if not exists cover_image_url text;
