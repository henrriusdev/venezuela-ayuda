import Link from "next/link";
import { useTranslations } from "next-intl";
import ShareButtons from "@/components/ShareButtons";
import { RISK_LEVELS, type RiskLevel } from "@/lib/constants";

// Renders the community risk-questionnaire outcome on the building detail page.
// A guidance message, never a safety guarantee — see RISK_DISCLAIMER.
export default function RiskResult({
  level,
  priority,
  shareUrl,
  shareText,
}: {
  level: RiskLevel;
  priority: boolean | null;
  shareUrl: string;
  shareText: string;
}) {
  const r = RISK_LEVELS[level];
  const ctas = r.ctas as readonly string[];
  const t = useTranslations("risk");

  return (
    <div className="mt-4">
      <section
        className="rounded-2xl p-5"
        style={{ backgroundColor: r.tintBg, border: `2px solid ${r.color}` }}
      >
        <p className="text-xl font-extrabold" style={{ color: r.color }}>
          {t(`levels.${level}.title`)}
          {priority && level === "AMARILLO" && (
            <span className="font-bold"> · {t("levels.AMARILLO.priority")}</span>
          )}
        </p>

        <p className="mt-2 font-bold text-slate-900">{t(`levels.${level}.heading`)}</p>
        <p className="mt-2 text-slate-800">{t(`levels.${level}.body`)}</p>

        <p className="mt-4 text-xs text-slate-500">{t("disclaimer")}</p>
      </section>

      <div className="mt-3 flex flex-wrap gap-2">
        {ctas.includes("ayuda") && (
          <Link
            href="/necesito-ayuda"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-bold text-white active:scale-[0.99]"
            style={{ backgroundColor: "#e2603a" }}
          >
            <span aria-hidden>🆘</span> {t("needHelp")}
          </Link>
        )}
        {ctas.includes("mapa") && (
          <Link
            href="/mapa"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-3 font-bold text-slate-800 active:scale-[0.99]"
          >
            <span aria-hidden>🗺️</span> {t("viewMap")}
          </Link>
        )}
        {ctas.includes("share") && (
          <ShareButtons text={shareText} url={shareUrl} compact />
        )}
      </div>
    </div>
  );
}
