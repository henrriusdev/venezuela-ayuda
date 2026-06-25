import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import SourceBadge from "@/components/SourceBadge";
import { getMatchingRequests } from "@/lib/data";
import { formatItems } from "@/lib/validation";
import {
  HELP_CATEGORIES,
  OFFER_CATEGORIES,
  OFFER_TO_HELP,
  URGENCY_LEVELS,
  type HelpCategory,
  type OfferCategory,
} from "@/lib/constants";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Solicitudes de ayuda — Venezuela Ayuda",
  description:
    "Personas que necesitan ayuda. Encuentra una que puedas atender cerca de ti.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    desde?: string;
    cat?: string;
    lat?: string;
    lng?: string;
    ciudad?: string;
    categoria?: string;
  }>;
}) {
  const sp = await searchParams;
  const cat = sp.cat;
  const categoria = sp.categoria;
  const ciudad = sp.ciudad?.trim() || undefined;

  // Resolve which help-request categories to show.
  let categories: HelpCategory[] | undefined;
  if (cat && cat in OFFER_CATEGORIES) {
    categories = OFFER_TO_HELP[cat as OfferCategory];
  } else if (categoria && categoria in HELP_CATEGORIES) {
    categories = [categoria as HelpCategory];
  } else {
    categories = undefined;
  }

  const latNum = sp.lat != null ? Number(sp.lat) : NaN;
  const lngNum = sp.lng != null ? Number(sp.lng) : NaN;
  const lat = Number.isNaN(latNum) ? undefined : latNum;
  const lng = Number.isNaN(lngNum) ? undefined : lngNum;

  const requests = await getMatchingRequests({
    categories: categories?.length ? categories : undefined,
    lat,
    lng,
    city: ciudad,
    limit: 60,
  });

  const fromOffer = sp.desde === "oferta";
  const offerInfo = cat && cat in OFFER_CATEGORIES ? OFFER_CATEGORIES[cat as OfferCategory] : null;

  const h1 = fromOffer
    ? "🙌 ¡Gracias por ofrecer ayuda!"
    : "🆘 Solicitudes de ayuda activas";
  const intro = fromOffer
    ? `Estas personas necesitan ayuda cerca de ti. Si puedes atender una, ábrela y deja tu contacto.${
        offerInfo ? ` Mostrando lo que puedes cubrir con ${offerInfo.label.toLowerCase()}.` : ""
      }`
    : "Personas que pidieron ayuda. Encuentra una que puedas atender.";

  return (
    <>
      <Header />
      <main
        id="contenido"
        className="mx-auto w-full max-w-2xl flex-1 px-4 py-6"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800"
        >
          ← Volver al inicio
        </Link>

        <h1 className="mt-3 text-2xl font-extrabold text-slate-900">{h1}</h1>
        <p className="mt-1 text-[#5b6b7b]">{intro}</p>

        {/* Category filter chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={ciudad ? `/solicitudes?ciudad=${encodeURIComponent(ciudad)}` : "/solicitudes"}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              !categoria
                ? "bg-[#2563a8] text-white"
                : "bg-[#eef3fa] text-[#2563a8]"
            }`}
          >
            Todas
          </Link>
          {(Object.keys(HELP_CATEGORIES) as HelpCategory[]).map((key) => {
            const c = HELP_CATEGORIES[key];
            const params = new URLSearchParams();
            params.set("categoria", key);
            if (ciudad) params.set("ciudad", ciudad);
            const active = categoria === key;
            return (
              <Link
                key={key}
                href={`/solicitudes?${params.toString()}`}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  active
                    ? "bg-[#2563a8] text-white"
                    : "bg-[#eef3fa] text-[#2563a8]"
                }`}
              >
                {c.emoji} {c.label}
              </Link>
            );
          })}
        </div>

        {/* City filter form */}
        <form method="get" className="mt-4 flex gap-2">
          {categoria && <input type="hidden" name="categoria" value={categoria} />}
          {cat && <input type="hidden" name="cat" value={cat} />}
          {sp.lat != null && <input type="hidden" name="lat" value={sp.lat} />}
          {sp.lng != null && <input type="hidden" name="lng" value={sp.lng} />}
          <input
            name="ciudad"
            defaultValue={ciudad}
            placeholder="Filtra por ciudad"
            aria-label="Ciudad"
            maxLength={80}
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-[#2563a8] px-5 py-2.5 font-semibold text-white active:scale-[0.99]"
          >
            Filtrar
          </button>
        </form>

        {/* Results */}
        <div className="mt-6">
          {requests.length === 0 ? (
            <div className="rounded-2xl border border-[#e6ecf2] bg-white p-6 text-center text-[#5b6b7b]">
              <p className="font-semibold text-[#14212e]">
                No hay solicitudes activas que coincidan.
              </p>
              <Link
                href="/necesito-ayuda"
                className="mt-4 inline-block rounded-xl bg-[#2563a8] px-5 py-3 font-semibold text-white"
              >
                Pedir ayuda
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {requests.map((r) => {
                const c = HELP_CATEGORIES[r.category];
                const urgency = URGENCY_LEVELS[r.urgency];
                const distance =
                  r.distanceKm != null
                    ? r.distanceKm < 1
                      ? `${Math.round(r.distanceKm * 1000)} m`
                      : `${r.distanceKm.toFixed(1)} km`
                    : null;
                return (
                  <Link
                    key={r.id}
                    href={`/solicitud/${r.id}`}
                    className="block rounded-2xl border border-[#e6ecf2] bg-white p-4 transition hover:border-[#c9d6e3]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-[#14212e]">
                        {r.place_name || c?.label}
                      </h2>
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
                      {c && (
                        <span className="rounded-full bg-[#eef3fa] px-2.5 py-1 font-medium text-[#2563a8]">
                          {c.emoji} {c.label}
                        </span>
                      )}
                      {r.city && <span>📍 {r.city}</span>}
                      {distance && <span>a {distance}</span>}
                    </div>

                    {r.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-[#5b6b7b]">
                        {r.description}
                      </p>
                    )}

                    {r.items?.length ? (
                      <p className="mt-2 text-sm text-[#5b6b7b]">
                        {formatItems(r.items)}
                      </p>
                    ) : null}

                    {r.source && (
                      <p className="mt-2">
                        <SourceBadge source={r.source} url={r.source_url} />
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
