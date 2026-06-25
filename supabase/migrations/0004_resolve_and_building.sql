-- 0004 · Reporter-managed resolution + building search
--
-- Account-less resolution: each report carries a secret `manage_token` issued at
-- creation. Only the holder of that token (the reporter, via their private manage
-- link) can mark a missing person as found or a help request as resolved. The
-- token is read ONLY by the server (service key) and never exposed in a view.
--
-- Also adds a building/place name to check-ins so search can match by building.

alter table checkins      add column if not exists manage_token text;
alter table checkins      add column if not exists found_at     timestamptz;
alter table checkins      add column if not exists place_name   text;
alter table help_requests add column if not exists manage_token text;

-- Recreate the privacy-safe view to expose found_at + place_name (non-sensitive).
-- manage_token is a base-table column only, so it stays private.
create or replace view public_checkins as
  select id, name, status, city, latitude, longitude, message, photo_url,
         created_at, found_at, place_name
  from checkins;

grant select on public_checkins to anon, authenticated;

-- help_requests already exposes status + place_name via public_help_requests;
-- manage_token is not in that view, so no change is needed there.

-- Support case-insensitive building search.
create index if not exists checkins_place_idx on checkins (lower(place_name));
