import Link from "next/link";
import Header from "@/components/Header";
import BigButton from "@/components/BigButton";
import DonateButton from "@/components/DonateButton";
import MapView from "@/components/MapView";
import EmergencyPhones from "@/components/EmergencyPhones";
import SupportMeasures from "@/components/SupportMeasures";
import DigitelMeasure from "@/components/DigitelMeasure";
import IngenieriaSolidariaMeasure from "@/components/IngenieriaSolidariaMeasure";
import { getStats, getMapMarkers } from "@/lib/data";
import { getTranslations, getLocale } from "next-intl/server";

export const revalidate = 60;

export default async function Home() {
  const [stats, markers] = await Promise.all([getStats(), getMapMarkers()]);
  const t = await getTranslations("home");
  const locale = await getLocale();
  const fmt = (n: number) => n.toLocaleString(locale === "en" ? "en-US" : "es-VE");

  return (
    <>
      <Header />
      <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-7">
        {/* Hero (full width, above the two columns) */}
        <section>
          <h1 className="text-[26px] font-extrabold uppercase leading-tight tracking-tight text-[#14212e] sm:text-[34px]">
            {t("heroTitle")}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[#5b6b7b] sm:text-lg">
            {t("heroSubtitle")}
          </p>
        </section>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Actions column */}
          <div>
        {/* Primary actions */}
        <section className="grid gap-3" aria-label="Acciones principales">
          <DonateButton />
          <BigButton
            href="/buscar"
            emoji="🔎"
            label={t("actions.searchLabel")}
            sublabel={t("actions.searchSub")}
            tileBg="#eef3fa"
          />
          <BigButton
            href="/necesito-ayuda"
            emoji="🆘"
            label={t("actions.needHelpLabel")}
            sublabel={t("actions.needHelpSub")}
            tileBg="#fdf0e9"
            accent
          />
          <BigButton
            href="/reportar-edificio"
            emoji="🏚️"
            label={t("actions.reportBuildingLabel")}
            sublabel={t("actions.reportBuildingSub")}
            tileBg="#f6dada"
          />
          <BigButton
            href="/a-salvo"
            emoji="✅"
            label={t("actions.safeLabel")}
            sublabel={t("actions.safeSub")}
            tileBg="#eaf3ec"
          />
          <BigButton
            href="/puedo-ayudar"
            emoji="🤝"
            label={t("actions.canHelpLabel")}
            sublabel={t("actions.canHelpSub")}
            tileBg="#e9f6ef"
          />
          <BigButton
            href="/ayudar-fuera"
            emoji="🌍"
            label={t("actions.helpOutsideLabel")}
            sublabel={t("actions.helpOutsideSub")}
            tileBg="#eef3fa"
          />
          <BigButton
            href="/mapa"
            emoji="🗺️"
            label={t("actions.viewMapLabel")}
            sublabel={t("actions.viewMapSub")}
            tileBg="#eef3fa"
          />
        </section>

        {/* Live stats */}
        <section className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3" aria-label="Estadísticas">
          <Stat emoji="✅" value={fmt(stats.safe)} label={t("stats.safe")} color="#2f9e6e" />
          <Stat emoji="🔎" value={fmt(stats.missing)} label={t("stats.missing")} color="#b5811f" />
          <Stat emoji="💚" value={fmt(stats.found)} label={t("stats.found")} color="#1f7a52" />
          <Stat emoji="🆘" value={fmt(stats.requests)} label={t("stats.requests")} color="#e2603a" />
          <Stat emoji="🤝" value={fmt(stats.helpers)} label={t("stats.helpers")} color="#2563a8" />
          <Stat emoji="🏚️" value={fmt(stats.damaged)} label={t("stats.damaged")} color="#7f1d1d" />
        </section>

        <div className="mt-5">
          <EmergencyPhones />
        </div>
          </div>

          {/* Map column */}
          <div className="md:sticky md:top-6 md:self-start">
            <div className="overflow-hidden rounded-2xl border border-[#e6ecf2] bg-white">
              <div className="flex items-center justify-between gap-2 border-b border-[#e6ecf2] px-4 py-3">
                <span className="text-sm font-semibold text-[#14212e]">🗺️ {t("mapTitle")}</span>
                <Link href="/mapa" className="text-sm font-semibold text-[#2563a8]">
                  {t("mapViewFull")}
                </Link>
              </div>
              <MapView
                markers={markers}
                heightClass="h-[55vh] min-h-[380px] md:h-[calc(100dvh-260px)] md:max-h-[640px]"
                initialZoom={5}
              />
            </div>
          </div>
        </div>

        {/* Support measures from operators/companies */}
        <section className="mt-8" aria-label={t("measuresTitle")}>
          <h2 className="mb-3 text-lg font-bold text-[#14212e]">{t("measuresTitle")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <SupportMeasures />
            <DigitelMeasure />
            <IngenieriaSolidariaMeasure />
          </div>
        </section>
      </main>

      <section
        aria-label="Fuentes de información"
        className="mx-auto w-full max-w-5xl px-4 pt-2"
      >
        <div className="rounded-2xl border border-[#e6ecf2] bg-white p-4 text-center text-xs leading-relaxed text-[#8190a0]">
          <span className="font-semibold text-[#5b6b7b]">{t("sourcesLabel")}</span>{" "}
          {[
            ["https://terremotovenezuela2026.vercel.app", "terremotovenezuela2026"],
            ["https://desaparecidosterremotovenezuela.com", "desaparecidosterremotovenezuela.com"],
            ["https://terremotovenezuela.com", "terremotovenezuela.com"],
            ["https://venezuelatebusca.com", "venezuelatebusca.com"],
            ["https://terremotovenezuela.app", "terremotovenezuela.app"],
            ["https://terremotove.netlify.app", "terremotove"],
          ].map(([url, name], i, arr) => (
            <span key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563a8] hover:underline"
              >
                {name}
              </a>
              {i < arr.length - 1 ? " · " : ""}
            </span>
          ))}
        </div>
      </section>

      <footer className="mx-auto w-full max-w-5xl px-4 py-8 text-center text-sm text-[#8190a0]">
        <div className="grid gap-4 text-left md:grid-cols-2">
          <div className="rounded-2xl border border-[#e6ecf2] bg-white p-5 text-[#5b6b7b]">
            <p className="font-semibold text-[#14212e]">{t("footer.noAccountTitle")}</p>
            <p className="mt-1">{t("footer.noAccountBody")}</p>
          </div>

          <div className="rounded-2xl border border-[#e6ecf2] bg-white p-5 text-[#5b6b7b]">
            <p className="font-semibold text-[#14212e]">{t("footer.contributeTitle")}</p>
            <p className="mt-1">
              {t.rich("footer.contributeBody", {
                email: (chunks) => (
                  <a href="mailto:hola@maw.dev" className="font-semibold text-[#2563a8] underline">
                    {chunks}
                  </a>
                ),
              })}
            </p>
            <p className="mt-3 font-medium text-[#14212e]">{t("footer.madeWith")}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <a
            href="https://coalicionporvenezuela.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/coalicion-por-venezuela.webp"
              alt="Coalición por Venezuela"
              className="h-11 w-auto"
            />
          </a>
          <p>{t("footer.tagline")}</p>
        </div>
      </footer>
    </>
  );
}

function Stat({
  value,
  label,
  color,
  emoji,
}: {
  value: string;
  label: string;
  color: string;
  emoji: string;
}) {
  return (
    <div className="rounded-[14px] border border-[#e6ecf2] bg-white px-2.5 py-3 text-center">
      <div aria-hidden className="text-base leading-none">
        {emoji}
      </div>
      <div className="mt-1 text-2xl font-bold leading-none" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-[11px] font-medium leading-tight text-[#5b6b7b]">{label}</div>
    </div>
  );
}
