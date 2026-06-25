"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { submitDamagedReport, type ActionState } from "@/app/actions";
import {
  DAMAGE_SEVERITY,
  LIMITS,
  RISK_ANSWERS,
  RISK_QUESTIONS_SEVERE,
  RISK_QUESTIONS_MINOR,
  type RiskAnswer,
} from "@/lib/constants";
import { Label, TextInput, TextArea, FieldError, Honeypot } from "@/components/Field";
import LocationPicker from "@/components/LocationPicker";
import PhotoInput from "@/components/PhotoInput";
import SubmitButton from "@/components/SubmitButton";

const initial: ActionState = { ok: false };

export default function DamagedReportForm() {
  const [state, action] = useActionState(submitDamagedReport, initial);
  const [severity, setSeverity] = useState("");
  const [riskOpen, setRiskOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, RiskAnswer>>({});
  const t = useTranslations("forms.damaged");
  const tForms = useTranslations("forms");
  const tCommon = useTranslations("common");
  const tD = useTranslations("domain");
  const tRisk = useTranslations("risk");

  return (
    <form action={action} className="space-y-5">
      <Honeypot />

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 font-medium text-red-700" role="alert">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="place_name" required>
          {t("placeLabel")}
        </Label>
        <TextInput
          id="place_name"
          name="place_name"
          maxLength={LIMITS.place_name}
          placeholder={t("placePlaceholder")}
        />
        <FieldError message={state.fieldErrors?.place_name} />
      </div>

      <fieldset>
        <legend className="mb-2 block font-semibold text-slate-800">
          {t("severityLegend")} <span className="text-red-600">*</span>
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(DAMAGE_SEVERITY) as Array<keyof typeof DAMAGE_SEVERITY>).map((k) => {
            const s = DAMAGE_SEVERITY[k];
            const on = severity === k;
            return (
              <label
                key={k}
                className="flex cursor-pointer items-center justify-center rounded-xl border bg-white px-3 py-3 text-center font-semibold"
                style={
                  on
                    ? { backgroundColor: s.tintBg, color: s.color, borderColor: s.color, borderWidth: 2 }
                    : { borderColor: "#e6ecf2", color: "#33414f" }
                }
              >
                <input
                  type="radio"
                  name="severity"
                  value={k}
                  checked={on}
                  onChange={() => setSeverity(k)}
                  className="sr-only"
                />
                {tD("severity." + k)}
              </label>
            );
          })}
        </div>
        <FieldError message={state.fieldErrors?.severity} />
      </fieldset>

      {/* Optional structural-risk questionnaire ----------------------------- */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <input type="hidden" name="risk_enabled" value={riskOpen ? "1" : "0"} />
        <div className="flex items-center justify-between gap-3">
          <span id="risk-toggle-label" className="font-semibold text-slate-800">
            {tRisk("toggle")}{" "}
            <span className="font-normal text-slate-500">{tCommon("optional")}</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={riskOpen}
            aria-labelledby="risk-toggle-label"
            onClick={() => setRiskOpen((v) => !v)}
            className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors"
            style={{ backgroundColor: riskOpen ? "#2563a8" : "#cbd5e1" }}
          >
            <span
              className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
              style={{ transform: riskOpen ? "translateX(22px)" : "translateX(4px)" }}
            />
          </button>
        </div>

        {riskOpen && (
          <div className="mt-4 space-y-6">
            <p className="text-sm text-slate-500">{tRisk("instructions")}</p>

            <RiskSection
              legend={tRisk("sectionSevere")}
              questions={RISK_QUESTIONS_SEVERE}
              answers={answers}
              onAnswer={(id, v) => setAnswers((a) => ({ ...a, [id]: v }))}
            />
            <RiskSection
              legend={tRisk("sectionMinor")}
              questions={RISK_QUESTIONS_MINOR}
              answers={answers}
              onAnswer={(id, v) => setAnswers((a) => ({ ...a, [id]: v }))}
            />

            <FieldError message={state.fieldErrors?.risk} />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="description" hint={tCommon("optional")}>
          {t("descriptionLabel")}
        </Label>
        <TextArea
          id="description"
          name="description"
          maxLength={LIMITS.description}
          placeholder={t("descriptionPlaceholder")}
        />
      </div>

      <div>
        <Label htmlFor="city">{tCommon("city")}</Label>
        <TextInput id="city" name="city" maxLength={LIMITS.city} />
      </div>

      <div>
        <Label htmlFor="contact" hint={tCommon("optional")}>
          {t("contactLabel")}
        </Label>
        <TextInput
          id="contact"
          name="contact"
          type="tel"
          inputMode="tel"
          maxLength={LIMITS.phone}
        />
        <p className="mt-1 text-sm text-slate-500">{tForms("notShownPublicly")}</p>
      </div>

      <PhotoInput label={t("photoLabel")} />

      <div>
        <Label htmlFor="location" required>
          {t("locationLabel")}
        </Label>
        <LocationPicker required />
        <FieldError message={state.fieldErrors?.location} />
      </div>

      <SubmitButton tone="emergency" pendingLabel={t("sending")}>
        {t("submit")}
      </SubmitButton>
    </form>
  );
}

function RiskSection({
  legend,
  questions,
  answers,
  onAnswer,
}: {
  legend: string;
  questions: ReadonlyArray<{ id: string; text: string }>;
  answers: Record<string, RiskAnswer>;
  onAnswer: (id: string, value: RiskAnswer) => void;
}) {
  const t = useTranslations("risk");
  return (
    <fieldset className="space-y-3">
      <legend className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500">
        {legend}
      </legend>
      {questions.map((q) => (
        <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="font-medium text-slate-800">{t("questions." + q.id)}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {RISK_ANSWERS.map((opt) => {
              const on = answers[q.id] === opt.value;
              return (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center justify-center rounded-lg border bg-white px-2 py-2 text-center text-sm font-semibold"
                  style={
                    on
                      ? { backgroundColor: "#eef3fa", color: "#2563a8", borderColor: "#2563a8", borderWidth: 2 }
                      : { borderColor: "#e6ecf2", color: "#33414f" }
                  }
                >
                  <input
                    type="radio"
                    name={`risk_${q.id}`}
                    value={opt.value}
                    checked={on}
                    onChange={() => onAnswer(q.id, opt.value)}
                    className="sr-only"
                  />
                  {t("answers." + opt.value)}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
