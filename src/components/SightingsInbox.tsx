"use client";

import { useEffect, useState } from "react";
import { fetchSightings } from "@/app/actions";
import type { Sighting } from "@/lib/types";
import { timeAgo } from "@/lib/format";

// Only the original reporter (who holds the manage token) sees the avisos.
// The token comes from the URL on first visit and is then cached locally.
export default function SightingsInbox({
  checkinId,
  urlToken,
}: {
  checkinId: string;
  urlToken?: string;
}) {
  const [token, setToken] = useState<string | null>(urlToken ?? null);
  const [sightings, setSightings] = useState<Sighting[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Resolve the token: persist the URL token, or recover it from localStorage.
  useEffect(() => {
    const key = "manage:" + checkinId;
    try {
      if (urlToken) {
        localStorage.setItem(key, urlToken);
      } else {
        const stored = localStorage.getItem(key);
        if (stored) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setToken(stored);
        }
      }
    } catch {
      // localStorage unavailable — ignore.
    }
  }, [checkinId, urlToken]);

  // Load avisos once, when a token becomes available.
  useEffect(() => {
    if (!token || loaded) return;
    let active = true;
    fetchSightings(checkinId, token).then((res) => {
      if (!active) return;
      setLoaded(true);
      if (res.ok) {
        setSightings(res.sightings ?? []);
      } else {
        setError(res.error ?? "No se pudieron cargar los avisos.");
      }
    });
    return () => {
      active = false;
    };
  }, [checkinId, token, loaded]);

  if (!token) return null;

  const count = sightings?.length ?? 0;

  return (
    <section className="mt-4 rounded-2xl border border-[#e6ecf2] bg-white p-4">
      <h2 className="font-semibold text-[#14212e]">Avisos recibidos ({count})</h2>

      {error ? (
        <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
      ) : !sightings ? (
        <p className="mt-2 text-sm text-[#8190a0]">Cargando…</p>
      ) : sightings.length === 0 ? (
        <p className="mt-2 text-sm text-[#8190a0]">Aún no hay avisos.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {sightings.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-[#e6ecf2] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[#14212e]">
                  {s.finder_name || "Anónimo"}
                </span>
                <span className="text-xs text-[#8190a0]">
                  {timeAgo(s.created_at)}
                </span>
              </div>
              {s.finder_contact && (
                <p className="mt-1 text-sm font-bold text-[#14212e]">
                  {s.finder_contact}
                </p>
              )}
              {s.message && (
                <p className="mt-1 text-sm text-[#5b6b7b]">{s.message}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
