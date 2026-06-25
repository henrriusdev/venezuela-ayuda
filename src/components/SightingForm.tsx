"use client";

import { useState } from "react";
import { submitSighting } from "@/app/actions";
import { Label, TextInput, TextArea, FieldError } from "@/components/Field";

// Lets anyone who recognizes a reported person leave a contact + message that
// only the original reporter can read. Posts via the submitSighting action.
export default function SightingForm({ checkinId }: { checkinId: string }) {
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
      setError("Deja un contacto o un mensaje.");
      return;
    }
    setPending(true);
    const res = await submitSighting(checkinId, name, contact, message, website);
    setPending(false);
    if (res.ok) {
      setDone(true);
    } else {
      setError(res.error ?? "No se pudo enviar. Intenta de nuevo.");
    }
  }

  if (done) {
    return (
      <section className="mt-4 rounded-2xl border border-[#e6ecf2] bg-white p-4">
        <p className="font-medium text-[#2f9e6e]">
          ✅ Gracias. Enviamos tu aviso a quien reportó; te contactará pronto.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-2xl border border-[#e6ecf2] bg-white p-4">
      <p className="text-sm text-[#5b6b7b]">
        ¿Reconoces a esta persona o la encontraste? Deja tus datos y un mensaje;
        se los haremos llegar a quien la reportó (tu información solo la verá esa
        persona).
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 w-full rounded-xl bg-[#2563a8] px-5 py-3 font-semibold text-white active:scale-[0.99]"
        >
          ✋ La reconozco / La encontré
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <Label htmlFor="sighting-name" hint="opcional">
              Tu nombre
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
            <Label htmlFor="sighting-contact">Tu contacto (teléfono)</Label>
            <TextInput
              id="sighting-contact"
              name="sighting-contact"
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={120}
              inputMode="tel"
              autoComplete="tel"
              placeholder="Ej. +58 412 1234567"
            />
          </div>

          <div>
            <Label htmlFor="sighting-message">Mensaje</Label>
            <TextArea
              id="sighting-message"
              name="sighting-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              placeholder="¿Dónde la viste? ¿Cómo está?"
            />
          </div>

          {/* Honeypot — visually hidden, ignored by humans. */}
          <div
            aria-hidden
            className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden"
          >
            <label htmlFor="website">No llenar este campo</label>
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
            {pending ? "Enviando…" : "Enviar aviso"}
          </button>
        </div>
      )}
    </section>
  );
}
