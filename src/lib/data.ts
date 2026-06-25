import "server-only";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  PublicCheckin,
  PublicHelpRequest,
  PublicHelpOffer,
  MapMarker,
} from "@/lib/types";
import { HELP_CATEGORIES, OFFER_CATEGORIES } from "@/lib/constants";
import { formatItems } from "@/lib/validation";

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

export async function getMapMarkers(): Promise<MapMarker[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getServerSupabase();

  const [checkins, requests, offers] = await Promise.all([
    supabase
      .from("public_checkins")
      .select("id,name,status,city,latitude,longitude,message,created_at,found_at")
      .not("latitude", "is", null)
      .neq("status", "SAFE")
      .order("created_at", { ascending: false })
      .limit(2000),
    supabase
      .from("public_help_requests")
      .select(
        "id,category,description,urgency,city,latitude,longitude,status,created_at,place_name,items",
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

  const markers: MapMarker[] = [];

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

  return markers;
}

export interface Stats {
  people: number;
  requests: number;
  helpers: number;
}

// Lightweight COUNT(*) for the landing strip. `head: true` fetches no rows.
export async function getStats(): Promise<Stats> {
  if (!isSupabaseConfigured()) return { people: 0, requests: 0, helpers: 0 };
  const supabase = getServerSupabase();
  const [people, requests, helpers] = await Promise.all([
    supabase.from("public_checkins").select("id", { count: "exact", head: true }),
    supabase
      .from("public_help_requests")
      .select("id", { count: "exact", head: true })
      .neq("status", "RESOLVED"),
    supabase
      .from("public_help_offers")
      .select("id", { count: "exact", head: true })
      .eq("available", true),
  ]);
  return {
    people: people.count ?? 0,
    requests: requests.count ?? 0,
    helpers: helpers.count ?? 0,
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
