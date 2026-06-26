// Third-party support initiative (SismoAyuda VE). Free online platform to assess
// home safety after the earthquake. We surface the info and link out; not affiliated.
import { getTranslations } from "next-intl/server";
import MeasureCard from "@/components/MeasureCard";

export default async function SismoAyudaMeasure() {
  const t = await getTranslations("measures");
  return (
    <MeasureCard title={t("sismoTitle")} className="border-[#e6ddc6] bg-[#fbf6ea]">
      <p className="leading-relaxed text-[#33414f]">{t("sismoBody")}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <a
          href="https://www.sismoayudave.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#2563a8] hover:underline"
        >
          {t("sismoLink")}
        </a>
        <a
          href="https://www.sismoayudave.com/inspector/registro"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#2563a8] hover:underline"
        >
          {t("sismoInspector")}
        </a>
      </div>
      <p className="mt-2 text-xs text-[#8190a0]">{t("sismoNote")}</p>
    </MeasureCard>
  );
}
