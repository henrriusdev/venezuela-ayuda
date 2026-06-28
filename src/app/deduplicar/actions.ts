"use server";

import { redirect } from "next/navigation";
import { getAuthClient } from "@/lib/supabase/auth";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import { getReviewer, isEmailReviewer } from "@/lib/reviewer";

export type AuthState = { error?: string };

// How long a claim stays valid without a heartbeat. The console renews well
// before this (see HEARTBEAT_MS in the client), so a live tab keeps its lock;
// a tab that's closed/frozen loses it after this window so the group frees up.
const LOCK_TTL_SECONDS = 180;

// Group ids from the dedup API look like "GRP-xxxxx". Validate before passing to
// the DB so a bogus client can't inject arbitrary keys.
const GROUP_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
// Dataset slugs are lowercase alphanumerics (e.g. "terremotovenezuelaapp").
const DATASET_RE = /^[A-Za-z0-9_-]{1,64}$/;

// Locks are global across datasets, so a group id must be qualified by its
// dataset to avoid two datasets sharing the same group id colliding. The stored
// key is "<dataset>:<groupId>". Returns null if either part is invalid.
function lockKey(groupId: string, dataset?: string | null): string | null {
  if (!GROUP_ID_RE.test(groupId)) return null;
  if (!dataset) return groupId; // legacy/default dataset keeps the bare id
  if (!DATASET_RE.test(dataset)) return null;
  return `${dataset}:${groupId}`;
}

// Recover the bare group id from a stored "<dataset>:<groupId>" key (or return
// it unchanged for legacy bare keys), so the queue can match locks to rows.
function unqualify(key: string): string {
  const i = key.indexOf(":");
  return i === -1 ? key : key.slice(i + 1);
}

function emailOf(form: FormData) {
  return String(form.get("email") || "").trim().toLowerCase();
}

// --- Reviewer session (mirrors /admin sign-in/up/out) ------------------------

export async function reviewerSignIn(
  _prev: AuthState,
  form: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: "Servicio no disponible." };
  const email = emailOf(form);
  const password = String(form.get("password") || "");
  if (!email || !password) return { error: "Escribe tu correo y contraseña." };

  const auth = await getAuthClient();
  const { error } = await auth.auth.signInWithPassword({ email, password });
  if (error) return { error: "Correo o contraseña incorrectos." };

  if (!(await isEmailReviewer(email))) {
    await auth.auth.signOut();
    return { error: "Esta cuenta no tiene acceso de revisión." };
  }
  redirect("/deduplicar");
}

// First-time: an allowlisted reviewer email sets its own password (created
// server-side with email pre-confirmed, so there's no email round-trip).
export async function reviewerSignUp(
  _prev: AuthState,
  form: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: "Servicio no disponible." };
  const email = emailOf(form);
  const password = String(form.get("password") || "");
  if (!email || password.length < 8)
    return { error: "Usa una contraseña de al menos 8 caracteres." };
  if (!(await isEmailReviewer(email)))
    return { error: "Este correo no está autorizado para revisar." };

  const svc = getServerSupabase();
  const { error: createErr } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr && !/already|registered|exists/i.test(createErr.message))
    return { error: "No se pudo crear la cuenta. Intenta de nuevo." };

  const auth = await getAuthClient();
  const { error: signErr } = await auth.auth.signInWithPassword({ email, password });
  if (signErr)
    return {
      error: createErr
        ? "Ese correo ya tiene una cuenta. Usa Iniciar sesión."
        : "No se pudo iniciar sesión. Intenta de nuevo.",
    };
  redirect("/deduplicar");
}

export async function reviewerSignOut() {
  const auth = await getAuthClient();
  await auth.auth.signOut();
  redirect("/deduplicar");
}

// --- Group locks -------------------------------------------------------------

export type LockInfo = {
  groupId: string;
  lockedBy: string;
  lockedByEmail: string | null;
  expiresAt: string;
};

// Try to claim (or renew) a group for the current reviewer. Returns whether the
// lock is now held by them, plus who holds it if not. Called on select AND on a
// recurring heartbeat — the DB function is idempotent for the same owner.
export async function claimGroup(
  groupId: string,
  dataset?: string | null,
): Promise<{ ok: boolean; heldBy?: string | null }> {
  const reviewer = await getReviewer();
  if (!reviewer) return { ok: false };
  const key = lockKey(groupId, dataset);
  if (!key) return { ok: false };

  const svc = getServerSupabase();
  const { data, error } = await svc.rpc("claim_group_lock", {
    p_group_id: key,
    p_user_id: reviewer.id,
    p_email: reviewer.email,
    p_ttl_seconds: LOCK_TTL_SECONDS,
  });
  if (error) return { ok: false };
  if (data === true) return { ok: true };

  // Lost the race / someone else holds it — report who, for the UI message.
  const { data: locks } = await svc.rpc("active_group_locks");
  const held = (locks as Array<{ group_id: string; locked_by_email: string | null }> | null)
    ?.find((l) => l.group_id === key);
  return { ok: false, heldBy: held?.locked_by_email ?? "otro revisor" };
}

// Release a group's lock — only succeeds if the current reviewer owns it (the
// DB function checks locked_by). Called when leaving a group or finishing it.
export async function releaseGroup(
  groupId: string,
  dataset?: string | null,
): Promise<void> {
  const reviewer = await getReviewer();
  if (!reviewer) return;
  const key = lockKey(groupId, dataset);
  if (!key) return;
  const svc = getServerSupabase();
  await svc.rpc("release_group_lock", {
    p_group_id: key,
    p_user_id: reviewer.id,
  });
}

// All groups currently locked (and not expired), so the queue can show which
// are taken and by whom. Returns the current reviewer's own id so the client
// can distinguish "mine" from "someone else's".
export async function listActiveLocks(dataset?: string | null): Promise<{
  meId: string | null;
  locks: LockInfo[];
}> {
  const reviewer = await getReviewer();
  if (!reviewer) return { meId: null, locks: [] };
  const svc = getServerSupabase();
  const { data } = await svc.rpc("active_group_locks");
  const raw = (data ?? []) as Array<{
    group_id: string;
    locked_by: string;
    locked_by_email: string | null;
    expires_at: string;
  }>;
  // Keys are stored as "<dataset>:<groupId>" (bare id for the default dataset).
  // Scope to the dataset the caller is viewing so locks from another dataset's
  // identically-named groups don't leak in, and hand back bare group ids.
  const prefix = dataset ? `${dataset}:` : null;
  const inScope = raw.filter((l) =>
    prefix ? l.group_id.startsWith(prefix) : !l.group_id.includes(":"),
  );
  return {
    meId: reviewer.id,
    locks: inScope.map((l) => ({
      groupId: unqualify(l.group_id),
      lockedBy: l.locked_by,
      lockedByEmail: l.locked_by_email,
      expiresAt: l.expires_at,
    })),
  };
}
