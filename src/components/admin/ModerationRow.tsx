"use client";

import { useState } from "react";
import { setHidden, deleteReport } from "@/app/admin/actions";
import { timeAgo } from "@/lib/format";
import type { ModerationItem } from "@/lib/admin";

export default function ModerationRow({ item }: { item: ModerationItem }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setPending(true);
    setError(null);
    try {
      const res = await fn();
      if (res.ok) {
        location.reload();
      } else {
        setError(res.error ?? "No se pudo completar la acción.");
        setPending(false);
      }
    } catch {
      setError("No se pudo completar la acción.");
      setPending(false);
    }
  }

  const kindColor =
    item.table === "checkins"
      ? "bg-rose-100 text-rose-700"
      : item.table === "help_requests"
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";

  return (
    <div className="rounded-2xl border border-[#e6ecf2] bg-white p-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${kindColor}`}>
              {item.kind}
            </span>
            <h3 className="min-w-0 truncate text-base font-semibold text-[#14212e]">
              {item.label}
            </h3>
            {item.hidden ? (
              <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-white">
                Oculto (no visible al público)
              </span>
            ) : (
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                Visible al público
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#8190a0]">
            {item.sub ? `${item.sub} · ` : ""}
            {timeAgo(item.created_at)}
            {` · ${item.source ? `Fuente: ${item.source}` : "Desde el sitio"}`}
          </p>
          {item.detail && (
            <p className="mt-2 line-clamp-2 text-sm text-[#5b6b7b]">{item.detail}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setHidden(item.table, item.id, !item.hidden))}
            className="rounded-lg border border-[#e6ecf2] px-3 py-2 text-sm font-medium text-[#14212e] transition hover:bg-slate-50 active:scale-[0.99] disabled:opacity-60"
          >
            {item.hidden ? "Mostrar" : "Ocultar"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!window.confirm("¿Eliminar este reporte definitivamente?"))
                return;
              run(() => deleteReport(item.table, item.id));
            }}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 active:scale-[0.99] disabled:opacity-60"
          >
            Eliminar
          </button>
        </div>
      </div>

      {error && <p className="mt-2.5 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
