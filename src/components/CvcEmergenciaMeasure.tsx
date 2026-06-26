// Third-party initiative (Cámara Venezolana de la Construcción + Cámara Petrolera
// de Venezuela). National operation to inventory and mobilize heavy machinery and
// technical volunteers. We surface the info and link to their registry; not affiliated.
import { getTranslations } from "next-intl/server";
import MeasureCard from "@/components/MeasureCard";

export default async function CvcEmergenciaMeasure() {
  const t = await getTranslations("measures");
  return (
    <MeasureCard title={t("cvcTitle")} className="border-[#e6cdcd] bg-[#fbeeee]">
      <p className="leading-relaxed text-[#33414f]">{t("cvcBody")}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <a
          href="https://cvcemergencia2026.netlify.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#2563a8] hover:underline"
        >
          {t("cvcRegister")}
        </a>
        <span className="text-[#8190a0]">{t("cvcNote")}</span>
      </div>
    </MeasureCard>
  );
}
