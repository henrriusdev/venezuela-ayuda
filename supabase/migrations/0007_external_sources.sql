-- 0007 · External-source ingestion + attribution + dedup
--
-- Records ingested from sister sites carry: source (site), source_url (link
-- back), external_id (the source's id, for idempotent re-imports), and
-- dedup_key (normalized name/place for cross-source dedup). Contacts from
-- external sources go into the existing PRIVATE fields and are never exposed.

alter table checkins        add column if not exists source text;
alter table checkins        add column if not exists source_url text;
alter table checkins        add column if not exists external_id text;
alter table checkins        add column if not exists dedup_key text;

alter table damaged_reports add column if not exists source text;
alter table damaged_reports add column if not exists source_url text;
alter table damaged_reports add column if not exists external_id text;
alter table damaged_reports add column if not exists dedup_key text;

alter table help_requests   add column if not exists source text;
alter table help_requests   add column if not exists source_url text;
alter table help_requests   add column if not exists external_id text;

create index if not exists checkins_dedup_idx on checkins (dedup_key) where dedup_key is not null;
create index if not exists checkins_extid_idx on checkins (external_id) where external_id is not null;
create index if not exists damaged_dedup_idx on damaged_reports (dedup_key) where dedup_key is not null;
create index if not exists damaged_extid_idx on damaged_reports (external_id) where external_id is not null;
create index if not exists requests_extid_idx on help_requests (external_id) where external_id is not null;

-- Recreate public views to expose source + source_url (appended), still hiding
-- moderated rows and private contact fields.
create or replace view public_checkins as
  select id, name, status, city, latitude, longitude, message, photo_url,
         created_at, found_at, place_name, source, source_url
  from checkins where hidden = false;

create or replace view public_damaged_reports as
  select id, place_name, description, severity, city, latitude, longitude,
         photo_url, status, created_at, verified_at, verified_by, source, source_url
  from damaged_reports where hidden = false;

create or replace view public_help_requests as
  select id, category, description, urgency, city, latitude, longitude,
         status, created_at, place_name, items, source, source_url
  from help_requests where hidden = false;

grant select on public_checkins, public_damaged_reports, public_help_requests
  to anon, authenticated;
