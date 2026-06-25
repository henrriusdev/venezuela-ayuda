"use client";

import { useState } from "react";
import { respondToRequest } from "@/app/actions";
import { Label, TextInput, TextArea, FieldError } from "@/components/Field";

// Lets a volunteer who can cover a request leave a contact + message that only
// the original requester can read. Posts via the respondToRequest action.
export default function RequestResponseForm({ requestId }: { requestId: string }) {
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
    const res = await respondToRequest(requestId, name, contact, message, website);
    setPending(false);
    if (res.ok) {
      setDone(true);
    } else {
      setError(res.error ?? "No se pudo enviar. Intenta de nuevo.");
    }
  }

  if (done) {
    return (
      <section className="rounded-2xl border border-[#e6ecf2] bg-white p-4">
        <p className="font-medium text-[#2f9e6e]">
          ✅ ¡Gracias! Enviamos tu ofrecimiento a quien lo solicitó; te
          contactará pronto.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#e6ecf2] bg-white p-4">
      <p className="text-sm text-[#5b6b7b]">
        ¿Puedes cubrir esta necesidad? Deja tus datos y un mensaje; se los
        haremos llegar a quien la pidió (tu información solo la verá esa
        persona).
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 w-full rounded-xl bg-[#2563a8] px-5 py-3 font-semibold text-white active:scale-[0.99]"
        >
          🤝 Puedo ayudar con esto
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <Label htmlFor="response-name" hint="opcional">
              Tu nombre
            </Label>
            <TextInput
              id="response-name"
              name="response-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              autoComplete="name"
            />
          </div>

          <div>
            <Label htmlFor="response-contact">Tu contacto (teléfono)</Label>
            <TextInput
              id="response-contact"
              name="response-contact"
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
            <Label htmlFor="response-message">Mensaje</Label>
            <TextArea
              id="response-message"
              name="response-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              placeholder="¿Cómo puedes ayudar? ¿Cuándo estás disponible?"
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
            {pending ? "Enviando…" : "Enviar ofrecimiento"}
          </button>
        </div>
      )}
    </section>
  );
}
