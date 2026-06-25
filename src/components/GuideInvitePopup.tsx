"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// Brief modal shown right after a user submits any report, inviting them to
// download the guide with more ways to help. Dismissible.
export default function GuideInvitePopup() {
  const [open, setOpen] = useState(true);
  const t = useTranslations("components.guideInvitePopup");
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div aria-hidden className="text-4xl">🙌</div>
        <h2 id="guide-title" className="mt-2 text-xl font-bold text-[#14212e]">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#5b6b7b]">
          {t("body")}
        </p>
        <a
          href="/Guia-para-sumar.pdf"
          target="_blank"
          rel="noopener noreferrer"
          download
          onClick={() => setOpen(false)}
          className="mt-4 block rounded-xl bg-[#2563a8] px-5 py-3.5 font-semibold text-white active:scale-[0.99]"
        >
          {t("download")}
        </a>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-2 block w-full rounded-xl px-5 py-2.5 text-sm font-semibold text-[#5b6b7b]"
        >
          {t("notNow")}
        </button>
      </div>
    </div>
  );
}
