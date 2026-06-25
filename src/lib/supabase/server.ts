import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client.
//
// Reads/writes go through here so the service-role key (and therefore private
// phone numbers) never reach the browser. If the service-role key is absent we
// fall back to the anon key — the app still works because RLS allows anon
// inserts and the public_* views expose only non-sensitive columns.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let cached: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && (serviceKey || anonKey));
}

export function getServerSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }
  if (cached) return cached;
  cached = createClient(url!, (serviceKey || anonKey)!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
