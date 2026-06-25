"use client";

import { useActionState, useState } from "react";
import { submitDamagedReport, type ActionState } from "@/app/actions";
import { DAMAGE_SEVERITY, LIMITS } from "@/lib/constants";
import { Label, TextInput, TextArea, FieldError, Honeypot } from "@/components/Field";
import LocationPicker from "@/components/LocationPicker";
import PhotoInput from "@/components/PhotoInput";
import SubmitButton from "@/components/SubmitButton";

const initial: ActionState = { ok: false };

export default function DamagedReportForm() {
  const [state, action] = useActionState(submitDamagedReport, initial);
  const [severity, setSeverity] = useState("");

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
          Nombre del edificio o lugar
        </Label>
        <TextInput
          id="place_name"
          name="place_name"
          maxLength={LIMITS.place_name}
          placeholder="Ej: Residencias El Parque"
        />
        <FieldError message={state.fieldErrors?.place_name} />
      </div>

      <fieldset>
        <legend className="mb-2 block font-semibold text-slate-800">
          Gravedad del daño <span className="text-red-600">*</span>
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
                {s.label}
              </label>
            );
          })}
        </div>
        <FieldError message={state.fieldErrors?.severity} />
      </fieldset>

      <div>
        <Label htmlFor="description" hint="(opcional)">
          Describe el daño
        </Label>
        <TextArea
          id="description"
          name="description"
          maxLength={LIMITS.description}
          placeholder="Ej: Grietas grandes en columnas del 3er piso"
        />
      </div>

      <div>
        <Label htmlFor="city">Ciudad</Label>
        <TextInput id="city" name="city" maxLength={LIMITS.city} />
      </div>

      <div>
        <Label htmlFor="contact" hint="(opcional)">
          Tu contacto (privado)
        </Label>
        <TextInput
          id="contact"
          name="contact"
          type="tel"
          inputMode="tel"
          maxLength={LIMITS.phone}
        />
        <p className="mt-1 text-sm text-slate-500">🔒 No se muestra públicamente.</p>
      </div>

      <PhotoInput label="Foto del daño (opcional)" />

      <div>
        <Label htmlFor="location" required>
          Ubicación
        </Label>
        <LocationPicker required />
        <FieldError message={state.fieldErrors?.location} />
      </div>

      <SubmitButton tone="emergency" pendingLabel="Enviando…">
        Publicar reporte
      </SubmitButton>
    </form>
  );
}
