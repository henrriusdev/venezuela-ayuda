// Compact third-party announcement (Yummy). We are NOT affiliated — we just
// surface the info and link to the original source.
import { getTranslations } from "next-intl/server";
import MeasureCard from "@/components/MeasureCard";

const TWEET_URL = "https://x.com/metavarce/status/2069928794526249026?s=20";

export default async function SupportMeasures() {
  const t = await getTranslations("measures");
  const items = t.raw("yummyItems") as string[];
  return (
    <MeasureCard
      title={t("yummyTitle")}
      className="border-[#cde6da] bg-[#eef9f2]"
      defaultOpen
    >
      <p className="leading-relaxed text-[#33414f]">{t("yummyBody")}</p>
      <ul className="mt-2 space-y-1.5 leading-relaxed text-[#33414f]">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="text-[#1f7a52]">
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <a
          href={TWEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#1f7a52] underline"
        >
          {t("yummyViewOriginal")}
        </a>
        <span className="text-[#8190a0]">{t("yummyNotAffiliated")}</span>
      </div>
    </MeasureCard>
  );
}
