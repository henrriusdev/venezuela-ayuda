"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const STRIPE_URL = "https://donate.stripe.com/eVq14m62u9BRdpm4Xw2sM02";
const ABOUT_URL = "https://vaccfoundation.org/about-us/";
const PROPUBLICA_URL = "https://projects.propublica.org/nonprofits/organizations/650282287";
const GRADIENT = "linear-gradient(135deg,#16a34a,#0d9488)";

// Donate entry: a standout button that opens a popup with info about the
// organization, a link to their page, and the actual donation button.
export default function DonateButton() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("donate");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-4 rounded-[18px] border-0 px-[18px] py-[17px] text-left text-white shadow-sm transition active:scale-[0.99]"
        style={{ background: GRADIENT }}
      >
        <span
          aria-hidden
          className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-[15px] text-[26px] leading-none"
          style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
        >
          ❤️
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold leading-tight">{t("buttonLabel")}</span>
          <span className="mt-0.5 block text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
            {t("buttonSub")}
          </span>
        </span>
        <span aria-hidden className="text-2xl text-white/80">
          ›
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="donate-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div aria-hidden className="text-center text-4xl">❤️</div>
            <h2 id="donate-title" className="mt-2 text-center text-xl font-bold text-[#14212e]">
              {t("modalTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5b6b7b]">{t("orgDescription")}</p>
            <div className="mt-3 rounded-xl bg-[#f5f8fb] p-3 text-xs leading-relaxed text-[#5b6b7b]">
              <p className="font-semibold text-[#14212e]">{t("transparencyTitle")}</p>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                <li>{t.rich("transparency1", { b: (c) => <strong>{c}</strong> })}</li>
                <li>
                  {t.rich("transparency2", {
                    b: (c) => <strong>{c}</strong>,
                    link: (c) => (
                      <a
                        href={PROPUBLICA_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#2563a8] hover:underline"
                      >
                        {c}
                      </a>
                    ),
                  })}
                </li>
                <li>{t.rich("transparency3", { b: (c) => <strong>{c}</strong> })}</li>
              </ul>
            </div>
            <a
              href={ABOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-[#2563a8] hover:underline"
            >
              {t("learnMore")}
            </a>
            <a
              href={STRIPE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-4 block rounded-xl px-5 py-3.5 text-center font-semibold text-white active:scale-[0.99]"
              style={{ background: GRADIENT }}
            >
              {t("donateNow")}
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 block w-full rounded-xl px-5 py-2.5 text-sm font-semibold text-[#5b6b7b]"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
