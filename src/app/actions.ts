"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import {
  cleanText,
  cleanOptional,
  parseLatLng,
  parseItems,
  isValidStatus,
} from "@/lib/validation";
import { LIMITS, HELP_CATEGORIES, OFFER_CATEGORIES, URGENCY_LEVELS } from "@/lib/constants";

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

// Shared guards -------------------------------------------------------------
function notConfigured(): ActionState {
  return {
    ok: false,
    error:
      "El servicio no está disponible en este momento. Intenta de nuevo más tarde.",
  };
}

// Honeypot: a hidden field real users never fill. Bots usually do.
function isBot(form: FormData): boolean {
  return cleanText(form.get("website"), 100).length > 0;
}

// Decode a (already client-downscaled) JPEG/PNG/WebP data URL and upload it to
// the public photo bucket. Non-blocking: returns null on any problem so a failed
// upload never blocks the report itself.
async function uploadCheckinPhoto(
  supabase: ReturnType<typeof getServerSupabase>,
  id: string,
  dataUrl: FormDataEntryValue | null
): Promise<string | null> {
  if (typeof dataUrl !== "string" || !dataUrl) return null;
  const m = dataUrl.match(/^data:(image\/(jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) return null;
  const contentType = m[1];
  const ext = m[2] === "jpeg" ? "jpg" : m[2];
  const buffer = Buffer.from(m[3], "base64");
  if (buffer.byteLength < 100 || buffer.byteLength > 3_000_000) return null;
  try {
    const path = `${id}.${ext}`;
    const { error } = await supabase.storage
      .from("checkin-photos")
      .upload(path, buffer, { contentType, upsert: true });
    if (error) return null;
    return supabase.storage.from("checkin-photos").getPublicUrl(path).data.publicUrl ?? null;
  } catch {
    return null;
  }
}

// 1. Safety check-in --------------------------------------------------------
export async function submitCheckin(
  _prev: ActionState,
  form: FormData
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return notConfigured();
  if (isBot(form)) return { ok: true }; // silently drop

  const limited = rateLimit(await clientKey("checkin"), { limit: 6, windowSec: 60 });
  if (!limited.ok)
    return {
      ok: false,
      error: `Demasiados envíos. Espera ${limited.retryAfterSec}s e intenta de nuevo.`,
    };

  const name = cleanText(form.get("name"), LIMITS.name);
  const status = String(form.get("status") || "SAFE");
  const coords = parseLatLng(form.get("latitude"), form.get("longitude"));

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Escribe un nombre.";
  if (!isValidStatus(status)) fieldErrors.status = "Selecciona un estado.";
  if (status !== "SAFE" && !coords)
    fieldErrors.location = "Indica la ubicación en el mapa.";
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };

  // Generate the id ourselves so we don't need to read the row back. Reading it
  // back would require a SELECT policy on `checkins`, which we deliberately omit
  // so private phone numbers stay unreadable via the public key.
  const id = crypto.randomUUID();
  const manageToken = crypto.randomUUID();
  try {
    const supabase = getServerSupabase();
    const photoUrl = await uploadCheckinPhoto(supabase, id, form.get("photo_data"));
    const { error } = await supabase.from("checkins").insert({
      id,
      name,
      status,
      city: cleanOptional(form.get("city"), LIMITS.city),
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      message: cleanOptional(form.get("message"), LIMITS.message),
      phone_private: cleanOptional(form.get("phone"), LIMITS.phone),
      place_name: cleanOptional(form.get("place_name"), LIMITS.place_name),
      photo_url: photoUrl,
      manage_token: manageToken,
    });
    if (error) throw error;
  } catch {
    return {
      ok: false,
      error: "No pudimos guardar tu información. Revisa tu conexión e intenta de nuevo.",
    };
  }

  revalidatePath("/buscar");
  revalidatePath("/mapa");
  redirect(`/persona/${id}?nuevo=1&t=${manageToken}`);
}

// 3. Help request -----------------------------------------------------------
export async function submitHelpRequest(
  _prev: ActionState,
  form: FormData
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return notConfigured();
  if (isBot(form)) return { ok: true };

  const limited = rateLimit(await clientKey("request"), { limit: 8, windowSec: 60 });
  if (!limited.ok)
    return { ok: false, error: `Demasiados envíos. Espera ${limited.retryAfterSec}s.` };

  const category = String(form.get("category") || "");
  const urgency = String(form.get("urgency") || "MEDIUM");
  const description = cleanText(form.get("description"), LIMITS.description);

  const coords = parseLatLng(form.get("latitude"), form.get("longitude"));

  const fieldErrors: Record<string, string> = {};
  if (!(category in HELP_CATEGORIES)) fieldErrors.category = "Selecciona una categoría.";
  if (!(urgency in URGENCY_LEVELS)) fieldErrors.urgency = "Selecciona la urgencia.";
  if (description.length < 5) fieldErrors.description = "Describe brevemente la necesidad.";
  if (!coords) fieldErrors.location = "Indica la ubicación en el mapa.";
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };

  const items = parseItems(form.get("items"));

  const id = crypto.randomUUID();
  const manageToken = crypto.randomUUID();
  try {
    const supabase = getServerSupabase();
    const { error } = await supabase.from("help_requests").insert({
      id,
      category,
      description,
      urgency,
      city: cleanOptional(form.get("city"), LIMITS.city),
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      contact: cleanOptional(form.get("contact"), LIMITS.phone),
      place_name: cleanOptional(form.get("place_name"), LIMITS.place_name),
      items: items.length ? items : null,
      manage_token: manageToken,
    });
    if (error) throw error;
  } catch {
    return {
      ok: false,
      error: "No pudimos enviar tu solicitud. Revisa tu conexión e intenta de nuevo.",
    };
  }

  revalidatePath("/mapa");
  redirect(`/solicitud/${id}?nuevo=1&t=${manageToken}`);
}

