-- Venezuela Ayuda — initial schema
-- Postgres + PostGIS for disaster coordination MVP.
--
-- Run this against your Supabase project (SQL editor or `supabase db push`).
-- Privacy: phone numbers are stored but are NEVER exposed through the public
-- views the client reads from.

-- Extensions ---------------------------------------------------------------
create extension if not exists postgis;
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- Enums --------------------------------------------------------------------
do $$ begin
  create type checkin_status as enum ('SAFE', 'NEEDS_HELP', 'LOOKING_FOR_SOMEONE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type help_category as enum (
    'medical', 'food', 'water', 'shelter',
    'transportation', 'electricity', 'rescue'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type offer_category as enum (
    'transportation', 'food', 'shelter',
    'medical', 'supplies', 'translation'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type urgency_level as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type request_status as enum ('OPEN', 'IN_PROGRESS', 'RESOLVED');
exception when duplicate_object then null; end $$;

-- Helper: build a geography point from lat/lng -----------------------------
-- Used as a STORED generated column so spatial queries stay fast.

-- Tables -------------------------------------------------------------------
create table if not exists checkins (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  status        checkin_status not null default 'SAFE',
  city          text,
  latitude      double precision,
  longitude     double precision,
  location      geography(Point, 4326) generated always as (
                  case
                    when latitude is not null and longitude is not null
                    then st_setsrid(st_makepoint(longitude, latitude), 4326)::geography
                    else null
                  end
                ) stored,
  message       text,
  phone_private text,             -- NEVER exposed publicly
  photo_url     text,
  created_at    timestamptz not null default now()
);

create table if not exists help_requests (
  id          uuid primary key default gen_random_uuid(),
  category    help_category not null,
  description text not null,
  urgency     urgency_level not null default 'MEDIUM',
  city        text,
  latitude    double precision,
  longitude   double precision,
  location    geography(Point, 4326) generated always as (
                case
                  when latitude is not null and longitude is not null
                  then st_setsrid(st_makepoint(longitude, latitude), 4326)::geography
                  else null
                end
              ) stored,
  contact     text,              -- optional, NEVER exposed publicly
  status      request_status not null default 'OPEN',
  created_at  timestamptz not null default now()
);

create table if not exists help_offers (
  id           uuid primary key default gen_random_uuid(),
  category     offer_category not null,
  description  text,
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
  availability text,
  contact      text,             -- optional, NEVER exposed publicly
  available    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Indexes ------------------------------------------------------------------
create index if not exists checkins_location_idx on checkins using gist (location);
create index if not exists checkins_created_idx on checkins (created_at desc);
create index if not exists checkins_name_idx on checkins using gin (to_tsvector('spanish', coalesce(name, '')));
create index if not exists checkins_city_idx on checkins (lower(city));

create index if not exists requests_location_idx on help_requests using gist (location);
create index if not exists requests_created_idx on help_requests (created_at desc);
create index if not exists requests_status_idx on help_requests (status);

create index if not exists offers_location_idx on help_offers using gist (location);
create index if not exists offers_created_idx on help_offers (created_at desc);

-- Public, privacy-safe views (no phone / contact) --------------------------
create or replace view public_checkins as
  select id, name, status, city, latitude, longitude, message, photo_url, created_at
  from checkins;

create or replace view public_help_requests as
  select id, category, description, urgency, city, latitude, longitude, status, created_at
  from help_requests;

create or replace view public_help_offers as
  select id, category, description, city, latitude, longitude, availability, available, created_at
  from help_offers;

-- Row Level Security -------------------------------------------------------
-- The app's server layer uses the service role and bypasses RLS. These
-- policies are defense-in-depth so the public anon key can only insert and
-- read non-sensitive data directly if ever used client-side.
alter table checkins enable row level security;
alter table help_requests enable row level security;
alter table help_offers enable row level security;

do $$ begin
  create policy "anon insert checkins" on checkins for insert to anon, authenticated with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "anon insert requests" on help_requests for insert to anon, authenticated with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "anon insert offers" on help_offers for insert to anon, authenticated with check (true);
exception when duplicate_object then null; end $$;

-- Expose the privacy-safe views to the anon/authenticated roles.
grant select on public_checkins, public_help_requests, public_help_offers to anon, authenticated;
grant insert on checkins, help_requests, help_offers to anon, authenticated;
