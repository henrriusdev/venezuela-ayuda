// Compact third-party announcement (Yummy). We are NOT affiliated — we just
// surface the info and link to the original source.
import { getTranslations } from "next-intl/server";

const TWEET_URL = "https://x.com/metavarce/status/2069928794526249026?s=20";

export default async function SupportMeasures() {
  const t = await getTranslations("measures");
  return (
    <section
      aria-labelledby="apoyo-title"
      className="rounded-xl border border-[#cde6da] bg-[#eef9f2] p-4 text-sm"
    >
      <h2 id="apoyo-title" className="font-semibold text-[#14212e]">
        {t("yummyTitle")}
      </h2>
      <p className="mt-1 leading-relaxed text-[#33414f]">{t("yummyBody")}</p>
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
    </section>
  );
}
