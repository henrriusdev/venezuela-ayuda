// Single source of truth for the damaged-building risk triage. Used by both the
// form (live preview) and the server action (authoritative). Pure + framework-free.
//
// Section 1 — severe (R1–R10): any "Sí" ⇒ ROJO; else any "No sé" ⇒ AMARILLO + priority.
// Section 2 — minor (A1–A4): evaluated only when no severe "Sí"; any "Sí"/"No sé" ⇒ AMARILLO.
// Otherwise ⇒ NINGUNA (⚪). Never "verde/safe" by design.

import {
  RISK_QUESTIONS_SEVERE,
  RISK_QUESTIONS_MINOR,
  type RiskAnswer,
  type RiskLevel,
} from "./constants";

export type RiskAnswers = Record<string, RiskAnswer>;

export interface RiskResult {
  level: RiskLevel;
  priority: boolean;
}

export function computeRisk(answers: RiskAnswers): RiskResult {
  const severe = RISK_QUESTIONS_SEVERE.map((q) => answers[q.id]);
  const minor = RISK_QUESTIONS_MINOR.map((q) => answers[q.id]);

  const anySevereYes = severe.some((a) => a === "si");
  const anySevereUnsure = severe.some((a) => a === "nose");

  if (anySevereYes) return { level: "ROJO", priority: true };
  if (anySevereUnsure) return { level: "AMARILLO", priority: true };

  const anyMinorFlag = minor.some((a) => a === "si" || a === "nose");
  if (anyMinorFlag) return { level: "AMARILLO", priority: false };

  return { level: "NINGUNA", priority: false };
}
