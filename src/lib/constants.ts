// Shared domain constants. Spanish labels live here so the whole UI stays
// consistent and translation is a single source of truth.

// `pin` = solid color used on the map. `tintBg`/`tintText` = the soft-tint badge
// style from the design system (calm, never saturated full-bleed).
export const CHECKIN_STATUSES = {
  SAFE: { label: "A salvo", emoji: "✅", pin: "#2f9e6e", tintBg: "#eaf3ec", tintText: "#1f7a52" },
  NEEDS_HELP: { label: "Necesita ayuda", emoji: "🆘", pin: "#e2603a", tintBg: "#fdf0e9", tintText: "#c05a32" },
  LOOKING_FOR_SOMEONE: { label: "En búsqueda", emoji: "🔎", pin: "#b5811f", tintBg: "#fff5e6", tintText: "#b5811f" },
} as const;
export type CheckinStatus = keyof typeof CHECKIN_STATUSES;

export const HELP_CATEGORIES = {
  medical: { label: "Médica", emoji: "🩺" },
  food: { label: "Comida", emoji: "🍞" },
  water: { label: "Agua", emoji: "💧" },
  shelter: { label: "Refugio", emoji: "🏠" },
  transportation: { label: "Transporte", emoji: "🚗" },
  electricity: { label: "Electricidad", emoji: "⚡" },
  rescue: { label: "Rescate", emoji: "🚨" },
  tools: { label: "Herramientas", emoji: "🛠️" },
} as const;
export type HelpCategory = keyof typeof HELP_CATEGORIES;

// Quick-pick list of tools/equipment commonly needed after an earthquake.
// Shown as chips in the help request form so people can add them fast.
export const COMMON_TOOLS = [
  "Taladro",
  "Casco",
  "Botas de trabajo",
  "Guantes",
  "Pala",
  "Pico",
  "Linterna",
  "Cuerda",
  "Generador",
  "Motosierra",
  "Carretilla",
  "Barra / palanca",
  "Mascarilla",
  "Gato hidráulico",
  "Escalera",
  "Botiquín",
] as const;

export const OFFER_CATEGORIES = {
  transportation: { label: "Transporte", emoji: "🚗" },
  food: { label: "Comida", emoji: "🍞" },
  shelter: { label: "Refugio", emoji: "🏠" },
  medical: { label: "Médica", emoji: "🩺" },
  supplies: { label: "Suministros", emoji: "📦" },
  translation: { label: "Traducción", emoji: "🗣️" },
} as const;
export type OfferCategory = keyof typeof OFFER_CATEGORIES;

// Labels follow the design language (Normal / Importante / Urgente / Crítico);
// the DB enum keys (LOW/MEDIUM/HIGH/CRITICAL) are unchanged.
export const URGENCY_LEVELS = {
  LOW: { label: "Normal", color: "#5b6b7b", tintBg: "#f0f3f7", weight: 1 },
  MEDIUM: { label: "Importante", color: "#b5811f", tintBg: "#fff5e6", weight: 2 },
  HIGH: { label: "Urgente", color: "#e2603a", tintBg: "#fdf0e9", weight: 3 },
  CRITICAL: { label: "Crítico", color: "#c9483a", tintBg: "#fbe9e4", weight: 4 },
} as const;
export type UrgencyLevel = keyof typeof URGENCY_LEVELS;

// Shown when a missing-person check-in has been resolved (found_at set).
export const FOUND_BADGE = {
  label: "Encontrado/a",
  emoji: "✅",
  tintBg: "#eaf3ec",
  tintText: "#1f7a52",
} as const;

export const REQUEST_STATUSES = {
  OPEN: { label: "Abierta", color: "#dc2626" },
  IN_PROGRESS: { label: "En proceso", color: "#ca8a04" },
  RESOLVED: { label: "Resuelta", color: "#16a34a" },
} as const;
export type RequestStatus = keyof typeof REQUEST_STATUSES;

// Brand palette (design system). Calm, trustworthy, community — not alarmist.
export const BRAND = {
  ink: "#14212e",
  inkSoft: "#5b6b7b",
  surface: "#f5f8fb",
  line: "#e6ecf2",
  action: "#2563a8", // primary / trust
  emergency: "#e2603a", // help requests
  safe: "#2f9e6e", // safe / success
  critical: "#c9483a",
  whatsapp: "#25D366",
} as const;

// Map default view: roughly centered on Venezuela.
export const VENEZUELA_CENTER = { lng: -66.9, lat: 10.0 };
export const DEFAULT_ZOOM = 6;

// Input limits — keep payloads small for slow connections and cap abuse.
export const LIMITS = {
  name: 80,
  city: 80,
  message: 500,
  description: 800,
  phone: 30,
  availability: 200,
  place_name: 120,
  itemName: 40,
  maxItems: 25,
  maxQty: 999,
} as const;
