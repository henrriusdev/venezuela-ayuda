-- 0003 · Place-based reports + tools/equipment with quantities
--
-- Pivots help requests toward affected buildings/places: a place name, a
-- required location (enforced in the app; CHECK added NOT VALID here as
-- defense-in-depth), and a structured list of needed tools with quantities.

-- New enum value for tool/equipment requests.
-- NOTE: an enum value cannot be *used* in the same transaction it is added, but
-- we never reference 'tools' in SQL below, so this is safe to run together.
alter type help_category add value if not exists 'tools';

-- New columns on help_requests.
alter table help_requests add column if not exists place_name text;
-- items: [{ "name": "Taladro", "qty": 2 }, { "name": "Casco", "qty": 10 }]
alter table help_requests add column if not exists items jsonb;

-- Recreate the privacy-safe view. New columns are appended at the end so
-- `create or replace view` stays legal.
create or replace view public_help_requests as
  select id, category, description, urgency, city, latitude, longitude,
         status, created_at, place_name, items
  from help_requests;

grant select on public_help_requests to anon, authenticated;

-- Defense-in-depth: every help request must have a location; check-ins must have
-- a location unless the person is just marking themselves SAFE. Added NOT VALID
-- so any pre-existing rows are not re-validated (new rows are checked).
do $$ begin
  alter table help_requests add constraint help_requests_has_location
    check (latitude is not null and longitude is not null) not valid;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table checkins add constraint checkins_need_or_missing_has_location
    check (status = 'SAFE' or (latitude is not null and longitude is not null)) not valid;
exception when duplicate_object then null; end $$;
