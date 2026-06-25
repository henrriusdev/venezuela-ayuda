"use client";

import { useState } from "react";
import { whatsappShareUrl } from "@/lib/share";

// WhatsApp-first sharing. Falls back to the native share sheet and a
// copy-to-clipboard button so it works on every device.
export default function ShareButtons({
  text,
  url,
  compact = false,
}: {
  text: string;
  url: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const full = `${text} ${url}`.trim();

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text, url });
      } catch {
        /* user cancelled */
      }
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-2"}`}>
      <a
        href={whatsappShareUrl(full)}
        target="_blank"
        rel="noopener noreferrer"
        style={{ backgroundColor: "#25D366" }}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-bold text-white active:scale-[0.99]"
      >
        <span aria-hidden>💬</span> Compartir por WhatsApp
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-3 font-bold text-slate-800 active:scale-[0.99]"
      >
        <span aria-hidden>🔗</span> {copied ? "¡Copiado!" : "Copiar enlace"}
      </button>
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          type="button"
          onClick={nativeShare}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-3 font-bold text-slate-800 active:scale-[0.99]"
        >
          <span aria-hidden>📤</span> Compartir
        </button>
      )}
    </div>
  );
}
