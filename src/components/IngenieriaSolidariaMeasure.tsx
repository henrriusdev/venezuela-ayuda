// Third-party support initiative (RedesAyuda · Ingeniería Solidaria). We surface
// the info and link to their directory; not affiliated.
import { getTranslations } from "next-intl/server";

export default async function IngenieriaSolidariaMeasure() {
  const t = await getTranslations("measures");
  return (
    <section
      aria-labelledby="ingsolidaria-title"
      className="rounded-xl border border-[#e6ddc6] bg-[#fbf6ea] p-4 text-sm"
    >
      <h2 id="ingsolidaria-title" className="font-semibold text-[#14212e]">
        {t("ingTitle")}
      </h2>
      <p className="mt-1 leading-relaxed text-[#33414f]">{t("ingBody")}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <a
          href="https://redesayuda.org/ingenieriasolidaria/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#2563a8] hover:underline"
        >
          {t("ingDirectory")}
        </a>
        <span className="text-[#8190a0]">{t("ingNote")}</span>
      </div>
    </section>
  );
}
