-- 0011 · Structural-risk questionnaire results on damaged-building reports
--
-- The damaged-building form has an optional risk-triage questionnaire. When the
-- reporter fills it in, the server computes a traffic-light level and stores it
-- with the raw answers. risk_level is plain text (allowed values ROJO / AMARILLO
-- / NINGUNA) — kept as text rather than an enum to keep this migration simple.
-- The all-clear state is the neutral 'NINGUNA' (⚪); there is no "safe/verde" value
-- by design. risk_priority flags an AMARILLO that could not rule out severe damage.

alter table damaged_reports add column if not exists risk_level text;
alter table damaged_reports add column if not exists risk_priority boolean;
alter table damaged_reports add column if not exists risk_answers jsonb;

-- Expose the computed result publicly (the raw risk_answers stay private).
create or replace view public_damaged_reports as
  select id, place_name, description, severity, city, latitude, longitude,
         photo_url, status, created_at, verified_at, verified_by, source, source_url,
         risk_level, risk_priority
  from damaged_reports where hidden = false;

grant select on public_damaged_reports to anon, authenticated;
