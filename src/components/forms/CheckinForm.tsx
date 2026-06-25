"use client";

import { useActionState } from "react";
import { submitCheckin, type ActionState } from "@/app/actions";
import { CHECKIN_STATUSES, LIMITS } from "@/lib/constants";
import { Label, TextInput, TextArea, FieldError, Honeypot } from "@/components/Field";
import LocationPicker from "@/components/LocationPicker";
import SubmitButton from "@/components/SubmitButton";

const initial: ActionState = { ok: false };

export default function CheckinForm() {
  const [state, action] = useActionState(submitCheckin, initial);

  return (
    <form action={action} className="space-y-5">
      <Honeypot />

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 font-medium text-red-700" role="alert">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="name" required>
          Tu nombre
        </Label>
        <TextInput
          id="name"
          name="name"
          required
          maxLength={LIMITS.name}
          autoComplete="name"
          enterKeyHint="next"
          placeholder="Ej: Carlos Pérez"
        />
        <FieldError message={state.fieldErrors?.name} />
      </div>

      <fieldset>
        <legend className="mb-2 block font-semibold text-slate-800">
          ¿Cuál es tu situación? <span className="text-red-600">*</span>
        </legend>
        <div className="grid gap-2">
          {(Object.keys(CHECKIN_STATUSES) as Array<keyof typeof CHECKIN_STATUSES>).map(
            (key, i) => {
              const s = CHECKIN_STATUSES[key];
              return (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
                >
                  <input
                    type="radio"
                    name="status"
                    value={key}
                    defaultChecked={i === 0}
                    className="h-5 w-5"
                  />
                  <span aria-hidden className="text-xl">{s.emoji}</span>
                  <span style={{ color: s.color }}>{s.label}</span>
                </label>
              );
            }
          )}
        </div>
        <FieldError message={state.fieldErrors?.status} />
      </fieldset>

      <div>
        <Label htmlFor="city">Ciudad</Label>
        <TextInput
          id="city"
          name="city"
          maxLength={LIMITS.city}
          placeholder="Ej: Barquisimeto"
        />
      </div>

      <div>
        <Label htmlFor="message" hint="(opcional)">
          Mensaje
        </Label>
        <TextArea
          id="message"
          name="message"
          maxLength={LIMITS.message}
          placeholder="Ej: Estoy bien con mi familia."
        />
      </div>

      <div>
        <Label htmlFor="phone" hint="(privado, no se muestra)">
          Teléfono / WhatsApp
        </Label>
        <TextInput
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          maxLength={LIMITS.phone}
          autoComplete="tel"
          placeholder="Ej: 0414 1234567"
        />
        <p className="mt-1 text-sm text-slate-500">
          🔒 Nunca mostramos tu teléfono públicamente.
        </p>
      </div>

      <div>
        <Label htmlFor="location">Ubicación (opcional)</Label>
        <LocationPicker />
      </div>

      <SubmitButton pendingLabel="Guardando…">Marcarme</SubmitButton>
    </form>
  );
}
