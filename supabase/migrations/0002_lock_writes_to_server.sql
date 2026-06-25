-- 0002 · Lock writes to the server
--
-- Prerequisite: the app is configured with a secret/service-role key
-- (SUPABASE_SECRET_KEY), so all legitimate writes go through server actions
-- that validate input and rate-limit by IP. The service role bypasses RLS, so
-- it is unaffected by the changes below.
--
-- This removes the anonymous INSERT access added in 0001. Without it, anyone
-- holding the public publishable key could POST directly to the REST API and
-- bypass our server-side validation, length caps, honeypot and rate limiting.
-- Public READ access (the privacy-safe public_* views) is intentionally kept.

drop policy if exists "anon insert checkins" on checkins;
drop policy if exists "anon insert requests" on help_requests;
drop policy if exists "anon insert offers" on help_offers;

revoke insert on checkins from anon, authenticated;
revoke insert on help_requests from anon, authenticated;
revoke insert on help_offers from anon, authenticated;

-- Note: RLS stays ENABLED on all three tables. With no INSERT policy and no
-- INSERT grant, the anon/authenticated roles can no longer write at all, while
-- the server (secret key) continues to read and write normally.
