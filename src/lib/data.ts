import "server-only";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  PublicCheckin,
  PublicHelpRequest,
  PublicHelpOffer,
  MapMarker,
} from "@/lib/types";
import { HELP_CATEGORIES, OFFER_CATEGORIES, URGENCY_LEVELS } from "@/lib/constants";

// All reads go through the public_* views, which never include phone/contact.

export async function searchCheckins(params: {
  name?: string;
  city?: string;
  limit?: number;
}): Promise<PublicCheckin[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getServerSupabase();
  let q = supabase
    .from("public_checkins")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(params.limit ?? 60);

  // ilike with escaped wildcards to avoid pattern-injection.
  if (params.name) q = q.ilike("name", `%${escapeLike(params.name)}%`);
  if (params.city) q = q.ilike("city", `%${escapeLike(params.city)}%`);

  const { data, error } = await q;
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

export async function getMapMarkers(): Promise<MapMarker[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getServerSupabase();

  const [checkins, requests, offers] = await Promise.all([
    supabase
      .from("public_checkins")
      .select("id,name,status,city,latitude,longitude,message,created_at")
      .not("latitude", "is", null)
      .order("created_at", { ascending: false })
      .limit(2000),
    supabase
      .from("public_help_requests")
      .select("id,category,description,urgency,city,latitude,longitude,status,created_at")
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
    markers.push({
      id: `c_${c.id}`,
      kind:
        c.status === "SAFE" ? "safe" : c.status === "NEEDS_HELP" ? "needs_help" : "looking",
      lat: c.latitude!,
      lng: c.longitude!,
      title: c.name,
      subtitle: c.city ?? c.message ?? undefined,
      href: `/persona/${c.id}`,
    });
  }

  for (const r of (requests.data ?? []) as PublicHelpRequest[]) {
    markers.push({
      id: `r_${r.id}`,
      kind: "request",
      lat: r.latitude!,
      lng: r.longitude!,
      title: `${HELP_CATEGORIES[r.category]?.label ?? r.category} · ${URGENCY_LEVELS[r.urgency]?.label ?? ""}`,
      subtitle: r.description?.slice(0, 120),
      href: "/mapa",
    });
  }

  for (const o of (offers.data ?? []) as PublicHelpOffer[]) {
    markers.push({
      id: `o_${o.id}`,
      kind: "offer",
      lat: o.latitude!,
      lng: o.longitude!,
      title: `Ofrece: ${OFFER_CATEGORIES[o.category]?.label ?? o.category}`,
      subtitle: (o.description ?? o.city ?? undefined)?.slice(0, 120),
      href: "/mapa",
    });
  }

  return markers;
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
