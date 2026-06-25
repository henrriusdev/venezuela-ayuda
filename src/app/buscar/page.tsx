import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import CheckinCard from "@/components/CheckinCard";
import { searchCheckins } from "@/lib/data";

export const metadata: Metadata = {
  title: "Buscar persona — Venezuela Ayuda",
  description: "Busca a un familiar o amigo por nombre o ciudad.",
};

// Re-fetch frequently; this list changes during an emergency.
export const revalidate = 30;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ nombre?: string; ciudad?: string }>;
}) {
  const sp = await searchParams;
  const name = sp.nombre?.trim() || "";
  const city = sp.ciudad?.trim() || "";
  const hasQuery = Boolean(name || city);

  const results = await searchCheckins({ name, city });

  return (
    <PageShell
      emoji="🔎"
      title="Buscar persona"
      intro="Busca por nombre o ciudad para ver si alguien se reportó."
    >
      <form method="get" className="space-y-3" role="search">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="nombre"
            defaultValue={name}
            placeholder="Nombre"
            aria-label="Nombre"
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
          className="w-full rounded-xl bg-violet-600 px-5 py-3.5 text-lg font-bold text-white active:scale-[0.99]"
        >
          Buscar
        </button>
      </form>

      <div className="mt-6">
        {hasQuery && (
          <p className="mb-3 text-sm text-slate-500">
            {results.length} resultado{results.length === 1 ? "" : "s"}
            {name && ` para “${name}”`}
            {city && ` en ${city}`}
          </p>
        )}

        {results.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center text-slate-600 ring-1 ring-black/5">
            {hasQuery ? (
              <>
                <p className="font-semibold text-slate-800">No encontramos a nadie todavía.</p>
                <p className="mt-1 text-sm">
                  La persona quizá aún no se ha reportado. Comparte el enlace para que se marque
                  a salvo.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-slate-800">Reportes recientes</p>
                <p className="mt-1 text-sm">
                  Escribe un nombre o ciudad para filtrar, o revisa los últimos reportes abajo.
                </p>
              </>
            )}
          </div>
        )}

        <div className="mt-4 grid gap-3">
          {results.map((c) => (
            <CheckinCard key={c.id} c={c} />
          ))}
        </div>

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
      </div>
    </PageShell>
  );
}
