#!/usr/bin/env bash
# Applies any migrations in supabase/migrations/ that haven't been applied yet,
# in order. Each migration runs exactly once — gated by the applied_migrations
# table — so re-runs are safe. Requires SUPABASE_DB_URL (a Postgres connection
# string with password; use Supabase's "Session pooler" URI for IPv4/CI).
set -euo pipefail

: "${SUPABASE_DB_URL:?Set SUPABASE_DB_URL (Supabase → Project Settings → Database → Session pooler URI)}"

DIR="$(cd "$(dirname "$0")/../supabase/migrations" && pwd)"
PSQL=(psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -X -q)

# Ensure the tracking table exists (so the first apply can record itself).
"${PSQL[@]}" -c "create table if not exists applied_migrations (version text primary key, applied_at timestamptz not null default now());"

applied=" $("${PSQL[@]}" -tAc 'select version from applied_migrations' | tr '\n' ' ') "

count=0
for f in "$DIR"/*.sql; do
  v="$(basename "$f" | grep -oE '^[0-9]+')"
  [ -z "$v" ] && continue
  if grep -qw "$v" <<<"$applied"; then
    echo "✓ $v already applied"
    continue
  fi
  echo "→ applying $(basename "$f")"
  "${PSQL[@]}" -f "$f"
  "${PSQL[@]}" -c "insert into applied_migrations (version) values ('$v') on conflict do nothing;"
  echo "✓ applied $v"
  count=$((count + 1))
done

echo "Done. Applied $count new migration(s)."
