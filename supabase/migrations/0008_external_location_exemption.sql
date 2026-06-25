-- 0008 · Allow external (ingested) records without a precise location
--
-- The 0004 constraint requires a location for non-SAFE check-ins — correct for
-- user submissions, but external missing-person records often have only a
-- free-text last-seen area (no coordinates). They're still valuable (searchable
-- by name), so exempt source-attributed rows.

alter table checkins drop constraint if exists checkins_need_or_missing_has_location;

alter table checkins add constraint checkins_need_or_missing_has_location
  check (
    status = 'SAFE'
    or source is not null
    or (latitude is not null and longitude is not null)
  ) not valid;
