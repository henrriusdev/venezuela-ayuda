"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// "How to turn on earthquake alerts" card with iPhone / Android tabs.
export default function SeismicAlerts() {
  const t = useTranslations("alerts");
  const [tab, setTab] = useState<"android" | "ios">("android");

  const steps = t.raw(tab === "ios" ? "iosSteps" : "androidSteps") as string[];
  const note = t(tab === "ios" ? "iosNote" : "androidNote");

  return (
    <section className="rounded-xl border border-[#e6ecf2] bg-white p-4 text-sm">
      <p className="text-[#5b6b7b]">{t("intro")}</p>

      <div
        className="mt-3 inline-flex rounded-full border border-[#e6ecf2] p-0.5 text-xs font-bold"
        role="tablist"
      >
        {(["android", "ios"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`cursor-pointer rounded-full px-3 py-1.5 transition ${
              tab === k ? "bg-[#2563a8] text-white" : "text-[#5b6b7b]"
            }`}
          >
            {k === "android" ? `🤖 ${t("android")}` : `🍎 ${t("ios")}`}
          </button>
        ))}
      </div>

      <ol className="mt-3 list-decimal space-y-1.5 pl-5 leading-relaxed text-[#33414f]">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>

      <p className="mt-3 rounded-lg bg-[#f5f8fb] p-2.5 text-xs leading-relaxed text-[#5b6b7b]">
        ℹ️ {note}
      </p>
      <p className="mt-2 text-xs text-[#8190a0]">{t("disclaimer")}</p>
    </section>
  );
}