// 4. Help offer -------------------------------------------------------------
export async function submitHelpOffer(
  _prev: ActionState,
  form: FormData
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return notConfigured();
  if (isBot(form)) return { ok: true };

  const limited = rateLimit(await clientKey("offer"), { limit: 8, windowSec: 60 });
  if (!limited.ok)
    return { ok: false, error: `Demasiados envíos. Espera ${limited.retryAfterSec}s.` };

  const category = String(form.get("category") || "");
  const fieldErrors: Record<string, string> = {};
  if (!(category in OFFER_CATEGORIES)) fieldErrors.category = "Selecciona qué puedes ofrecer.";
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };

  const coords = parseLatLng(form.get("latitude"), form.get("longitude"));

  try {
    const supabase = getServerSupabase();
    const { error } = await supabase.from("help_offers").insert({
      category,
      description: cleanOptional(form.get("description"), LIMITS.description),
      city: cleanOptional(form.get("city"), LIMITS.city),
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      availability: cleanOptional(form.get("availability"), LIMITS.availability),
      contact: cleanOptional(form.get("contact"), LIMITS.phone),
    });
    if (error) throw error;
  } catch {
    return {
      ok: false,
      error: "No pudimos enviar tu oferta. Revisa tu conexión e intenta de nuevo.",
    };
  }

  revalidatePath("/mapa");
  return { ok: true };
}

// 5. Reporter-managed resolution -------------------------------------------
async function verifyManageToken(
  table: "checkins" | "help_requests",
  id: string,
  token: string
): Promise<boolean> {
  if (!token) return false;
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from(table)
    .select("manage_token")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return false;
  return data.manage_token != null && data.manage_token === token;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function markCheckinFound(
  id: string,
  token: string,
  found: boolean
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Servicio no disponible." };
  const limited = rateLimit(await clientKey("manage"), { limit: 20, windowSec: 60 });
  if (!limited.ok)
    return { ok: false, error: `Demasiados intentos. Espera ${limited.retryAfterSec}s.` };
  if (!UUID_RE.test(id) || !token) return { ok: false, error: "No autorizado." };
  if (!(await verifyManageToken("checkins", id, token)))
    return { ok: false, error: "No autorizado." };
  try {
    const supabase = getServerSupabase();
    const { error } = await supabase
      .from("checkins")
      .update({ found_at: found ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) throw error;
  } catch {
    return { ok: false, error: "No se pudo actualizar. Intenta de nuevo." };
  }
  revalidatePath("/mapa");
  revalidatePath("/buscar");
  revalidatePath(`/persona/${id}`);
  return { ok: true };
}

export async function resolveHelpRequest(
  id: string,
  token: string,
  resolved: boolean
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Servicio no disponible." };
  const limited = rateLimit(await clientKey("manage"), { limit: 20, windowSec: 60 });
  if (!limited.ok)
    return { ok: false, error: `Demasiados intentos. Espera ${limited.retryAfterSec}s.` };
  if (!UUID_RE.test(id) || !token) return { ok: false, error: "No autorizado." };
  if (!(await verifyManageToken("help_requests", id, token)))
    return { ok: false, error: "No autorizado." };
  try {
    const supabase = getServerSupabase();
    const { error } = await supabase
      .from("help_requests")
      .update({ status: resolved ? "RESOLVED" : "OPEN" })
      .eq("id", id);
    if (error) throw error;
  } catch {
    return { ok: false, error: "No se pudo actualizar. Intenta de nuevo." };
  }
  revalidatePath("/mapa");
  revalidatePath("/buscar");
  revalidatePath(`/solicitud/${id}`);
  return { ok: true };
}
