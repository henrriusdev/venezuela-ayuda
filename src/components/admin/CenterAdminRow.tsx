"use client";

import { useState } from "react";
import { verifyCenter, setCenterHidden, deleteCenter } from "@/app/admin/actions";
import { timeAgo } from "@/lib/format";
import type { AdminCenterRow } from "@/lib/admin";

export default function CenterAdminRow({ item }: { item: AdminCenterRow }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setPending(true);
    setError(null);
    try {
      const res = await fn();
      if (res.ok) location.reload();
      else {
        setError(res.error ?? "No se pudo completar la acción.");
        setPending(false);
      }
    } catch {
      setError("No se pudo completar la acción.");
      setPending(false);
    }
  }

  const place = [item.city, item.state, item.country].filter(Boolean).join(" · ");
  const ship =
    item.can_ship_to_venezuela === true
      ? "Sí"
      : item.can_ship_to_venezuela === false
        ? "No"
        : "No indica";

  return (
    <div
      className={`rounded-2xl border bg-white p-4 ${
        item.verified ? "border-[#e6ecf2]" : "border-[#f0d9a8]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-[#14212e]">
          {item.name}
        </h3>
        {item.country === "Venezuela" && (
          <span className="shrink-0 rounded-full bg-[#eef9f2] px-2.5 py-1 text-xs font-semibold text-[#1f7a52]">
            🇻🇪 mapa
          </span>
        )}
      </div>

      <p className="mt-1 text-xs text-[#8190a0]">
        {place ? `${place} · ` : ""}
        {item.source === "user" ? "postulado" : "semilla"} · {timeAgo(item.created_at)}
      </p>

      {item.address && <p className="mt-1.5 text-sm text-[#5b6b7b]">📍 {item.address}</p>}
      {item.resources && (
        <p className="mt-1.5 text-sm text-[#5b6b7b]">
          <span className="font-medium text-[#14212e]">Reciben:</span> {item.resources}
        </p>
      )}

      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-[#5b6b7b]">
        {item.organizers && (
          <div className="col-span-2">
            <span className="font-medium text-[#14212e]">Organizadores:</span> {item.organizers}
          </div>
        )}
        {item.contact && (
          <div>
            <span className="font-medium text-[#14212e]">Contacto:</span> {item.contact}
          </div>
        )}
        {item.website && (
          <div className="truncate">
            <span className="font-medium text-[#14212e]">Web:</span> {item.website}
          </div>
        )}
        <div>
          <span className="font-medium text-[#14212e]">¿Envía a Venezuela?</span> {ship}
        </div>
        <div>
          <span className="font-medium text-[#14212e]">Voluntarios:</span>{" "}
          {item.volunteers_count ?? "—"}
          {item.needs_volunteers ? " · necesita más" : ""}
        </div>
      </dl>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {!item.verified && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            ⏳ Pendiente
          </span>
        )}
        {item.verified && (
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

      <div className="mt-3.5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => verifyCenter(item.id, !item.verified))}
          className="rounded-lg border border-[#e6ecf2] px-3 py-2 text-sm font-medium text-[#14212e] transition hover:bg-slate-50 active:scale-[0.99] disabled:opacity-60"
        >
          {item.verified ? "Quitar verificación" : "Aprobar / Verificar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setCenterHidden(item.id, !item.hidden))}
          className="rounded-lg border border-[#e6ecf2] px-3 py-2 text-sm font-medium text-[#14212e] transition hover:bg-slate-50 active:scale-[0.99] disabled:opacity-60"
        >
          {item.hidden ? "Mostrar" : "Ocultar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!window.confirm("¿Eliminar este centro definitivamente?")) return;
            run(() => deleteCenter(item.id));
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
