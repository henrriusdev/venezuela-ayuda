// Third-party support announcement (Digitel). We surface the info and note we
// are not affiliated.
import { getTranslations } from "next-intl/server";
import MeasureCard from "@/components/MeasureCard";

export default async function DigitelMeasure() {
  const t = await getTranslations("measures");
  return (
    <MeasureCard title={t("digitelTitle")} className="border-[#cddbee] bg-[#eef3fa]">
      <p className="leading-relaxed text-[#33414f]">{t("digitelBody")}</p>
      <p className="mt-2 text-xs text-[#8190a0]">{t("digitelNote")}</p>
    </MeasureCard>
  );
}
