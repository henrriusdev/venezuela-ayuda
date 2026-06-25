"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/i18n/config";

function persistLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
}

// ES / EN segmented toggle. Sets the locale cookie on the client (no extra
// server round-trip) and refreshes so server components re-render in the new
// locale. The heavy homepage/map queries are cached, so the refresh is fast.
export default function LanguageToggle() {
  const active = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (locale: Locale) => {
    if (locale === active || pending) return;
    persistLocale(locale);
    startTransition(() => router.refresh());
  };

  return (
    <div
      className="inline-flex items-center rounded-full border border-[#e6ecf2] bg-white p-0.5 text-xs font-bold"
      role="group"
      aria-label="Idioma / Language"
    >
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => choose(locale)}
          aria-pressed={locale === active}
          disabled={pending}
          className={`cursor-pointer rounded-full px-2.5 py-1 uppercase transition disabled:cursor-default ${
            locale === active ? "bg-[#2563a8] text-white" : "text-[#5b6b7b] hover:bg-slate-100"
          }`}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
