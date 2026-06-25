-- 0006 · Admin accounts + moderation + verification
--
-- Admins are Supabase Auth users whose email is allowlisted in `admin_emails`.
-- Admin-only writes happen through server actions that verify the session +
-- allowlist, then mutate with the service key. `admin_emails` is server-only
-- (no grants to anon/authenticated).

create table if not exists admin_emails (
  email      text primary key,
  added_by   text,
  created_at timestamptz not null default now()
);
alter table admin_emails enable row level security; -- no policies → server-only

-- Seed the first admin. They set their own password on first login at /admin.
insert into admin_emails (email, added_by)
  values ('shinji.256@gmail.com', 'seed')
  on conflict (email) do nothing;

-- Moderation flag on all community-submitted tables.
alter table checkins        add column if not exists hidden boolean not null default false;
alter table help_requests   add column if not exists hidden boolean not null default false;
alter table help_offers     add column if not exists hidden boolean not null default false;
alter table damaged_reports add column if not exists hidden boolean not null default false;

-- Verification on community damaged reports.
alter table damaged_reports add column if not exists verified_at timestamptz;
alter table damaged_reports add column if not exists verified_by text;

-- Recreate public views to hide moderated rows. For damaged reports we also
-- expose the verification fields (appended at the end).
create or replace view public_checkins as
  select id, name, status, city, latitude, longitude, message, photo_url,
         created_at, found_at, place_name
  from checkins
  where hidden = false;

create or replace view public_help_requests as
  select id, category, description, urgency, city, latitude, longitude,
         status, created_at, place_name, items
  from help_requests
  where hidden = false;

create or replace view public_help_offers as
  select id, category, description, city, latitude, longitude, availability,
         available, created_at
  from help_offers
  where hidden = false;

create or replace view public_damaged_reports as
  select id, place_name, description, severity, city, latitude, longitude,
         photo_url, status, created_at, verified_at, verified_by
  from damaged_reports
  where hidden = false;

grant select on public_checkins, public_help_requests, public_help_offers,
  public_damaged_reports to anon, authenticated;
