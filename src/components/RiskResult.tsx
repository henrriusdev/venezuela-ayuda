import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import { RISK_LEVELS, RISK_DISCLAIMER, type RiskLevel } from "@/lib/constants";

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

  return (
    <div className="mt-4">
      <section
        className="rounded-2xl p-5"
        style={{ backgroundColor: r.tintBg, border: `2px solid ${r.color}` }}
      >
        <p className="text-xl font-extrabold" style={{ color: r.color }}>
          {r.title}
          {priority && level === "AMARILLO" && (
            <span className="font-bold"> · Revisión prioritaria</span>
          )}
        </p>

        <p className="mt-2 font-bold text-slate-900">{r.heading}</p>
        <p className="mt-2 text-slate-800">{r.body}</p>

        <p className="mt-4 text-xs text-slate-500">{RISK_DISCLAIMER}</p>
      </section>

      <div className="mt-3 flex flex-wrap gap-2">
        {ctas.includes("ayuda") && (
          <Link
            href="/necesito-ayuda"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-bold text-white active:scale-[0.99]"
            style={{ backgroundColor: "#e2603a" }}
          >
            <span aria-hidden>🆘</span> Necesito ayuda
          </Link>
        )}
        {ctas.includes("mapa") && (
          <Link
            href="/mapa"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-3 font-bold text-slate-800 active:scale-[0.99]"
          >
            <span aria-hidden>🗺️</span> Ver en el mapa
          </Link>
        )}
        {ctas.includes("share") && (
          <ShareButtons text={shareText} url={shareUrl} compact />
        )}
      </div>
    </div>
  );
}
