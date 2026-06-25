import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ShareButtons from "@/components/ShareButtons";
import SourceBadge from "@/components/SourceBadge";
import ManageControls from "@/components/ManageControls";
import { getDamagedReport } from "@/lib/data";
import { fullDate, timeAgo } from "@/lib/format";
import { siteUrl } from "@/lib/share";
import { DAMAGE_SEVERITY, REQUEST_STATUSES } from "@/lib/constants";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const r = await getDamagedReport(id);
  if (!r) return { title: "Reporte no encontrado — Venezuela Ayuda" };
  return { title: `${r.place_name} — Venezuela Ayuda` };
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
  const r = await getDamagedReport(id);
  if (!r) notFound();

  const severity = DAMAGE_SEVERITY[r.severity];
  const url = siteUrl(`/edificio/${r.id}`);
  const shareText = `🏚️ Reporte de edificio dañado en Venezuela Ayuda`;

  return (
    <>
      <Header />
      <main id="contenido" className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
        <Link
          href="/mapa"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800"
        >
          ← Mapa
        </Link>

        {nuevo === "1" && (
          <p className="mt-3 rounded-xl bg-green-50 px-4 py-3 font-medium text-green-800">
            ✅ ¡Listo! Publicamos tu reporte.
          </p>
        )}

        <article className="mt-4 rounded-2xl bg-white p-6 ring-1 ring-black/5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900">{r.place_name}</h1>
            {r.status === "RESOLVED" && (
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold"
                style={{ backgroundColor: "#eaf3ec", color: REQUEST_STATUSES.RESOLVED.color }}
              >
                ✅ {REQUEST_STATUSES.RESOLVED.label}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {severity && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold"
                style={{ backgroundColor: severity.tintBg, color: severity.color }}
              >
                {severity.label}
              </span>
            )}
          </div>

          {r.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.photo_url}
              alt=""
              className="mt-4 max-h-80 w-full rounded-xl object-cover ring-1 ring-slate-200"
            />
          )}

          {r.description && (
            <blockquote className="mt-4 border-l-4 border-slate-200 pl-4 text-lg text-slate-800">
              “{r.description}”
            </blockquote>
          )}

          {r.city && <p className="mt-4 text-slate-600">📍 {r.city}</p>}

          <p className="mt-4 text-sm text-slate-400" title={fullDate(r.created_at)}>
            Actualizado {timeAgo(r.created_at)}
          </p>

          <p className="mt-4 text-sm text-slate-500">
            ⚠️ Reporte de la comunidad, sin verificación oficial.
          </p>

          {r.source && (
            <p className="mt-2">
              <SourceBadge source={r.source} url={r.source_url} />
            </p>
          )}

          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="mb-2 font-semibold text-slate-800">Comparte este reporte</p>
            <ShareButtons text={shareText} url={url} compact />
          </div>
        </article>

        <ManageControls
          kind="damaged"
          id={r.id}
          resolved={r.status === "RESOLVED"}
          urlToken={t}
          isNew={nuevo === "1"}
        />

        <div className="mt-6 grid gap-2">
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
