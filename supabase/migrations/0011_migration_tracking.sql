-- 0011 · Migration tracking
--
-- Records which migrations have been applied, so CI can verify the database is
-- up to date with the code before/after a deploy.
--
-- CONVENTION: every NEW migration file must end with a line that registers its
-- version (the leading number of the filename), e.g. for 0012_foo.sql:
--   insert into applied_migrations (version) values ('0012') on conflict do nothing;

create table if not exists applied_migrations (
  version    text primary key,
  applied_at timestamptz not null default now()
);
alter table applied_migrations enable row level security; -- CI/server only (service key)

-- Backfill every migration applied so far (including this one).
insert into applied_migrations (version) values
  ('0001'), ('0002'), ('0003'), ('0004'), ('0005'),
  ('0006'), ('0007'), ('0008'), ('0009'), ('0010'), ('0011')
on conflict (version) do nothing;
