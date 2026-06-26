-- 0013 · Security hardening — defense in depth on writes
--
-- All writes already go through the service key (server-side) and RLS blocks
-- anon/authenticated, but we also REVOKE the table write grants so a future
-- missing/loose RLS policy can never expose inserts/updates/deletes to the
-- public roles. (anon still reads the public_* views via their own grants;
-- service_role bypasses all of this.)
--
-- Verified safe: the app's writes use getServerSupabase() (service key); the
-- `authenticated` role (admin browser session) is only used to read the logged-in
-- user, never to write to these tables.

revoke insert, update, delete on
  checkins,
  help_requests,
  help_offers,
  damaged_reports,
  sightings,
  request_responses,
  admin_emails,
  applied_migrations
from anon, authenticated;

insert into applied_migrations (version) values ('0013') on conflict do nothing;
