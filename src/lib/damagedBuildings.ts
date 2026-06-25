import "server-only";
import type { MapMarker } from "@/lib/types";

// Damaged-building reports sourced from a community-maintained, public Google
// Sheet (Operación Todos con VZLA / curated X reports). Fetched near-realtime
// (revalidated) so edits in the sheet appear without a redeploy.
//
// The sheet has no coordinates, so we geocode by zone/city centroid and add a
// small deterministic jitter (markers are flagged `approx`). The popup always
// shows the verification level (confidence), the source account, and a caution
// note + link to the source search — so the provenance is explicit.

// `pub?output=csv` returns the published (default) sheet. The per-gid CSV export
// is not individually published, so this is the working endpoint.
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS3i3R6bCeox2n9hPMrxTPY2cDBXYnnJtXIC74YrQ9q-lc1USCiQ9_4ksVWG1TiuFGXzKLGb6C8jcmR/pub?output=csv";

// Minimal RFC-4180 CSV parser (handles quoted fields, embedded commas/newlines).
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\r") { /* skip */ }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");
function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(DIACRITICS, "").trim();
}

// Ordered, most-specific-first. First key contained in the zone wins; otherwise
// we fall back to the city centroid.
const ZONE_COORDS: Array<[string, number, number]> = [
  ["los palos grandes", 10.503, -66.844],
  ["los dos caminos", 10.509, -66.829],
  ["el paraiso", 10.479, -66.929],
  ["pinto salinas", 10.5, -66.895],
  ["el recreo", 10.501, -66.892],
  ["proceres", 10.476, -66.891],
  ["chacao", 10.497, -66.854],
  ["punta brisas", 10.6075, -66.886],
  ["15 letras", 10.608, -66.889],
  ["macuto", 10.6085, -66.8915],
  ["caraballeda", 10.613, -66.852],
  ["caribe", 10.612, -66.855],
  ["tucacas", 10.799, -68.316],
];

const CITY_COORDS: Array<[string, number, number]> = [
  ["la guaira", 10.601, -66.933],
  ["caracas", 10.488, -66.879],
  ["tucacas", 10.799, -68.316],
];

// Deterministic small offset (~±150m) from a string, so multiple buildings in
// the same zone don't stack on one pixel.
function jitter(seed: string): [number, number] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const a = ((h % 1000) / 1000 - 0.5) * 0.0032;
  const b = (((h >> 10) % 1000) / 1000 - 0.5) * 0.0032;
  return [a, b];
}

function geocode(city: string, zone: string, seed: string): [number, number] | null {
  const z = norm(zone);
  const c = norm(city);
  let base: [number, number] | null = null;
  for (const [key, lat, lng] of ZONE_COORDS) if (z.includes(key)) { base = [lat, lng]; break; }
  if (!base) for (const [key, lat, lng] of CITY_COORDS) if (c.includes(key)) { base = [lat, lng]; break; }
  if (!base) return null;
  const [da, db] = jitter(seed);
  return [base[0] + da, base[1] + db];
}

export async function getDamagedBuildingMarkers(): Promise<MapMarker[]> {
  let text: string;
  try {
    const res = await fetch(CSV_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 120 }, // near-realtime, but don't hammer Google
    });
    if (!res.ok) return [];
    text = await res.text();
  } catch {
    return [];
  }

  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  const header = rows[0].map(norm);
  const col = (name: string) => header.findIndex((h) => h.includes(name));
  const iCity = col("ciudad");
  const iZone = col("zona");
  const iBuilding = col("edificio");
  const iReport = col("reporte");
  const iVerif = col("verificacion");
  const iSource = col("cuenta");
  const iSearch = col("busqueda");
  const iNote = col("nota");
  if (iBuilding < 0) return [];

  const markers: MapMarker[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const get = (i: number) => (i >= 0 && i < row.length ? row[i].trim() : "");
    const building = get(iBuilding);
    const zone = get(iZone);
    const city = get(iCity);
    if (!building && !zone) continue;

    const coords = geocode(city, zone, `${building}|${zone}|${r}`);
    if (!coords) continue;

    const report = get(iReport);
    const firstUrl = get(iSearch).split(/\s+/).find((s) => s.startsWith("http")) || "";

    markers.push({
      id: `dmg_${r}`,
      kind: "damaged",
      lat: coords[0],
      lng: coords[1],
      title: building || zone,
      subtitle: [report, [zone, city].filter(Boolean).join(", ")].filter(Boolean).join(" — "),
      confidence: get(iVerif) || undefined,
      source: get(iSource) || undefined,
      note: get(iNote) || undefined,
      href: firstUrl,
      linkLabel: firstUrl ? "Ver fuente en X →" : undefined,
      approx: true,
    });
  }
  return markers;
}
