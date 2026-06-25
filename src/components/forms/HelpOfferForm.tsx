"use client";

import { useActionState } from "react";
import { submitHelpOffer, type ActionState } from "@/app/actions";
import { OFFER_CATEGORIES, LIMITS } from "@/lib/constants";
import { Label, TextInput, TextArea, FieldError, Honeypot } from "@/components/Field";
import LocationPicker from "@/components/LocationPicker";
import SubmitButton from "@/components/SubmitButton";
import SuccessCard from "@/components/SuccessCard";

const initial: ActionState = { ok: false };

export default function HelpOfferForm() {
  const [state, action] = useActionState(submitHelpOffer, initial);

  if (state.ok) {
    return (
      <SuccessCard
        title="¡Gracias por ofrecer ayuda!"
        message="Tu oferta ya aparece en el mapa para quienes la necesitan."
        shareText="🙌 Estoy ofreciendo ayuda en Venezuela Ayuda. Únete:"
        sharePath="/puedo-ayudar"
        primaryHref="/mapa"
        primaryLabel="Ver en el mapa"
      />
    );
  }

  return (
    <form action={action} className="space-y-5">
      <Honeypot />

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 font-medium text-red-700" role="alert">
          {state.error}
        </p>
      )}

      <fieldset>
        <legend className="mb-2 block font-semibold text-slate-800">
          ¿Con qué puedes ayudar? <span className="text-red-600">*</span>
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(Object.keys(OFFER_CATEGORIES) as Array<keyof typeof OFFER_CATEGORIES>).map((k) => (
            <label
              key={k}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-4 text-center font-semibold has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
            >
              <input type="radio" name="category" value={k} className="sr-only" />
              <span aria-hidden className="text-2xl">{OFFER_CATEGORIES[k].emoji}</span>
              <span>{OFFER_CATEGORIES[k].label}</span>
            </label>
          ))}
        </div>
        <FieldError message={state.fieldErrors?.category} />
      </fieldset>

      <div>
        <Label htmlFor="description" hint="(opcional)">
          Detalles
        </Label>
        <TextArea
          id="description"
          name="description"
          maxLength={LIMITS.description}
          placeholder="Ej: Tengo camioneta y puedo trasladar personas o llevar suministros."
        />
      </div>

      <div>
        <Label htmlFor="availability" hint="(opcional)">
          Disponibilidad
        </Label>
        <TextInput
          id="availability"
          name="availability"
          maxLength={LIMITS.availability}
          placeholder="Ej: Hoy de 2pm a 8pm"
        />
      </div>

      <div>
        <Label htmlFor="city">Ciudad</Label>
        <TextInput id="city" name="city" maxLength={LIMITS.city} placeholder="Ej: Valencia" />
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
          placeholder="Para coordinar la ayuda"
        />
        <p className="mt-1 text-sm text-slate-500">🔒 No se muestra públicamente.</p>
      </div>

      <div>
        <Label htmlFor="location">Ubicación</Label>
        <LocationPicker />
      </div>

      <SubmitButton pendingLabel="Enviando…">Ofrecer ayuda</SubmitButton>
    </form>
  );
}
