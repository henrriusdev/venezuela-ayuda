import { LIMITS } from "./constants";

// Lightweight input cleaning. We strip control characters, collapse runaway
// whitespace, and clamp lengths so a single actor can't bloat the DB or
// inject huge payloads over a flaky connection.

const CONTROL_CHARS = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]", "g");

export function cleanText(
  value: FormDataEntryValue | null | undefined,
  maxLen: number
): string {
  if (typeof value !== "string") return "";
  // Remove control chars (keep \n and \t); collapse 3+ blank lines.
  const stripped = value
    .replace(CONTROL_CHARS, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return stripped.slice(0, maxLen);
}

export function cleanOptional(
  value: FormDataEntryValue | null | undefined,
  maxLen: number
): string | null {
  const v = cleanText(value, maxLen);
  return v.length ? v : null;
}

// Coordinates must be finite and inside a sane bounding box. We accept a
// generous box around Venezuela so legitimate edge locations still work but
// junk (0,0 / NaN / antipodes) is rejected.
const VE_BOUNDS = { minLat: 0, maxLat: 16, minLng: -74, maxLng: -59 };

export function parseLatLng(
  latRaw: FormDataEntryValue | null,
  lngRaw: FormDataEntryValue | null
): { lat: number; lng: number } | null {
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < VE_BOUNDS.minLat || lat > VE_BOUNDS.maxLat) return null;
  if (lng < VE_BOUNDS.minLng || lng > VE_BOUNDS.maxLng) return null;
  return { lat, lng };
}

// Normalize a phone for WhatsApp deep links: keep digits, default to
// Venezuela's country code (58) when a local number is given.
export function normalizePhone(raw: string | null): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (!digits.startsWith("58") && digits.length <= 11) digits = "58" + digits;
  return digits.slice(0, 15);
}

export function isValidStatus(v: unknown): boolean {
  return v === "SAFE" || v === "NEEDS_HELP" || v === "LOOKING_FOR_SOMEONE";
}

export const FIELD_LIMITS = LIMITS;
