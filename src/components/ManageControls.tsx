"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  markCheckinFound,
  resolveHelpRequest,
  resolveDamagedReport,
} from "@/app/actions";
import { siteUrl } from "@/lib/share";

// Reporter-only management. The secret manage token comes from the URL at
// creation time (and is persisted in this browser), so a random visitor with
// only the public id sees nothing.
export default function ManageControls({
  kind,
  id,
  resolved,
  urlToken,
  isNew = false,
}: {
  kind: "checkin" | "request" | "damaged";
  id: string;
  resolved: boolean;
  urlToken?: string;
  isNew?: boolean;
}) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(urlToken ?? null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      if (urlToken) {
        localStorage.setItem("manage:" + id, urlToken);
      } else {
        const stored = localStorage.getItem("manage:" + id);
        // Syncing from a browser-only store (localStorage) — must happen post-mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (stored) setToken(stored);
      }
    } catch {
      /* localStorage unavailable */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No token known and not a fresh report → render nothing.
  if (!token && !isNew) return null;

  const path = `/${
    kind === "checkin" ? "persona" : kind === "request" ? "solicitud" : "edificio"
  }/${id}`;

  async function copyManageLink() {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(siteUrl(`${path}?t=${token}`));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function toggle() {
    if (!token) return;
    setPending(true);
    setError(null);
    try {
      const result =
        kind === "checkin"
          ? await markCheckinFound(id, token, !resolved)
          : kind === "request"
            ? await resolveHelpRequest(id, token, !resolved)
            : await resolveDamagedReport(id, token, !resolved);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error ?? "No se pudo actualizar.");
      }
    } catch {
      setError("No se pudo actualizar. Intenta de nuevo.");
    } finally {
      setPending(false);
    }
  }

  const actionLabel =
    kind === "checkin"
      ? resolved
        ? "Reabrir búsqueda"
        : "Marcar como encontrado/a"
      : kind === "request"
        ? resolved
          ? "Reabrir solicitud"
          : "Marcar como resuelta"
        : resolved
          ? "Reabrir reporte"
          : "Marcar como resuelto";

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
      {isNew && token && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="font-bold text-amber-900">
            🔑 Guarda tu enlace privado para gestionar este reporte (marcarlo
            como resuelto más tarde). No lo compartas.
          </p>
          <button
            type="button"
            onClick={copyManageLink}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-200 px-4 py-3 font-bold text-amber-900 active:scale-[0.99]"
          >
            <span aria-hidden>🔗</span>{" "}
            {copied ? "¡Copiado!" : "Copiar enlace de gestión"}
          </button>
        </div>
      )}

      {token && (
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          style={
            resolved
              ? undefined
              : { backgroundColor: "#1f7a52" }
          }
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 font-bold active:scale-[0.99] disabled:opacity-60 ${
            resolved
              ? "bg-slate-200 text-slate-800"
              : "text-white"
          }`}
        >
          {pending ? "Guardando…" : actionLabel}
        </button>
      )}

      {error && <p className="mt-3 text-sm font-bold text-red-600">{error}</p>}
    </section>
  );
}
