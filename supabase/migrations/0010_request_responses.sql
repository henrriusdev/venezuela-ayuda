-- 0010 · Volunteer responses to help requests (privacy-preserving relay)
--
-- A volunteer who can fulfill a request leaves THEIR own contact + a note. The
-- requester reads these via their private manage link and reaches out — neither
-- number is shown publicly. Mirrors the `sightings` relay. Server-only.

create table if not exists request_responses (
  id                uuid primary key default gen_random_uuid(),
  request_id        uuid not null references help_requests(id) on delete cascade,
  responder_name    text,
  responder_contact text,            -- private; shown only to the requester
  message           text,
  created_at        timestamptz not null default now()
);

create index if not exists request_responses_req_idx
  on request_responses (request_id, created_at desc);

alter table request_responses enable row level security; -- server-only (service key)
