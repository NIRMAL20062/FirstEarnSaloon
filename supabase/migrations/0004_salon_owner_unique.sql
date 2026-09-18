-- Enforces one salon per owner at the database level (current product
-- scope — see docs/architecture.md §11 for the multi-salon future).
--
-- The API only ever creates a salon when GET /api/salons/mine returned
-- null, but without a DB-level constraint a race (e.g. a retried request)
-- could still let one owner end up with two salons. That's not just an
-- annoyance: /api/salons/mine reads with .maybeSingle(), which throws if
-- more than one row comes back — so a duplicate silently locks that owner
-- out of their whole dashboard until someone fixes it directly in the
-- database. This constraint makes that impossible instead of merely
-- unlikely.
alter table salons
  add constraint salons_owner_id_key unique (owner_id);
