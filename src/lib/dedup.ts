// Cross-source person identity key. Ported verbatim from the tested, pure dedup
// library `scripts/dedup-lib.mjs` (which the ingest pipeline uses) — that file is
// the SOURCE OF TRUTH; keep `fuzzyKey` here in sync with it. We re-declare these
// few lines in TS because the .mjs can't be imported into the typed Next build
// without extra config.

const stripAccents = (s: string) =>
  String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "");

const norm = (s: string) =>
  stripAccents(s)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const STOP = new Set([
  "de", "del", "la", "las", "el", "los", "y", "con", "un", "una", "su", "a",
  "en", "o", "e", "da", "do", "san", "santa", "sr", "sra", "srta", "don",
  "dona", "nino", "nina", "bebe", "ano", "anos", "sus", "al", "the", "and",
]);

// Cheap fuzzy key for cross-source identity: accents/stopwords/short tokens
// removed, tokens deduped + sorted. "Pérez, Juan" ≈ "juan perez" ≈ "Juan A. Pérez".
export function fuzzyKey(name: string): string {
  const toks = norm(name)
    .split(" ")
    .filter((t) => t.length >= 3 && !STOP.has(t));
  if (toks.length >= 2) return `mp:${[...new Set(toks)].sort().join(" ")}`;
  return `mp:${norm(name)}`;
}
