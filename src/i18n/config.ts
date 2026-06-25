// Supported locales. Spanish is the default (Venezuela-first); English is the
// secondary for international donors/volunteers. Selection is cookie-based —
// there are no per-locale URLs.
export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
