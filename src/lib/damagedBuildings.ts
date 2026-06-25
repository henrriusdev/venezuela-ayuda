import "server-only";
import type { MapMarker } from "@/lib/types";
import { parseCsv, norm } from "@/lib/csv";

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

// Online geocoder (OpenStreetMap Nominatim — keyless). Cached for a day per
// unique query via the Next data cache, so we hit it at most ~once/day/address
// and stay polite. Returns null on any failure → caller falls back to centroid.
async function geocodeOnline(query: string): Promise<[number, number] | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ve&q=${encodeURIComponent(
      query
    )}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "VenezuelaAyuda/1.0 (community emergency map)" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const arr = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(arr) || !arr.length) return null;
    const lat = parseFloat(arr[0].lat);
    const lng = parseFloat(arr[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    // Sanity: inside Venezuela's bounding box.
    if (lat < 0 || lat > 16 || lng < -74 || lng > -59) return null;
    return [lat, lng];
  } catch {
    return null;
  }
}

function centroidBase(city: string, zone: string): [number, number] | null {
  const z = norm(zone);
  const c = norm(city);
  for (const [key, lat, lng] of ZONE_COORDS) if (z.includes(key)) return [lat, lng];
  for (const [key, lat, lng] of CITY_COORDS) if (c.includes(key)) return [lat, lng];
  return null;
}

// Best available location: online zone geocode → online city geocode → hardcoded
// centroid. None are building-exact, so a small jitter is always applied to keep
// multiple reports in one area from stacking on a single pixel.
async function locate(
  city: string,
  zone: string,
  seed: string
): Promise<[number, number] | null> {
  const zoneQuery = zone.split("/")[0].trim();
  let base: [number, number] | null = null;
  if (zoneQuery) base = await geocodeOnline(`${zoneQuery}, ${city}, Venezuela`);
  if (!base && city) base = await geocodeOnline(`${city}, Venezuela`);
  if (!base) base = centroidBase(city, zone);
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

  const dataRows = rows.slice(1);
  const markers = await Promise.all(
    dataRows.map(async (row, idx): Promise<MapMarker | null> => {
      const r = idx + 1;
      const get = (i: number) => (i >= 0 && i < row.length ? row[i].trim() : "");
      const building = get(iBuilding);
      const zone = get(iZone);
      const city = get(iCity);
      if (!building && !zone) return null;

      const coords = await locate(city, zone, `${building}|${zone}|${r}`);
      if (!coords) return null;

      const report = get(iReport);
      const firstUrl = get(iSearch).split(/\s+/).find((s) => s.startsWith("http")) || "";

      return {
        id: `dmg_${r}`,
        kind: "damaged",
        lat: coords[0],
        lng: coords[1],
        title: building || zone,
        subtitle: [report, [zone, city].filter(Boolean).join(", ")]
          .filter(Boolean)
          .join(" — "),
        confidence: get(iVerif) || undefined,
        source: get(iSource) || undefined,
        note: get(iNote) || undefined,
        href: firstUrl,
        linkLabel: firstUrl ? "Ver fuente en X →" : undefined,
        approx: true,
      };
    })
  );
  return markers.filter((m): m is MapMarker => m !== null);
}
