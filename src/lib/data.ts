import "server-only";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  PublicCheckin,
  PublicHelpRequest,
  PublicHelpOffer,
  PublicDamagedReport,
  MapMarker,
} from "@/lib/types";
import { HELP_CATEGORIES, OFFER_CATEGORIES, DAMAGE_SEVERITY } from "@/lib/constants";
import { formatItems } from "@/lib/validation";
import { getDamagedBuildingMarkers } from "@/lib/damagedBuildings";

// Curated relief / collection centers ("centros de acopio"). Static, always
// shown on the map. Coordinates are approximate (the authoritative info is the
// address in the popup + the "cómo llegar" link). Source: Operación Todos con VZLA.
const CENTER_ACCEPTS =
  "Reciben: agua potable, alimentos no perecederos, insumos médicos, ropa y abrigos.";

const RELIEF_CENTERS: Array<{ state: string; address: string; lat: number; lng: number }> = [
  {
    state: "Miranda",
    address: "4ta avenida de Altamira, entre 9na y 10ma transversal; quinta El Bejucal.",
    lat: 10.4972,
    lng: -66.8521,
  },
  {
    state: "Aragua",
    address: "Av. 19 de Abril, C.C. La Capilla, piso 1, local 21. Maracay.",
    lat: 10.2538,
    lng: -67.6038,
  },
  {
    state: "Carabobo",
    address: "Av. Monseñor Adams, El Viñedo. Edificio Talislandia, mezzanina. Valencia.",
    lat: 10.1878,
    lng: -68.0009,
  },
];

function reliefCenterMarkers(): MapMarker[] {
  return RELIEF_CENTERS.map((c, i) => ({
    id: `center_${i}`,
    kind: "center",
    lat: c.lat,
    lng: c.lng,
    title: `Centro de acopio · ${c.state}`,
    subtitle: `${c.address} ${CENTER_ACCEPTS}`,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${c.address} ${c.state} Venezuela`,
    )}`,
  }));
}

// All reads go through the public_* views, which never include phone/contact.

export async function searchCheckins(params: {
  q?: string;
  city?: string;
  limit?: number;
}): Promise<PublicCheckin[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getServerSupabase();
  let query = supabase
    .from("public_checkins")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(params.limit ?? 60);

  // ilike with escaped wildcards to avoid pattern-injection.
  if (params.q)
    query = query.or(
      `name.ilike.%${escapeLike(params.q)}%,place_name.ilike.%${escapeLike(params.q)}%`,
    );
  if (params.city) query = query.ilike("city", `%${escapeLike(params.city)}%`);

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as PublicCheckin[];
}

export async function searchHelpRequests(params: {
  q?: string;
  city?: string;
  limit?: number;
}): Promise<PublicHelpRequest[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getServerSupabase();
  let query = supabase
    .from("public_help_requests")
    .select("*")
    .neq("status", "RESOLVED")
    .order("created_at", { ascending: false })
    .limit(params.limit ?? 40);

  // ilike with escaped wildcards to avoid pattern-injection.
  if (params.q)
    query = query.or(
      `place_name.ilike.%${escapeLike(params.q)}%,description.ilike.%${escapeLike(params.q)}%`,
    );
  if (params.city) query = query.ilike("city", `%${escapeLike(params.city)}%`);

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as PublicHelpRequest[];
}

