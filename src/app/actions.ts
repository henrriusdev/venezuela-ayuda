"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import {
  cleanText,
  cleanOptional,
  parseLatLng,
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
  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Escribe un nombre.";
  if (!isValidStatus(status)) fieldErrors.status = "Selecciona un estado.";
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };

  const coords = parseLatLng(form.get("latitude"), form.get("longitude"));

  let id: string;
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("checkins")
      .insert({
        name,
        status,
        city: cleanOptional(form.get("city"), LIMITS.city),
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        message: cleanOptional(form.get("message"), LIMITS.message),
        phone_private: cleanOptional(form.get("phone"), LIMITS.phone),
      })
      .select("id")
      .single();
    if (error || !data) throw error;
    id = data.id;
  } catch {
    return {
      ok: false,
      error: "No pudimos guardar tu información. Revisa tu conexión e intenta de nuevo.",
    };
  }

  revalidatePath("/buscar");
  revalidatePath("/mapa");
  redirect(`/persona/${id}?nuevo=1`);
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

  const fieldErrors: Record<string, string> = {};
  if (!(category in HELP_CATEGORIES)) fieldErrors.category = "Selecciona una categoría.";
  if (!(urgency in URGENCY_LEVELS)) fieldErrors.urgency = "Selecciona la urgencia.";
  if (description.length < 5) fieldErrors.description = "Describe brevemente la necesidad.";
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };

  const coords = parseLatLng(form.get("latitude"), form.get("longitude"));

  try {
    const supabase = getServerSupabase();
    const { error } = await supabase.from("help_requests").insert({
      category,
      description,
      urgency,
      city: cleanOptional(form.get("city"), LIMITS.city),
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      contact: cleanOptional(form.get("contact"), LIMITS.phone),
    });
    if (error) throw error;
  } catch {
    return {
      ok: false,
      error: "No pudimos enviar tu solicitud. Revisa tu conexión e intenta de nuevo.",
    };
  }

  revalidatePath("/mapa");
  return { ok: true };
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
