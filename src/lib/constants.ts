// Shared domain constants. Spanish labels live here so the whole UI stays
// consistent and translation is a single source of truth.

export const CHECKIN_STATUSES = {
  SAFE: { label: "A salvo", color: "#16a34a", emoji: "✅" },
  NEEDS_HELP: { label: "Necesita ayuda", color: "#dc2626", emoji: "🆘" },
  LOOKING_FOR_SOMEONE: { label: "Busca a alguien", color: "#2563eb", emoji: "🔎" },
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
} as const;
export type HelpCategory = keyof typeof HELP_CATEGORIES;

export const OFFER_CATEGORIES = {
  transportation: { label: "Transporte", emoji: "🚗" },
  food: { label: "Comida", emoji: "🍞" },
  shelter: { label: "Refugio", emoji: "🏠" },
  medical: { label: "Médica", emoji: "🩺" },
  supplies: { label: "Suministros", emoji: "📦" },
  translation: { label: "Traducción", emoji: "🗣️" },
} as const;
export type OfferCategory = keyof typeof OFFER_CATEGORIES;

export const URGENCY_LEVELS = {
  LOW: { label: "Baja", color: "#65a30d", weight: 1 },
  MEDIUM: { label: "Media", color: "#ca8a04", weight: 2 },
  HIGH: { label: "Alta", color: "#ea580c", weight: 3 },
  CRITICAL: { label: "Crítica", color: "#dc2626", weight: 4 },
} as const;
export type UrgencyLevel = keyof typeof URGENCY_LEVELS;

export const REQUEST_STATUSES = {
  OPEN: { label: "Abierta", color: "#dc2626" },
  IN_PROGRESS: { label: "En proceso", color: "#ca8a04" },
  RESOLVED: { label: "Resuelta", color: "#16a34a" },
} as const;
export type RequestStatus = keyof typeof REQUEST_STATUSES;

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
} as const;
