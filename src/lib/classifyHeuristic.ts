import type { HelpCategory, UrgencyLevel } from "@/lib/constants";

export interface Classification {
  category: HelpCategory;
  urgency: UrgencyLevel;
  keywords: string[];
  location: string | null;
  source: "ai" | "heuristic";
}

// Spanish keyword signals. Used as the offline fallback when OpenAI is not
// configured or unavailable — so the feature degrades gracefully instead of
// breaking on a flaky connection.
const CATEGORY_HINTS: Record<HelpCategory, string[]> = {
  medical: ["médic", "herid", "sangr", "oxígeno", "oxigeno", "medicin", "doctor", "hospital", "ambulanc", "diabet", "insulin", "fractur", "dolor"],
  rescue: ["atrapad", "derrumb", "escombro", "rescate", "sepultad", "colaps", "bajo el", "edificio"],
  water: ["agua", "sed", "deshidrat", "potable"],
  food: ["comida", "hambre", "aliment", "comer", "leche", "fórmula", "formula", "pañal"],
  shelter: ["refugio", "techo", "dormir", "casa destruid", "sin hogar", "albergue", "carpa"],
  electricity: ["luz", "electric", "energía", "energia", "apagón", "apagon", "planta", "generador"],
  transportation: ["transport", "traslad", "vehícul", "vehicul", "carro", "gasolina", "llevar"],
  tools: ["herramient", "taladro", "casco", "pala", "pico", "guante", "cuerda", "motosierra", "carretilla", "palanca", "equipo", "linterna", "escalera"],
};

const CRITICAL = ["atrapad", "no respira", "oxígeno", "oxigeno", "sangr", "grave", "morir", "muriendo", "derrumb", "sepultad", "crítico", "critico", "urgente ya"];
const HIGH = ["urgent", "herid", "niño", "bebé", "bebe", "embaraz", "anciano", "abuel", "rápido", "rapido", "ayuda ya"];
const LOW = ["cuando puedan", "no urgente", "sin prisa", "leve"];

// A short, curated list of major Venezuelan cities to detect a location.
const CITIES = [
  "Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana",
  "Maturín", "Maturin", "Barcelona", "Cumaná", "Cumana", "Mérida", "Merida",
  "San Cristóbal", "San Cristobal", "Cabimas", "Coro", "Los Teques", "Guarenas",
  "Petare", "Punto Fijo", "Acarigua", "Carúpano", "Carupano", "El Tigre", "Valera",
];

export function classifyHeuristic(text: string): Classification {
  const t = text.toLowerCase();

  // Category: pick the one with the most keyword hits; default to "rescue"
  // only if rescue words present, else "food" as a neutral common need.
  let bestCat: HelpCategory = "medical";
  let bestScore = 0;
  for (const cat of Object.keys(CATEGORY_HINTS) as HelpCategory[]) {
    const score = CATEGORY_HINTS[cat].reduce((n, kw) => (t.includes(kw) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat;
    }
  }
  if (bestScore === 0) bestCat = "food";

  // Urgency.
  let urgency: UrgencyLevel = "MEDIUM";
  if (CRITICAL.some((k) => t.includes(k))) urgency = "CRITICAL";
  else if (HIGH.some((k) => t.includes(k))) urgency = "HIGH";
  else if (LOW.some((k) => t.includes(k))) urgency = "LOW";

  // Location.
  const location = CITIES.find((city) => t.includes(city.toLowerCase())) ?? null;

  // Keywords: a few salient tokens.
  const keywords = Array.from(
    new Set(
      ["oxígeno", "oxigeno", "agua", "comida", "niño", "anciano", "abuela", "abuelo", "herido", "atrapado", "embarazada", "bebé", "bebe"]
        .filter((k) => t.includes(k))
    )
  ).slice(0, 6);

  return { category: bestCat, urgency, keywords, location, source: "heuristic" };
}
