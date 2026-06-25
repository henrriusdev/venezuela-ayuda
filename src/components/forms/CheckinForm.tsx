"use client";

import { useActionState, useState } from "react";
import { submitCheckin, type ActionState } from "@/app/actions";
import { CHECKIN_STATUSES, LIMITS, type CheckinStatus } from "@/lib/constants";
import { Label, TextInput, TextArea, FieldError, Honeypot } from "@/components/Field";
import LocationPicker from "@/components/LocationPicker";
import PhotoInput from "@/components/PhotoInput";
import SubmitButton from "@/components/SubmitButton";

const initial: ActionState = { ok: false };

export default function CheckinForm({
  initialStatus,
}: {
  initialStatus?: CheckinStatus;
}) {
  const [state, action] = useActionState(submitCheckin, initial);
  const [status, setStatus] = useState<CheckinStatus>(initialStatus ?? "SAFE");
  const isMissing = status === "LOOKING_FOR_SOMEONE";

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
          {isMissing ? "Nombre de la persona desaparecida" : "Tu nombre"}
        </Label>
        <TextInput
          id="name"
          name="name"
          required
          maxLength={LIMITS.name}
          autoComplete="name"
          enterKeyHint="next"
          placeholder={isMissing ? "Ej: María Rodríguez" : "Ej: Carlos Pérez"}
        />
        <FieldError message={state.fieldErrors?.name} />
      </div>

      <fieldset>
        <legend className="mb-2 block font-semibold text-slate-800">
          ¿Cuál es tu situación? <span className="text-red-600">*</span>
        </legend>
        <div className="grid gap-2">
          {(Object.keys(CHECKIN_STATUSES) as Array<keyof typeof CHECKIN_STATUSES>).map(
            (key) => {
              const s = CHECKIN_STATUSES[key];
              return (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold has-[:checked]:border-[#2563a8] has-[:checked]:bg-[#eef3fa]"
                >
                  <input
                    type="radio"
                    name="status"
                    value={key}
                    checked={status === key}
                    onChange={() => setStatus(key)}
                    className="h-5 w-5 accent-[#2563a8]"
                  />
                  <span aria-hidden className="text-xl">{s.emoji}</span>
                  <span style={{ color: s.tintText }}>{s.label}</span>
                </label>
              );
            }
          )}
        </div>
        <FieldError message={state.fieldErrors?.status} />
      </fieldset>

      <div>
        <Label htmlFor="place_name">
          Edificio o lugar <span className="font-normal text-slate-500">(opcional)</span>
        </Label>
        <TextInput
          id="place_name"
          name="place_name"
          maxLength={LIMITS.place_name}
          placeholder={
            isMissing ? "Ej: Edificio donde se le vio" : "Ej: Residencias El Parque"
          }
        />
      </div>

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
          placeholder={
            isMissing
              ? "Detalles: edad, contextura, ropa, dónde se le vio por última vez"
              : "Ej: Estoy bien con mi familia."
          }
        />
      </div>

      <div>
        <Label htmlFor="phone" hint="(privado, no se muestra)">
          {isMissing ? "Tu contacto (privado)" : "Teléfono / WhatsApp"}
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
        <PhotoInput
          label={isMissing ? "Foto de la persona (opcional)" : "Foto (opcional)"}
        />
      </div>

      <div>
        <Label htmlFor="location" required={status !== "SAFE"}>
          {isMissing ? "Última ubicación conocida" : "Ubicación"}
        </Label>
        <LocationPicker required={status !== "SAFE"} />
        <FieldError message={state.fieldErrors?.location} />
      </div>

      {isMissing ? (
        <SubmitButton tone="action" pendingLabel="Guardando…">
          Publicar reporte
        </SubmitButton>
      ) : (
        <SubmitButton tone="safe" pendingLabel="Guardando…">
          Registrar mi estado
        </SubmitButton>
      )}
    </form>
  );
}
