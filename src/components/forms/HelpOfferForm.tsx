"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitHelpOffer, type ActionState } from "@/app/actions";
import { OFFER_CATEGORIES, LIMITS } from "@/lib/constants";
import { Label, TextInput, TextArea, FieldError, Honeypot } from "@/components/Field";
import LocationPicker from "@/components/LocationPicker";
import SubmitButton from "@/components/SubmitButton";
import SuccessCard from "@/components/SuccessCard";

const initial: ActionState = { ok: false };

export default function HelpOfferForm() {
  const [state, action] = useActionState(submitHelpOffer, initial);
  const t = useTranslations("forms.offer");
  const tForms = useTranslations("forms");
  const tCommon = useTranslations("common");
  const tD = useTranslations("domain");

  if (state.ok) {
    return (
      <SuccessCard
        title={t("successTitle")}
        message={t("successMessage")}
        shareText={t("successShare")}
        sharePath="/puedo-ayudar"
        primaryHref="/mapa"
        primaryLabel={t("viewMap")}
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
          {t("categoryLegend")} <span className="text-red-600">*</span>
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(Object.keys(OFFER_CATEGORIES) as Array<keyof typeof OFFER_CATEGORIES>).map((k) => (
            <label
              key={k}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-[15px] border border-[#e6ecf2] bg-white px-3 py-4 text-center font-semibold has-[:checked]:border-2 has-[:checked]:border-[#2f9e6e] has-[:checked]:bg-[#e9f6ef] has-[:checked]:text-[#1f7a52]"
            >
              <input type="radio" name="category" value={k} className="sr-only" />
              <span aria-hidden className="text-2xl">{OFFER_CATEGORIES[k].emoji}</span>
              <span>{tD("offer." + k)}</span>
            </label>
          ))}
        </div>
        <FieldError message={state.fieldErrors?.category} />
      </fieldset>

      <div>
        <Label htmlFor="description" hint={tCommon("optional")}>
          {t("detailsLabel")}
        </Label>
        <TextArea
          id="description"
          name="description"
          maxLength={LIMITS.description}
          placeholder={t("detailsPlaceholder")}
        />
      </div>

      <div>
        <Label htmlFor="availability" hint={tCommon("optional")}>
          {t("availabilityLabel")}
        </Label>
        <TextInput
          id="availability"
          name="availability"
          maxLength={LIMITS.availability}
          placeholder={t("availabilityPlaceholder")}
        />
      </div>

      <div>
        <Label htmlFor="city">{tCommon("city")}</Label>
        <TextInput id="city" name="city" maxLength={LIMITS.city} placeholder={t("cityPlaceholder")} />
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
        <Label htmlFor="location">{tForms("locationLabel")}</Label>
        <LocationPicker />
      </div>

      <SubmitButton pendingLabel={t("sending")}>{t("submit")}</SubmitButton>
    </form>
  );
}
