// Hospital match panel for a group. When one of the group's reported people
// also appears on a hospital's admitted-patient list, this surfaces it so a
// reviewer can see the person may have been found — who, where, condition, and
// which reported records it matched.
//
// The API returns ONE match row per (reported record × hospital patient), so a
// group with several reports of the same person yields the same hospital
// patient repeated N times. We de-duplicate by `pacient_id` into a single card
// that lists the best score and every report it matched.
"use client";

import { Card } from "@/components/ui/card";
import {
  formatPhone,
  type PacientMatchSummary,
  type PacientSummary,
} from "@/lib/dedupeApi";

function fmtScore(score: number | null | undefined): number | null {
  if (score == null) return null;
  // Scores come back either 0..1 or already as a 0..100 percentage.
  return Math.round(score <= 1 ? score * 100 : score);
}

function fmtDate(raw: number | string | null): string | null {
  if (raw == null || raw === "") return null;
  // The API sends epoch millis (number or numeric string) or an ISO string.
  const s = String(raw).trim();
  const d = /^\d+$/.test(s) ? new Date(Number(s)) : new Date(raw);
  if (Number.isNaN(d.getTime())) return typeof raw === "string" ? raw : null;
  return d.toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// The address field often repeats the hospital name and is very long. Show a
// trimmed version, dropping a leading copy of the hospital name when present.
function shortAddress(p: PacientSummary): string | null {
  let addr = p.hospital_address?.trim();
  if (!addr) return null;
  const name = p.hospital_name?.trim();
  if (name && addr.toLowerCase().includes(name.toLowerCase())) {
    // Keep the tail after the (last) hospital-name mention — usually the
    // street / city part — so we don't echo the title twice.
    const idx = addr.toLowerCase().lastIndexOf(name.toLowerCase());
    const tail = addr.slice(idx + name.length).replace(/^[\s.,·-]+/, "");
    if (tail.length > 8) addr = tail;
  }
  return addr.length > 120 ? `${addr.slice(0, 117)}…` : addr;
}

// A municipality/state pair, dropping obviously truncated junk like "Cre".
function locationLine(p: PacientSummary): string | null {
  const parts = [p.hospital_municipality, p.hospital_state]
    .map((s) => s?.trim())
    .filter((s): s is string => Boolean(s) && (s as string).length > 3);
  return parts.length ? parts.join(", ") : null;
}

// Collapse the per-record match rows into one entry per hospital patient.
interface MergedMatch {
  pacient: PacientSummary;
  bestScore: number | null;
  // Names of the reported records that matched this patient.
  reportNames: string[];
}

function mergeByPacient(matches: PacientMatchSummary[]): MergedMatch[] {
  const byId = new Map<string, MergedMatch>();
  for (const m of matches) {
    const id = m.pacient.pacient_id;
    const score = fmtScore(m.relationship.overall_score ?? m.pacient.best_overall_score);
    const name = m.record?.person_name_raw?.trim();
    const existing = byId.get(id);
    if (existing) {
      if (score != null && (existing.bestScore == null || score > existing.bestScore))
        existing.bestScore = score;
      if (name && !existing.reportNames.includes(name)) existing.reportNames.push(name);
    } else {
      byId.set(id, {
        pacient: m.pacient,
        bestScore: score,
        reportNames: name ? [name] : [],
      });
    }
  }
  // Highest-confidence patient first.
  return [...byId.values()].sort((a, b) => (b.bestScore ?? 0) - (a.bestScore ?? 0));
}

export default function HospitalMatches({
  matches,
}: {
  matches: PacientMatchSummary[];
}) {
  const merged = mergeByPacient(matches);
  if (!merged.length) return null;

  return (
    <Card className="gap-0 overflow-hidden border-rose-200 bg-white py-0 shadow-sm">
      <header className="flex items-center gap-2.5 border-b border-rose-100 bg-rose-50 px-4 py-3">
        <span aria-hidden className="text-lg">
          🏥
        </span>
        <div>
          <h3 className="text-sm font-bold text-rose-900">
            Posible coincidencia en hospital
          </h3>
          <p className="text-[11px] uppercase tracking-wide text-rose-600">
            {merged.length} {merged.length === 1 ? "paciente" : "pacientes"} en
            listas de hospital
          </p>
        </div>
      </header>

      <ul className="divide-y divide-slate-100">
        {merged.map(({ pacient: p, bestScore, reportNames }) => {
          const phone = formatPhone(p.contact_phone_e164);
          const admitted = fmtDate(p.patient_admitted_at);
          const where = locationLine(p);
          const address = shortAddress(p);
          const condition =
            p.patient_condition && p.patient_condition.toLowerCase() !== "unknown"
              ? p.patient_condition
              : null;
          return (
            <li key={p.pacient_id} className="px-4 py-3">
              {/* Name + score */}
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-semibold text-slate-900">
                  {p.person_name_raw || "Paciente sin nombre"}
                  {p.age != null && p.age !== "" && (
                    <span className="font-normal text-slate-500"> · {p.age} años</span>
                  )}
                </p>
                {bestScore != null && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                      bestScore >= 90
                        ? "bg-rose-600 text-white"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {bestScore}%
                  </span>
                )}
              </div>

              {/* Hospital — name as the lead, location/address muted below */}
              {p.hospital_name && (
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {p.hospital_name}
                  {where && <span className="font-normal text-slate-500"> · {where}</span>}
                </p>
              )}
              {address && (
                <p className="truncate text-xs text-slate-400" title={p.hospital_address ?? undefined}>
                  {address}
                </p>
              )}

              {/* Secondary facts as compact chips */}
              {(condition || admitted || phone) && (
                <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                  {condition && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                      {condition}
                    </span>
                  )}
                  {admitted && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-500">
                      Ingreso {admitted}
                    </span>
                  )}
                  {phone && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 tabular-nums text-slate-500">
                      📞 {phone}
                    </span>
                  )}
                </div>
              )}

              {/* Which reports matched (deduped) */}
              {reportNames.length > 0 && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Coincide con{" "}
                  {reportNames.length === 1
                    ? `el reporte de ${reportNames[0]}`
                    : `${reportNames.length} reportes del grupo`}
                </p>
              )}

              {p.patient_notes && (
                <p className="mt-1 line-clamp-2 text-xs italic text-slate-400">
                  {p.patient_notes}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
