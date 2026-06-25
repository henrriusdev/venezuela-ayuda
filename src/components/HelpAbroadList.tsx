"use client";

import { useMemo, useState } from "react";
import {
  HELP_NEEDS,
  HELP_NEED_KEYS,
  type HelpCity,
  type HelpNeed,
  type HelpPlace,
} from "@/lib/helpAbroad";

// Tabs filter the whole list by need. "all" shows everything.
type TabKey = "all" | HelpNeed;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "Todos" },
  ...HELP_NEED_KEYS.map((k) => ({ key: k, label: HELP_NEEDS[k].label })),
];

export default function HelpAbroadList({ cities }: { cities: HelpCity[] }) {
  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cities
      .map((city) => {
        const places = city.places.filter((p) => {
          const matchesNeed = tab === "all" || p.needs.includes(tab);
          if (!matchesNeed) return false;
          if (!q) return true;
          const haystack = [
            city.city,
            city.country,
            p.name,
            p.address,
            p.description ?? "",
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        });
        return { ...city, places };
      })
      .filter((city) => city.places.length > 0);
  }, [cities, tab, query]);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-pressed={active}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-white text-[#14212e] shadow-sm"
                  : "text-[#5b6b7b] hover:text-[#14212e]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar ciudad o lugar…"
        className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-[#2563a8]"
      />

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="mt-6 text-center text-slate-500">
          No encontramos lugares para tu búsqueda.
        </p>
      ) : (
        <div className="mt-6 space-y-7">
          {filtered.map((city) => (
            <section key={`${city.city}-${city.country}`}>
              <h2 className="flex items-baseline gap-2 text-lg font-bold text-[#14212e]">
                {city.city} · {city.country}
                <span className="text-sm font-medium text-[#8190a0]">
                  {city.places.length}{" "}
                  {city.places.length === 1 ? "lugar" : "lugares"}
                </span>
              </h2>
              <ul className="mt-3 space-y-3">
                {city.places.map((p) => (
                  <li key={p.name}>
                    <PlaceCard place={p} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function PlaceCard({ place }: { place: HelpPlace }) {
  return (
    <div className="rounded-2xl border border-[#e6ecf2] bg-white p-4">
      <h3 className="text-base font-semibold text-[#14212e]">{place.name}</h3>
      {place.description && (
        <p className="mt-1 text-sm leading-relaxed text-[#5b6b7b]">
          {place.description}
        </p>
      )}

      <p className="mt-2 text-sm text-[#33414f]">📍 {place.address}</p>

      {(place.phone || place.website) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {place.phone && (
            <a
              href={`tel:${place.phone.replace(/[^+\d]/g, "")}`}
              className="font-semibold text-[#2563a8]"
            >
              📞 {place.phone}
            </a>
          )}
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#2563a8]"
            >
              🌐 Sitio web ↗
            </a>
          )}
        </div>
      )}

      {place.needs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {place.needs.map((need) => {
            const n = HELP_NEEDS[need];
            return (
              <span
                key={need}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: n.tintBg, color: n.tintText }}
              >
                <span aria-hidden>{n.emoji}</span>
                {n.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
