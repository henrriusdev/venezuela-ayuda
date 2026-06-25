"use client";

import { useActionState, useState } from "react";
import { submitHelpRequest, type ActionState } from "@/app/actions";
import { HELP_CATEGORIES, URGENCY_LEVELS, LIMITS } from "@/lib/constants";
import { Label, TextInput, TextArea, FieldError, Honeypot } from "@/components/Field";
import LocationPicker from "@/components/LocationPicker";
import SubmitButton from "@/components/SubmitButton";
import SuccessCard from "@/components/SuccessCard";

const initial: ActionState = { ok: false };

export default function HelpRequestForm() {
  const [state, action] = useActionState(submitHelpRequest, initial);

  // Controlled fields so the AI can pre-fill them.
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  async function analyze() {
    const text = aiText.trim();
    if (text.length < 8) {
      setAiNote("Escribe un poco más para analizar.");
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
      setAiNote("Revisé tu mensaje y rellené el formulario. Verifica los datos.");
    } catch {
      setAiNote("No se pudo analizar automáticamente. Completa el formulario manualmente.");
    } finally {
      setAiBusy(false);
    }
  }

  if (state.ok) {
    return (
      <SuccessCard
        title="Solicitud enviada"
        message="Tu solicitud ya aparece en el mapa de ayuda. Compártela para que más personas la vean."
        shareText="🆘 Hay una solicitud de ayuda en Venezuela Ayuda. Mira el mapa:"
        sharePath="/mapa"
        primaryHref="/mapa"
        primaryLabel="Ver en el mapa"
      />
    );
  }

  return (
    <form action={action} className="space-y-5">
      <Honeypot />

      {/* AI assist */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <Label htmlFor="aiText">
          <span aria-hidden>✨</span> Describe la emergencia con tus palabras
        </Label>
        <TextArea
          id="aiText"
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          maxLength={LIMITS.description}
          placeholder="Ej: Mi abuela está atrapada en un edificio en Barquisimeto y necesita oxígeno."
        />
        <button
          type="button"
          onClick={analyze}
          disabled={aiBusy}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {aiBusy ? "Analizando…" : "Analizar y rellenar"}
        </button>
        {aiNote && <p className="mt-2 text-sm text-slate-700">{aiNote}</p>}
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 font-medium text-red-700" role="alert">
          {state.error}
        </p>
      )}

      <fieldset>
        <legend className="mb-2 block font-semibold text-slate-800">
          ¿Qué necesitas? <span className="text-red-600">*</span>
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
                {HELP_CATEGORIES[k].label}
              </label>
            );
          })}
        </div>
        <FieldError message={state.fieldErrors?.category} />
      </fieldset>

      <div>
        <Label htmlFor="description" required>
          Descripción
        </Label>
        <TextArea
          id="description"
          name="description"
          required
          maxLength={LIMITS.description}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="¿Qué necesitas? ¿Cuántas personas?"
        />
        <FieldError message={state.fieldErrors?.description} />
      </div>

      <fieldset>
        <legend className="mb-2 block font-semibold text-slate-800">Urgencia</legend>
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
                {u.label}
              </label>
            );
          })}
        </div>
        <FieldError message={state.fieldErrors?.urgency} />
      </fieldset>

      <div>
        <Label htmlFor="city">Ciudad</Label>
        <TextInput
          id="city"
          name="city"
          maxLength={LIMITS.city}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ej: Barquisimeto"
        />
      </div>

      <div>
        <Label htmlFor="contact" hint="(privado, opcional)">
          Contacto / WhatsApp
        </Label>
        <TextInput
          id="contact"
          name="contact"
          type="tel"
          inputMode="tel"
          maxLength={LIMITS.phone}
          placeholder="Para que los rescatistas te ubiquen"
        />
        <p className="mt-1 text-sm text-slate-500">🔒 No se muestra públicamente.</p>
      </div>

      <div>
        <Label htmlFor="location">Ubicación</Label>
        <LocationPicker />
      </div>

      <SubmitButton tone="emergency" pendingLabel="Enviando…">
        Publicar solicitud
      </SubmitButton>
    </form>
  );
}
