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

  return (
    <div className="rounded-2xl border border-[#e6ecf2] bg-white p-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 truncate text-base font-semibold text-[#14212e]">
              {item.label}
            </h3>
            {item.hidden && (
              <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                Oculto
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[#8190a0]">
            {item.sub ? `${item.sub} · ` : ""}
            {timeAgo(item.created_at)}
          </p>
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
