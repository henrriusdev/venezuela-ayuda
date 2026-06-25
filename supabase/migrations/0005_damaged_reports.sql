-- 0005 · Community damaged-building reports
--
-- User-submitted structural-damage reports (distinct from the read-only curated
-- spreadsheet). Same account-less model as the rest of the app: writes go through
-- the server (secret key, bypasses RLS); a secret manage_token lets the reporter
-- mark the report resolved. The public view never exposes contact / manage_token.

do $$ begin
  create type damage_severity as enum ('CRACKS', 'PARTIAL', 'COLLAPSE_RISK', 'COLLAPSED');
exception when duplicate_object then null; end $$;

create table if not exists damaged_reports (
  id           uuid primary key default gen_random_uuid(),
  place_name   text not null,
  description  text,
  severity     damage_severity not null default 'PARTIAL',
  city         text,
  latitude     double precision,
  longitude    double precision,
  location     geography(Point, 4326) generated always as (
                 case
                   when latitude is not null and longitude is not null
                   then st_setsrid(st_makepoint(longitude, latitude), 4326)::geography
                   else null
                 end
               ) stored,
  contact      text,              -- private
  photo_url    text,
  status       request_status not null default 'OPEN',
  manage_token text,              -- private; server-verified
  created_at   timestamptz not null default now()
);

create index if not exists damaged_reports_location_idx on damaged_reports using gist (location);
create index if not exists damaged_reports_created_idx on damaged_reports (created_at desc);
create index if not exists damaged_reports_status_idx on damaged_reports (status);

-- Privacy-safe public view (no contact, no manage_token).
create or replace view public_damaged_reports as
  select id, place_name, description, severity, city, latitude, longitude,
         photo_url, status, created_at
  from damaged_reports;

grant select on public_damaged_reports to anon, authenticated;

-- RLS on; no insert policy → only the server (secret key) can write.
alter table damaged_reports enable row level security;
