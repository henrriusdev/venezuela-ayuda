// One-time: recompute checkins.dedup_key with the new name+region key
// (personKey) so cross-source dedup uses a consistent formula. Safe to re-run.
//   node scripts/backfill-dedupkey.mjs [--dry]
import { readFileSync } from "node:fs";
import { personKey } from "./dedup-lib.mjs";

const DRY = process.argv.includes("--dry");
let env = {};
try {
  env = Object.fromEntries(
    readFileSync(new URL("../.env.local", import.meta.url), "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
} catch {}
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SECRET_KEY || env.SUPABASE_SECRET_KEY;
const REST = `${URL_}/rest/v1`;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const rows = [];
for (let from = 0; ; from += 1000) {
  const r = await fetch(`${REST}/checkins?select=id,name,latitude,longitude,dedup_key&source=not.is.null`, {
    headers: { ...H, Range: `${from}-${from + 999}` },
  });
  if (!r.ok) break;
  const chunk = await r.json();
  if (!Array.isArray(chunk) || !chunk.length) break;
  rows.push(...chunk);
  if (chunk.length < 1000) break;
}
const updates = rows
  .map((r) => ({ id: r.id, next: personKey(r.name || "", r.latitude, r.longitude), cur: r.dedup_key }))
  .filter((u) => u.next !== u.cur);
console.log(`scanned ${rows.length} rows · ${updates.length} need a new dedup_key`);
if (DRY) { console.log("(dry run — nothing written)"); process.exit(0); }

let done = 0;
const CONC = 25;
async function worker(queue) {
  while (queue.length) {
    const u = queue.pop();
    const r = await fetch(`${REST}/checkins?id=eq.${u.id}`, {
      method: "PATCH",
      headers: { ...H, Prefer: "return=minimal" },
      body: JSON.stringify({ dedup_key: u.next }),
    });
    if (!r.ok && r.status !== 404) console.log(`\n  ${u.id}: ${r.status}`);
    if (++done % 1000 === 0) process.stdout.write(`  ${done}/${updates.length}\r`);
  }
}
await Promise.all(Array.from({ length: CONC }, () => worker(updates)));
console.log(`\nDone. Updated ${done} dedup_key values.`);
