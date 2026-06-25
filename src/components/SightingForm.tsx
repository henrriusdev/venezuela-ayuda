"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { submitSighting } from "@/app/actions";
import { Label, TextInput, TextArea, FieldError } from "@/components/Field";

// Lets anyone who recognizes a reported person leave a contact + message that
// only the original reporter can read. Posts via the submitSighting action.
export default function SightingForm({ checkinId }: { checkinId: string }) {
  const t = useTranslations("components.sightingForm");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!contact.trim() && !message.trim()) {
      setError(t("needContactOrMessage"));
      return;
    }
    setPending(true);
    const res = await submitSighting(checkinId, name, contact, message, website);
    setPending(false);
    if (res.ok) {
      setDone(true);
    } else {
      setError(res.error ?? t("sendFailed"));
    }
  }

  if (done) {
    return (
      <section className="mt-4 rounded-2xl border border-[#e6ecf2] bg-white p-4">
        <p className="font-medium text-[#2f9e6e]">
          {t("doneTitle")}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-2xl border border-[#e6ecf2] bg-white p-4">
      <p className="text-sm text-[#5b6b7b]">
        {t("intro")}
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 w-full rounded-xl bg-[#2563a8] px-5 py-3 font-semibold text-white active:scale-[0.99]"
        >
          {t("openButton")}
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <Label htmlFor="sighting-name" hint={tc("optional")}>
              {t("yourName")}
            </Label>
            <TextInput
              id="sighting-name"
              name="sighting-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              autoComplete="name"
            />
          </div>

          <div>
            <Label htmlFor="sighting-contact">{t("yourContact")}</Label>
            <TextInput
              id="sighting-contact"
              name="sighting-contact"
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={120}
              inputMode="tel"
              autoComplete="tel"
              placeholder={t("phonePlaceholder")}
            />
          </div>

          <div>
            <Label htmlFor="sighting-message">{tc("message")}</Label>
            <TextArea
              id="sighting-message"
              name="sighting-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              placeholder={t("messagePlaceholder")}
            />
          </div>

          {/* Honeypot — visually hidden, ignored by humans. */}
          <div
            aria-hidden
            className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden"
          >
            <label htmlFor="website">{t("honeypotLabel")}</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <FieldError message={error ?? undefined} />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending}
            className="w-full rounded-xl bg-[#2563a8] px-5 py-3 font-semibold text-white active:scale-[0.99] disabled:opacity-60"
          >
            {pending ? t("sending") : t("submit")}
          </button>
        </div>
      )}
    </section>
  );
}
