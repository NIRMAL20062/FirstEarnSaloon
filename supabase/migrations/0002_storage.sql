-- Storage bucket for salon logos, service images and offer images.
--
-- The bucket is public, which lets Supabase serve objects from it over a
-- plain public URL (…/storage/v1/object/public/salon-images/…) with no
-- auth check at all — exactly what the customer-facing salon page needs.
-- Uploads never happen from the browser directly: they go through
-- POST /api/salons/[salonId]/images (see src/app/api/), which verifies the
-- caller owns the salon and then writes via the service-role Supabase
-- client. That client bypasses Storage RLS entirely, so no INSERT/UPDATE
-- policy on storage.objects is required for this app to work.
insert into storage.buckets (id, name, public)
values ('salon-images', 'salon-images', true)
on conflict (id) do nothing;
