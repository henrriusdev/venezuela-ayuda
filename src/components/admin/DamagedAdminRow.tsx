"use client";

import { useState } from "react";
import {
  verifyDamagedReport,
  setHidden,
  deleteReport,
} from "@/app/admin/actions";
import { DAMAGE_SEVERITY, type DamageSeverity } from "@/lib/constants";
import { timeAgo } from "@/lib/format";
import type { AdminDamagedRow } from "@/lib/admin";

export default function DamagedAdminRow({ item }: { item: AdminDamagedRow }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sev = DAMAGE_SEVERITY[item.severity as DamageSeverity] ?? {
    label: item.severity,
    color: "#5b6b7b",
    tintBg: "#f0f3f7",
  };

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
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-[#14212e]">
          {item.place_name}
        </h3>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ backgroundColor: sev.tintBg, color: sev.color }}
        >
          {sev.label}
        </span>
      </div>

      <p className="mt-1 text-xs text-[#8190a0]">
        {item.city ? `${item.city} · ` : ""}
        {timeAgo(item.created_at)}
      </p>

      {item.description && (
        <p className="mt-2 line-clamp-2 text-sm text-[#5b6b7b]">
          {item.description}
        </p>
      )}

      {(item.verified_at || item.hidden) && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {item.verified_at && (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              ✅ Verificado
            </span>
          )}
          {item.hidden && (
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              Oculto
            </span>
          )}
        </div>
      )}

      <div className="mt-3.5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(() => verifyDamagedReport(item.id, !item.verified_at))
          }
          className="rounded-lg border border-[#e6ecf2] px-3 py-2 text-sm font-medium text-[#14212e] transition hover:bg-slate-50 active:scale-[0.99] disabled:opacity-60"
        >
          {item.verified_at ? "Quitar verificación" : "Verificar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setHidden("damaged_reports", item.id, !item.hidden))}
          className="rounded-lg border border-[#e6ecf2] px-3 py-2 text-sm font-medium text-[#14212e] transition hover:bg-slate-50 active:scale-[0.99] disabled:opacity-60"
        >
          {item.hidden ? "Mostrar" : "Ocultar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!window.confirm("¿Eliminar este reporte definitivamente?")) return;
            run(() => deleteReport("damaged_reports", item.id));
          }}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 active:scale-[0.99] disabled:opacity-60"
        >
          Eliminar
        </button>
      </div>

      {error && <p className="mt-2.5 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
