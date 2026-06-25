// Verifies every migration file in supabase/migrations/ has been applied to the
// database (recorded in the applied_migrations table). Exits non-zero with a
// list of pending migrations so CI fails until they're run.
//
//   node scripts/check-migrations.mjs
//
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY from the env (CI) or
// .env.local (local). Skips gracefully when credentials are absent (e.g. a fork
// PR can't access repo secrets) so it never blocks those PRs falsely.

import { readdirSync, readFileSync } from "node:fs";

let fileEnv = {};
try {
  fileEnv = Object.fromEntries(
    readFileSync(new URL("../.env.local", import.meta.url), "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      })
  );
} catch {
  /* no .env.local */
}
const getEnv = (k) => process.env[k] || fileEnv[k];
const URL_ = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const SECRET = getEnv("SUPABASE_SECRET_KEY");

if (!URL_ || !SECRET) {
  console.log("⏭️  Skipped: no Supabase credentials available (likely a fork PR).");
  process.exit(0);
}

const dir = new URL("../supabase/migrations/", import.meta.url);
const versions = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => ({ file: f, version: f.match(/^(\d+)/)?.[1] }))
  .filter((m) => m.version);

const res = await fetch(`${URL_}/rest/v1/applied_migrations?select=version`, {
  headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
});
if (!res.ok) {
  console.error(
    `❌ Could not read applied_migrations (HTTP ${res.status}).\n` +
      "Apply migration 0011_migration_tracking.sql in the Supabase SQL editor first."
  );
  process.exit(1);
}
const applied = new Set((await res.json()).map((r) => r.version));

const pending = versions.filter((m) => !applied.has(m.version));
if (pending.length) {
  console.error(
    `❌ ${pending.length} migration(s) not applied to the database:\n` +
      pending.map((m) => `   - ${m.file}`).join("\n") +
      "\n\nApply them in the Supabase SQL editor (and make sure each ends with\n" +
      "  insert into applied_migrations (version) values ('NNNN') on conflict do nothing;\n" +
      "), then re-run."
  );
  process.exit(1);
}

console.log(`✅ All ${versions.length} migrations are applied to the database.`);
