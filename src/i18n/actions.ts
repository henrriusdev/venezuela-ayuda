"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale, DEFAULT_LOCALE, type Locale } from "./config";

// Persists the chosen locale in a cookie. The language toggle calls this and
// then refreshes the route so server components re-render in the new locale.
export async function setLocale(locale: Locale) {
  const value = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const store = await cookies();
  store.set(LOCALE_COOKIE, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}
