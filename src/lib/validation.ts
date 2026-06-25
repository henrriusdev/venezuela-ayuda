import { LIMITS } from "./constants";
import type { NeededItem } from "./types";

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

// Parse + sanitize the tools list submitted as a JSON string. Defends against
// malformed input: drops non-objects, cleans names, clamps quantities, caps size.
export function parseItems(raw: FormDataEntryValue | null): NeededItem[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  let arr: unknown;
  try {
    arr = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  const out: NeededItem[] = [];
  for (const entry of arr) {
    if (!entry || typeof entry !== "object") continue;
    const name = cleanText((entry as Record<string, unknown>).name as string, LIMITS.itemName);
    if (!name) continue;
    let qty = Math.floor(Number((entry as Record<string, unknown>).qty));
    if (!Number.isFinite(qty) || qty < 1) qty = 1;
    if (qty > LIMITS.maxQty) qty = LIMITS.maxQty;
    out.push({ name, qty });
    if (out.length >= LIMITS.maxItems) break;
  }
  return out;
}

// Render a needed-items list compactly, e.g. "Taladro ×2, Casco ×10".
export function formatItems(items: NeededItem[] | null | undefined): string {
  if (!items || !items.length) return "";
  return items.map((i) => `${i.name} ×${i.qty}`).join(", ");
}

export const FIELD_LIMITS = LIMITS;
