import "server-only";
import { getAuthClient } from "@/lib/supabase/auth";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import { isEmailAdmin } from "@/lib/admin";

// Reviewer identity for the /deduplicar console. Same shape as lib/admin.ts:
// the allowlist (reviewer_emails) is read with the service key, and an admin is
// always allowed to review too.

export interface Reviewer {
  id: string; // auth.users.id — used as the lock owner (locked_by)
  email: string;
}

// Returns the logged-in reviewer (id + email), or null if not authenticated OR
// not authorized (neither on the reviewer allowlist nor an admin).
export async function getReviewer(): Promise<Reviewer | null> {
  if (!isSupabaseConfigured()) return null;
  const auth = await getAuthClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  const email = user?.email?.toLowerCase();
  if (!user || !email) return null;
  return (await isEmailReviewer(email)) ? { id: user.id, email } : null;
}

export async function isEmailReviewer(email: string): Promise<boolean> {
  const clean = email.toLowerCase();
  // Admins are reviewers by default.
  if (await isEmailAdmin(clean)) return true;
  const svc = getServerSupabase();
  const { data } = await svc
    .from("reviewer_emails")
    .select("email")
    .eq("email", clean)
    .maybeSingle();
  return Boolean(data);
}
