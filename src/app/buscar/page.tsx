import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import CheckinCard from "@/components/CheckinCard";
import SourcesNote from "@/components/SourcesNote";
import { searchCheckins, searchHelpRequests } from "@/lib/data";
import { HELP_CATEGORIES, URGENCY_LEVELS } from "@/lib/constants";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = {
  title: "Buscar persona — Venezuela Ayuda",
  description: "Busca a un familiar o amigo por nombre, edificio o ciudad.",
};

// Re-fetch frequently; this list changes during an emergency.
export const revalidate = 30;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ciudad?: string }>;
}) {
  const sp = await searchParams;
  const qStr = sp.q?.trim() || "";
  const city = sp.ciudad?.trim() || "";
  const hasQuery = qStr.length >= 2 || city.length >= 2;

  const [people, places] = hasQuery
    ? await Promise.all([
        searchCheckins({ q: qStr, city }),
        searchHelpRequests({ q: qStr, city }),
      ])
    : [[], []];

  const total = people.length + places.length;

  return (
    <PageShell
      emoji="🔎"
      title="Buscar persona"
      intro="Busca por nombre, edificio o ciudad para ver si alguien se reportó. ¿No la encuentras? Aquí también puedes reportarla como desaparecida."
    >
      <form method="get" className="space-y-3" role="search">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="q"
            defaultValue={qStr}
            placeholder="Nombre o edificio"
            aria-label="Nombre o edificio"
            maxLength={80}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base"
          />
          <input
            name="ciudad"
            defaultValue={city}
            placeholder="Ciudad"
            aria-label="Ciudad"
            maxLength={80}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base"
          />
        </div>
        <button
          type="submit"
          className="min-h-[56px] w-full rounded-[15px] px-5 py-3.5 text-lg font-semibold text-white active:scale-[0.99]"
          style={{ backgroundColor: "#2563a8" }}
        >
          Buscar
        </button>
      </form>

      <Link
        href="/galeria"
        className="mt-4 block rounded-2xl border border-[#e6ecf2] bg-white p-3 text-center text-sm font-semibold text-[#2563a8]"
      >
        📸 ¿No sabes el nombre? Mira las fotos de personas desaparecidas →
      </Link>

      <div className="mt-6">
        {!hasQuery ? (
          <div className="rounded-2xl bg-white p-6 text-center text-slate-600 ring-1 ring-black/5">
            <p className="font-semibold text-slate-800">
              Escribe un nombre, edificio o ciudad para buscar.
            </p>
            <p className="mt-1 text-sm">
              Por privacidad no mostramos un listado completo de personas.
            </p>
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-sm">¿Buscas a alguien que no aparece?</p>
              <Link
                href="/a-salvo?modo=desaparecido"
                className="mt-3 inline-block rounded-[15px] bg-[#2563a8] px-5 py-3 font-semibold text-white"
              >
                Reportar a una persona como desaparecida
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-500">
              {total} resultado{total === 1 ? "" : "s"}
              {qStr && ` para “${qStr}”`}
              {city && ` en ${city}`}
            </p>

            {total === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-center text-slate-600 ring-1 ring-black/5">
                <p className="font-semibold text-slate-800">No encontramos a nadie todavía.</p>
                <p className="mt-1 text-sm">
                  La persona quizá aún no se ha reportado. Comparte el enlace para que se marque
                  a salvo.
                </p>
                <Link
                  href="/a-salvo?modo=desaparecido"
                  className="mt-4 inline-block rounded-[15px] bg-[#2563a8] px-5 py-3 font-semibold text-white"
                >
                  Reportar a una persona como desaparecida
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {people.length > 0 && (
                  <section>
                    <h2 className="mb-2 text-sm font-semibold text-slate-700">
                      Personas{" "}
                      <span className="font-normal text-slate-400">({people.length})</span>
                    </h2>
                    <div className="grid gap-3">
                      {people.map((c) => (
                        <CheckinCard key={c.id} c={c} />
                      ))}
                    </div>
                  </section>
                )}

                {places.length > 0 && (
                  <section>
                    <h2 className="mb-2 text-sm font-semibold text-slate-700">
                      Lugares y solicitudes{" "}
                      <span className="font-normal text-slate-400">({places.length})</span>
                    </h2>
                    <div className="grid gap-3">
                      {places.map((r) => {
                        const cat = HELP_CATEGORIES[r.category];
                        const urgency = URGENCY_LEVELS[r.urgency];
                        return (
                          <Link
                            key={r.id}
                            href={`/solicitud/${r.id}`}
                            className="block rounded-2xl border border-[#e6ecf2] bg-white p-4 transition hover:border-[#c9d6e3]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-[#14212e]">
                                {r.place_name || cat?.label}
                              </h3>
                              {urgency && (
                                <span
                                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
                                  style={{
                                    backgroundColor: urgency.tintBg,
                                    color: urgency.color,
                                  }}
                                >
                                  {urgency.label}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#8190a0]">
                              {cat && (
                                <span className="rounded-full bg-[#eef3fa] px-2.5 py-1 font-medium text-[#2563a8]">
                                  {cat.emoji} {cat.label}
                                </span>
                              )}
                              {r.city && <span>📍 {r.city}</span>}
                              <span>Actualizado {timeAgo(r.created_at)}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            )}
          </>
        )}

        <div className="mt-8 rounded-2xl bg-slate-100 p-4 text-center text-sm text-slate-600">
          ¿No lo encuentras?{" "}
          <Link href="/a-salvo" className="font-semibold text-blue-700 underline">
            Repórtate a salvo
          </Link>{" "}
          o{" "}
          <Link href="/mapa" className="font-semibold text-blue-700 underline">
            mira el mapa
          </Link>
          .
        </div>

        <SourcesNote />
      </div>
    </PageShell>
  );
}
