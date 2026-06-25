// Third-party support announcement (Digitel). We surface the info and note we
// are not affiliated.
import { getTranslations } from "next-intl/server";

export default async function DigitelMeasure() {
  const t = await getTranslations("measures");
  return (
    <section
      aria-labelledby="digitel-title"
      className="rounded-xl border border-[#cddbee] bg-[#eef3fa] p-4 text-sm"
    >
      <h2 id="digitel-title" className="font-semibold text-[#14212e]">
        {t("digitelTitle")}
      </h2>
      <p className="mt-1 leading-relaxed text-[#33414f]">{t("digitelBody")}</p>
      <p className="mt-2 text-xs text-[#8190a0]">{t("digitelNote")}</p>
    </section>
  );
}