// Missing people who have a photo — for the "recognize by face" gallery.
export async function getMissingWithPhotos(params: {
  city?: string;
  limit?: number;
  offset?: number;
}): Promise<PublicCheckin[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getServerSupabase();
  const limit = params.limit ?? 60;
  const offset = params.offset ?? 0;
  let query = supabase
    .from("public_checkins")
    .select("*")
    .eq("status", "LOOKING_FOR_SOMEONE")
    .is("found_at", null)
    .not("photo_url", "is", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (params.city) query = query.ilike("city", `%${escapeLike(params.city)}%`);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as PublicCheckin[];
}

export async function getCheckin(id: string): Promise<PublicCheckin | null> {
  if (!isSupabaseConfigured() || !isUuid(id)) return null;
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("public_checkins")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as PublicCheckin;
}

export async function getHelpRequest(
  id: string,
): Promise<PublicHelpRequest | null> {
  if (!isSupabaseConfigured() || !isUuid(id)) return null;
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("public_help_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as PublicHelpRequest;
}

export async function getDamagedReport(
  id: string,
): Promise<PublicDamagedReport | null> {
  if (!isSupabaseConfigured() || !isUuid(id)) return null;
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("public_damaged_reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as PublicDamagedReport;
}

// Community-reported damaged buildings (from the DB view). Separate from the
// curated spreadsheet markers in getDamagedBuildingMarkers(); both use kind
// "damaged" intentionally.
export async function getDamagedReportMarkers(): Promise<MapMarker[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("public_damaged_reports")
    .select(
      "id,place_name,description,severity,city,latitude,longitude,photo_url,status,created_at,verified_at,source",
    )
    .not("latitude", "is", null)
    .neq("status", "RESOLVED")
    .order("created_at", { ascending: false })
    .limit(2000);

  return ((data ?? []) as PublicDamagedReport[]).map((r) => ({
    id: `dr_${r.id}`,
    kind: "damaged",
    lat: r.latitude!,
    lng: r.longitude!,
    title: r.place_name,
    subtitle: `${DAMAGE_SEVERITY[r.severity]?.label ?? r.severity}${
      r.description ? ` — ${r.description.slice(0, 100)}` : ""
    }`,
    confidence: r.verified_at
      ? "✅ Verificado por un administrador"
      : r.source
        ? `Fuente: ${r.source} (sin verificar)`
        : "Reporte de la comunidad (sin verificar)",
    href: `/edificio/${r.id}`,
    color: DAMAGE_SEVERITY[r.severity]?.color, // pin colored by severity
  }));
}

export async function getMapMarkers(): Promise<MapMarker[]> {
  // Curated relief centers + damaged-building reports are always shown, even if
  // the DB is unavailable. These run in parallel and fail soft.
  const externalMarkers = [reliefCenterMarkers(), await getDamagedBuildingMarkers()].flat();
  if (!isSupabaseConfigured()) return externalMarkers;
  const supabase = getServerSupabase();

  const [checkins, requests, offers] = await Promise.all([
    supabase
      .from("public_checkins")
      .select("id,name,status,city,latitude,longitude,message,created_at,found_at,source")
      .not("latitude", "is", null)
      .neq("status", "SAFE")
      .order("created_at", { ascending: false })
      .limit(2000),
    supabase
      .from("public_help_requests")
      .select(
        "id,category,description,urgency,city,latitude,longitude,status,created_at,place_name,items,source",
      )
      .not("latitude", "is", null)
      .neq("status", "RESOLVED")
      .order("created_at", { ascending: false })
      .limit(2000),
    supabase
      .from("public_help_offers")
      .select("id,category,description,city,latitude,longitude,available,created_at")
      .not("latitude", "is", null)
      .eq("available", true)
      .order("created_at", { ascending: false })
      .limit(2000),
  ]);

  const markers: MapMarker[] = [...externalMarkers];

  for (const c of (checkins.data ?? []) as PublicCheckin[]) {
    if (c.status === "NEEDS_HELP") {
      markers.push({
        id: `c_${c.id}`,
        kind: "need",
        lat: c.latitude!,
        lng: c.longitude!,
        title: c.name,
        subtitle: c.city ?? c.message ?? undefined,
        href: `/persona/${c.id}`,
        source: c.source ?? undefined,
        approx: c.source ? true : undefined,
      });
    } else if (c.status === "LOOKING_FOR_SOMEONE") {
      if (c.found_at) continue;
      markers.push({
        id: `c_${c.id}`,
        kind: "missing",
        lat: c.latitude!,
        lng: c.longitude!,
        title: c.name,
        subtitle: c.city ? `Última ubicación: ${c.city}` : c.message ?? undefined,
        href: `/persona/${c.id}`,
        source: c.source ?? undefined,
        approx: c.source ? true : undefined,
      });
    }
  }

  for (const r of (requests.data ?? []) as PublicHelpRequest[]) {
    const items = formatItems(r.items);
    const subtitle = [r.description?.slice(0, 120), items ? `🛠️ ${items}` : ""]
      .filter(Boolean)
      .join(" · ");
    markers.push({
      id: `r_${r.id}`,
      kind: "need",
      lat: r.latitude!,
      lng: r.longitude!,
      title: r.place_name || (HELP_CATEGORIES[r.category]?.label ?? r.category),
      subtitle: subtitle || undefined,
      href: `/solicitud/${r.id}`,
      source: r.source ?? undefined,
    });
  }

  for (const o of (offers.data ?? []) as PublicHelpOffer[]) {
    markers.push({
      id: `o_${o.id}`,
      kind: "helper",
      lat: o.latitude!,
      lng: o.longitude!,
      title: `Ofrece: ${OFFER_CATEGORIES[o.category]?.label ?? o.category}`,
      subtitle: (o.description ?? o.city ?? undefined)?.slice(0, 120),
      href: "/mapa",
    });
  }

  markers.push(...(await getDamagedReportMarkers()));

  return markers;
}

export interface Stats {
  safe: number;
  missing: number;
  found: number;
  requests: number;
  helpers: number;
  damaged: number;
}

const ZERO_STATS: Stats = { safe: 0, missing: 0, found: 0, requests: 0, helpers: 0, damaged: 0 };

// Lightweight COUNT(*) per category for the landing strip. `head: true` fetches
// no rows — just the counts.
export async function getStats(): Promise<Stats> {
  if (!isSupabaseConfigured()) return ZERO_STATS;
  const supabase = getServerSupabase();
  const count = () => ({ count: "exact" as const, head: true });
  const [safe, missing, found, requests, helpers, damaged, sheet] = await Promise.all([
    supabase.from("public_checkins").select("id", count()).eq("status", "SAFE"),
    supabase
      .from("public_checkins")
      .select("id", count())
      .eq("status", "LOOKING_FOR_SOMEONE")
      .is("found_at", null),
    supabase
      .from("public_checkins")
      .select("id", count())
      .eq("status", "LOOKING_FOR_SOMEONE")
      .not("found_at", "is", null),
    supabase.from("public_help_requests").select("id", count()).neq("status", "RESOLVED"),
    supabase.from("public_help_offers").select("id", count()).eq("available", true),
    supabase.from("public_damaged_reports").select("id", count()).neq("status", "RESOLVED"),
    // Curated spreadsheet damaged buildings (cached fetch — deduped with the map).
    getDamagedBuildingMarkers(),
  ]);
  return {
    safe: safe.count ?? 0,
    missing: missing.count ?? 0,
    found: found.count ?? 0,
    requests: requests.count ?? 0,
    helpers: helpers.count ?? 0,
    damaged: (damaged.count ?? 0) + sheet.length,
  };
}

export async function listRequests(limit = 100): Promise<PublicHelpRequest[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("public_help_requests")
    .select("*")
    .neq("status", "RESOLVED")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as PublicHelpRequest[];
}

// Helpers -------------------------------------------------------------------
function escapeLike(s: string): string {
  return s.replace(/[%_\\]/g, "\\$&").slice(0, 80);
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
