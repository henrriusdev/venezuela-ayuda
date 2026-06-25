"use client";

import { useFormStatus } from "react-dom";

const TONES = {
  action: "#2563a8",
  safe: "#2f9e6e",
  emergency: "#e2603a",
} as const;

// Disables itself and shows a spinner while the server action runs — prevents
// double submits on slow connections.
export default function SubmitButton({
  children,
  pendingLabel = "Enviando…",
  tone = "action",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  tone?: keyof typeof TONES;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      style={{ backgroundColor: TONES[tone] }}
      className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[15px] px-5 py-4 text-lg font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && (
        <span
          aria-hidden
          className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      )}
      {pending ? pendingLabel : children}
    </button>
  );
}
