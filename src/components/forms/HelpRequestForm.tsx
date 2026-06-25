"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { submitHelpRequest, type ActionState } from "@/app/actions";
import { HELP_CATEGORIES, URGENCY_LEVELS, LIMITS, COMMON_TOOLS } from "@/lib/constants";
import type { NeededItem } from "@/lib/types";
import { Label, TextInput, TextArea, FieldError, Honeypot } from "@/components/Field";
import LocationPicker from "@/components/LocationPicker";
import SubmitButton from "@/components/SubmitButton";
import SuccessCard from "@/components/SuccessCard";

const initial: ActionState = { ok: false };

export default function HelpRequestForm() {
  const [state, action] = useActionState(submitHelpRequest, initial);
  const t = useTranslations("forms.request");
  const tForms = useTranslations("forms");
  const tCommon = useTranslations("common");
  const tD = useTranslations("domain");

  // Controlled fields so the AI can pre-fill them.
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [items, setItems] = useState<NeededItem[]>([]);
  const [customTool, setCustomTool] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  async function analyze() {
    const text = aiText.trim();
    if (text.length < 8) {
      setAiNote(t("aiTooShort"));
      return;
    }
    setAiBusy(true);
    setAiNote(null);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.category in HELP_CATEGORIES) setCategory(data.category);
      if (data.urgency in URGENCY_LEVELS) setUrgency(data.urgency);
      if (data.location) setCity(String(data.location).slice(0, LIMITS.city));
      if (!description) setDescription(text.slice(0, LIMITS.description));
      setAiNote(t("aiDone"));
    } catch {
      setAiNote(t("aiFailed"));
    } finally {
      setAiBusy(false);
    }
  }

  const hasItem = (name: string) => items.some((i) => i.name === name);

  function toggleTool(name: string) {
    setItems((prev) =>
      prev.some((i) => i.name === name)
        ? prev.filter((i) => i.name !== name)
        : prev.length >= LIMITS.maxItems
        ? prev
        : [...prev, { name, qty: 1 }]
    );
  }

  function setQty(name: string, delta: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.name === name
          ? { ...i, qty: Math.min(LIMITS.maxQty, Math.max(1, i.qty + delta)) }
          : i
      )
    );
  }

  function removeItem(name: string) {
    setItems((prev) => prev.filter((i) => i.name !== name));
  }

  function addCustomTool() {
    const name = customTool.trim().slice(0, LIMITS.itemName);
    if (!name || hasItem(name) || items.length >= LIMITS.maxItems) return;
    setItems((prev) => [...prev, { name, qty: 1 }]);
    setCustomTool("");
  }

  const toolsEmphasized = category === "tools" || category === "rescue";

  if (state.ok) {
    return (
      <SuccessCard
        title={t("successTitle")}
        message={t("successMessage")}
        shareText={t("successShare")}
        sharePath="/mapa"
        primaryHref="/mapa"
        primaryLabel={t("viewMap")}
      />
    );
  }

  return (
    <form action={action} className="space-y-5">
      <Honeypot />

      {/* AI assist */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <Label htmlFor="aiText">
          <span aria-hidden>✨</span> {t("aiLabel")}
        </Label>
        <TextArea
          id="aiText"
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          maxLength={LIMITS.description}
          placeholder={t("aiPlaceholder")}
        />
        <button
          type="button"
          onClick={analyze}
          disabled={aiBusy}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {aiBusy ? t("aiAnalyzing") : t("aiAnalyze")}
        </button>
        {aiNote && <p className="mt-2 text-sm text-slate-700">{aiNote}</p>}
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 font-medium text-red-700" role="alert">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="place_name">{t("placeLabel")}</Label>
        <TextInput
          id="place_name"
          name="place_name"
          maxLength={LIMITS.place_name}
          placeholder={t("placePlaceholder")}
        />
      </div>

      <fieldset>
        <legend className="mb-2 block font-semibold text-slate-800">
          {t("categoryLegend")} <span className="text-red-600">*</span>
        </legend>
        <div className="grid grid-cols-3 gap-2.5">
          {(Object.keys(HELP_CATEGORIES) as Array<keyof typeof HELP_CATEGORIES>).map((k) => {
            const on = category === k;
            return (
              <label
                key={k}
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-[15px] border bg-white px-2 py-4 text-center text-sm font-semibold"
                style={
                  on
                    ? { borderColor: "#e2603a", backgroundColor: "#fdf0e9", color: "#c0512c", borderWidth: 2 }
                    : { borderColor: "#e6ecf2" }
                }
              >
                <input
                  type="radio"
                  name="category"
                  value={k}
                  checked={on}
                  onChange={() => setCategory(k)}
                  className="sr-only"
                />
                <span aria-hidden className="text-2xl">{HELP_CATEGORIES[k].emoji}</span>
                {tD("category." + k)}
              </label>
            );
          })}
        </div>
        <FieldError message={state.fieldErrors?.category} />
      </fieldset>

      <div>
        <Label htmlFor="description" required>
          {tCommon("description")}
        </Label>
        <TextArea
          id="description"
          name="description"
          required
          maxLength={LIMITS.description}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
        />
        <FieldError message={state.fieldErrors?.description} />
      </div>

      <fieldset>
        <legend className="mb-2 block font-semibold text-slate-800">{t("urgencyLegend")}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(URGENCY_LEVELS) as Array<keyof typeof URGENCY_LEVELS>).map((k) => {
            const u = URGENCY_LEVELS[k];
            const on = urgency === k;
            return (
              <label
                key={k}
                className="flex cursor-pointer items-center justify-center rounded-xl border bg-white px-3 py-3 font-semibold"
                style={
                  on
                    ? { backgroundColor: u.tintBg, color: u.color, borderColor: u.color, borderWidth: 2 }
                    : { borderColor: "#e6ecf2", color: "#33414f" }
                }
              >
                <input
                  type="radio"
                  name="urgency"
                  value={k}
                  checked={on}
                  onChange={() => setUrgency(k)}
                  className="sr-only"
                />
                {tD("urgency." + k)}
              </label>
            );
          })}
        </div>
        <FieldError message={state.fieldErrors?.urgency} />
      </fieldset>

      {/* Tools / equipment picker */}
      <fieldset
        className="rounded-[15px] border p-4"
        style={
          toolsEmphasized
            ? { borderColor: "#2563a8", backgroundColor: "#f0f5fb", borderWidth: 2 }
            : { borderColor: "#e6ecf2" }
        }
      >
        <legend className="px-1 font-semibold text-slate-800">
          {t("toolsLegend")}
          <span className="ml-2 font-normal text-slate-500">{tCommon("optional")}</span>
        </legend>

        <div className="flex flex-wrap gap-2">
          {COMMON_TOOLS.map((t) => {
            const on = hasItem(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTool(t)}
                className="rounded-full border px-3 py-1.5 text-sm font-semibold active:scale-[0.99]"
                style={
                  on
                    ? { borderColor: "#2563a8", backgroundColor: "#2563a8", color: "#fff" }
                    : { borderColor: "#e6ecf2", backgroundColor: "#fff", color: "#33414f" }
                }
              >
                {on ? "✓ " : "+ "}
                {t}
              </button>
            );
          })}
        </div>

        {items.length > 0 && (
          <ul className="mt-3 space-y-2">
            {items.map((it) => (
              <li
                key={it.name}
                className="flex items-center gap-2 rounded-[12px] border border-[#e6ecf2] bg-white px-3 py-2"
              >
                <span className="flex-1 truncate font-medium text-slate-800">{it.name}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQty(it.name, -1)}
                    aria-label={t("subtract", { name: it.name })}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6ecf2] text-lg font-bold text-slate-700 active:scale-95"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold tabular-nums text-slate-800">
                    {it.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(it.name, 1)}
                    aria-label={t("addItem", { name: it.name })}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6ecf2] text-lg font-bold text-slate-700 active:scale-95"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(it.name)}
                  aria-label={t("remove", { name: it.name })}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-slate-400 hover:text-red-600"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex gap-2">
          <TextInput
            value={customTool}
            onChange={(e) => setCustomTool(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomTool();
              }
            }}
            maxLength={LIMITS.itemName}
            placeholder={t("toolsOtherPlaceholder")}
          />
          <button
            type="button"
            onClick={addCustomTool}
            disabled={items.length >= LIMITS.maxItems}
            className="shrink-0 rounded-xl bg-[#2563a8] px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {t("add")}
          </button>
        </div>

        <input type="hidden" name="items" value={JSON.stringify(items)} />
      </fieldset>

      <div>
        <Label htmlFor="city">{tCommon("city")}</Label>
        <TextInput
          id="city"
          name="city"
          maxLength={LIMITS.city}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={t("cityPlaceholder")}
        />
      </div>

      <div>
        <Label htmlFor="contact" hint={tForms("privateOptional")}>
          {t("contactLabel")}
        </Label>
        <TextInput
          id="contact"
          name="contact"
          type="tel"
          inputMode="tel"
          maxLength={LIMITS.phone}
          placeholder={t("contactPlaceholder")}
        />
        <p className="mt-1 text-sm text-slate-500">{tForms("notShownPublicly")}</p>
      </div>

      <div>
        <Label htmlFor="location" required>
          {tForms("locationLabel")}
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
