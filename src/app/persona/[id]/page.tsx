import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import ShareButtons from "@/components/ShareButtons";
import ManageControls from "@/components/ManageControls";
import { getCheckin } from "@/lib/data";
import { fullDate, timeAgo } from "@/lib/format";
import { siteUrl } from "@/lib/share";
import { CHECKIN_STATUSES, FOUND_BADGE } from "@/lib/constants";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = await getCheckin(id);
  if (!c) return { title: "Persona no encontrada — Venezuela Ayuda" };
  const status = CHECKIN_STATUSES[c.status].label;
  return {
    title: `${c.name} — ${status} · Venezuela Ayuda`,
    description: c.message ?? `${c.name} se reportó como ${status}.`,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuevo?: string; t?: string }>;
}) {
  const { id } = await params;
  const { nuevo, t } = await searchParams;
  const c = await getCheckin(id);
  if (!c) notFound();

  const url = siteUrl(`/persona/${c.id}`);
  const statusLabel = CHECKIN_STATUSES[c.status].label;
  const shareText = `${c.name} se reportó como "${statusLabel}" en Venezuela Ayuda.`;

  return (
    <>
      <Header />
      <main id="contenido" className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
        <Link
          href="/buscar"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800"
        >
          ← Buscar
        </Link>

        {nuevo === "1" && (
          <p className="mt-3 rounded-xl bg-green-50 px-4 py-3 font-medium text-green-800">
            ✅ ¡Listo! Guardamos tu reporte. Comparte este enlace con tu familia.
          </p>
        )}

        <article className="mt-4 rounded-2xl bg-white p-6 ring-1 ring-black/5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900">{c.name}</h1>
            {c.found_at ? (
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold"
                style={{ backgroundColor: FOUND_BADGE.tintBg, color: FOUND_BADGE.tintText }}
              >
                {FOUND_BADGE.emoji} {FOUND_BADGE.label}
              </span>
            ) : (
              <StatusBadge status={c.status} />
            )}
          </div>

          {c.photo_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={c.photo_url}
              alt={`Foto de ${c.name}`}
              className="mt-4 max-h-80 w-full rounded-xl object-cover ring-1 ring-slate-200"
            />
          )}

          {c.place_name && <p className="mt-2 text-slate-600">🏢 {c.place_name}</p>}
          {c.city && <p className="mt-2 text-slate-600">📍 {c.city}</p>}

          {c.found_at && (
            <p className="mt-2 text-sm font-medium text-green-700">
              Reportado como encontrado/a el {fullDate(c.found_at)}
            </p>
          )}

          {c.message && (
            <blockquote className="mt-4 border-l-4 border-slate-200 pl-4 text-lg text-slate-800">
              “{c.message}”
            </blockquote>
          )}

          <p className="mt-4 text-sm text-slate-400" title={fullDate(c.created_at)}>
            Actualizado {timeAgo(c.created_at)}
          </p>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="mb-2 font-semibold text-slate-800">Comparte este reporte</p>
            <ShareButtons text={shareText} url={url} compact />
          </div>
        </article>

        {c.status === "LOOKING_FOR_SOMEONE" && (
          <ManageControls
            kind="checkin"
            id={c.id}
            resolved={!!c.found_at}
            urlToken={t}
            isNew={nuevo === "1"}
          />
        )}

        <p className="mt-3 text-center text-xs text-slate-400">
          🔒 Por privacidad, los teléfonos nunca se muestran en esta página.
        </p>

        <div className="mt-6 grid gap-2">
          <Link
            href="/a-salvo"
            className="rounded-xl bg-green-600 px-5 py-3.5 text-center font-bold text-white"
          >
            Marcarme a salvo yo también
          </Link>
          <Link
            href="/mapa"
            className="rounded-xl bg-slate-900 px-5 py-3.5 text-center font-bold text-white"
          >
            Ver mapa de ayuda
          </Link>
        </div>
      </main>
    </>
  );
}
