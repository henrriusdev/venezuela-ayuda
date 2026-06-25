-- 0009 · Sightings ("avisos") — privacy-preserving relay
--
-- When someone recognizes / finds a missing person but can't reach them by
-- name, they leave a sighting: their OWN contact + a message. The original
-- reporter retrieves these via their private manage link — so neither party's
-- number is ever shown publicly. Server-only (no public view, no grants).

create table if not exists sightings (
  id             uuid primary key default gen_random_uuid(),
  checkin_id     uuid not null references checkins(id) on delete cascade,
  finder_name    text,
  finder_contact text,            -- the finder's contact; shown only to the reporter
  message        text,
  created_at     timestamptz not null default now()
);

create index if not exists sightings_checkin_idx on sightings (checkin_id, created_at desc);

alter table sightings enable row level security; -- server-only (service key)
