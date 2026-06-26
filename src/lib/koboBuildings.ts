import "server-only";
import type { MapMarker } from "@/lib/types";
import { DAMAGE_SEVERITY } from "@/lib/constants";

// Damaged-building reports sourced from a public KoboToolbox form. The form's
// data API is anonymously readable (no token needed), so we fetch it near-
// realtime (revalidated) and merge the results into the map alongside the
// curated spreadsheet and the community DB reports.
//
// We keep only "edificio_colapsado / daño estructural" events. Records carry
// exact coordinates in `_geolocation: [lat, lng]`, so these markers are NOT
// approximate. Deduplication against the other damaged sources (by geolocation)
// happens at merge time in lib/data.ts.

const KOBO_ASSET = "a8XWDsdUcpBzXGtgQmiiro";
// `query` filters server-side by the Evento value; we filter again in JS as a
// safeguard. `limit=30000` returns the whole (small) form in one page — if the
// form ever grows past that, follow the `next` cursor in the response.
const EVENTO = "edificio_colapsado___da_o_estructural";
const KOBO_URL =
  `https://kf.kobotoolbox.org/api/v2/assets/${KOBO_ASSET}/data.json` +
  `?format=json&limit=30000&query=${encodeURIComponent(JSON.stringify({ Evento: EVENTO }))}`;

interface KoboRecord {
  _id?: number;
  Evento?: string;
  Descripci_n_del_evento?: string;
  Ubicaci_n?: string;
  _geolocation?: Array<number | null>;
}

// Inside Venezuela's bounding box — same sanity check as damagedBuildings.ts.
function inVenezuela(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= 0 &&
    lat <= 16 &&
    lng >= -74 &&
    lng <= -59
  );
}

// Prefer `_geolocation` ([lat, lng]); fall back to the first two numbers of the
// `Ubicaci_n` string ("lat lng 0 0"). Returns null if neither is usable.
function coordsOf(r: KoboRecord): [number, number] | null {
  const geo = r._geolocation;
  if (Array.isArray(geo) && geo.length >= 2) {
    const lat = Number(geo[0]);
    const lng = Number(geo[1]);
    if (inVenezuela(lat, lng)) return [lat, lng];
  }
  if (typeof r.Ubicaci_n === "string") {
    const [lat, lng] = r.Ubicaci_n.trim().split(/\s+/).map(Number);
    if (inVenezuela(lat, lng)) return [lat, lng];
  }
  return null;
}

export async function getKoboDamagedMarkers(): Promise<MapMarker[]> {
  let results: KoboRecord[];
  try {
    const res = await fetch(KOBO_URL, {
      headers: { "User-Agent": "VenezuelaAyuda/1.0 (community emergency map)" },
      next: { revalidate: 120 }, // near-realtime, but don't hammer the source
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { results?: KoboRecord[] };
    results = Array.isArray(json.results) ? json.results : [];
  } catch {
    return [];
  }

  const markers: MapMarker[] = [];
  for (const r of results) {
    if (r.Evento !== EVENTO) continue; // defense in depth (server-side already filters)
    const coords = coordsOf(r);
    if (!coords) continue;

    const desc = (r.Descripci_n_del_evento ?? "").trim().slice(0, 120);
    markers.push({
      id: `kobo_${r._id}`,
      kind: "damaged",
      lat: coords[0],
      lng: coords[1],
      title: desc || "Edificio con daño estructural",
      subtitle: DAMAGE_SEVERITY.COLLAPSED.label,
      color: DAMAGE_SEVERITY.COLLAPSED.color, // collapse / structural damage
      confidence: "Fuente: KoboToolbox (sin verificar)",
      source: "KoboToolbox",
      href: `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`,
      linkLabel: "Cómo llegar →",
      approx: false,
    });
  }
  return markers;
}
