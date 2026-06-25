"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Map as MLMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { VENEZUELA_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import { getMapStyle } from "@/lib/mapStyle";

// Optional location picker. Writes lat/lng into hidden inputs so the parent
// <form> submits them. The map is lazy-loaded (dynamic import of maplibre-gl)
// only when the user opens it — keeping the initial form payload tiny.
export default function LocationPicker({ required = false }: { required?: boolean }) {
  const t = useTranslations("forms.location");
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);

  // Geocode an address/place (OpenStreetMap Nominatim, keyless) and jump the
  // pin there. Far easier than dragging the map across the whole country.
  async function searchPlace() {
    const q = query.trim();
    if (q.length < 3) {
      setSearchError(t("searchTooShort"));
      return;
    }
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ve&q=${encodeURIComponent(
          q
        )}`,
        { headers: { Accept: "application/json" } }
      );
      const arr = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (!Array.isArray(arr) || !arr.length) {
        setSearchError(t("searchNotFound"));
        return;
      }
      const lat = +Number(arr[0].lat).toFixed(6);
      const lng = +Number(arr[0].lon).toFixed(6);
      setCoords({ lat, lng });
      setOpen(true);
      // If the map is already mounted, fly to it; otherwise the init effect
      // centers on the new coords when the panel opens.
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 16 });
    } catch {
      setSearchError(t("searchFailed"));
    } finally {
      setSearching(false);
    }
  }

  // Initialize the map only after the picker is opened.
  useEffect(() => {
    if (!open || !containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const maplibre = await import("maplibre-gl");
      if (cancelled || !containerRef.current) return;

      const start = coords ?? VENEZUELA_CENTER;
      const map = new maplibre.Map({
        container: containerRef.current,
        style: getMapStyle(),
        center: [start.lng, start.lat],
        zoom: coords ? 14 : DEFAULT_ZOOM,
        attributionControl: { compact: true },
      });
      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

      // Center pin (a fixed DOM element); reading center on moveend keeps it
      // cheap on weak devices vs. a draggable marker.
      map.on("moveend", () => {
        const c = map.getCenter();
        setCoords({ lat: +c.lat.toFixed(6), lng: +c.lng.toFixed(6) });
      });
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoError(t("noGeolocation"));
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) };
        setCoords(c);
        setOpen(true);
        setLocating(false);
        mapRef.current?.flyTo({ center: [c.lng, c.lat], zoom: 15 });
      },
      () => {
        setGeoError(t("geoFailed"));
        setLocating(false);
        setOpen(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  return (
    <div>
      <input type="hidden" name="latitude" value={coords?.lat ?? ""} readOnly />
      <input type="hidden" name="longitude" value={coords?.lng ?? ""} readOnly />

      {/* Address / place search */}
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              searchPlace();
            }
          }}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchAria")}
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base"
        />
        <button
          type="button"
          onClick={searchPlace}
          disabled={searching}
          className="shrink-0 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {searching ? "…" : t("search")}
        </button>
      </div>
      {searchError && <p className="mb-2 text-sm text-amber-700">{searchError}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={useMyLocation}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 font-semibold text-blue-700 ring-1 ring-blue-200 active:scale-[0.99]"
        >
          <span aria-hidden>📍</span>
          {locating ? t("locating") : t("useMyLocation")}
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 active:scale-[0.99]"
        >
          <span aria-hidden>🗺️</span>
          {open ? t("hideMap") : t("chooseOnMap")}
        </button>
      </div>

      {required && !coords && (
        <p className="mt-2 text-sm text-slate-500">{t("required")}</p>
      )}

      {geoError && <p className="mt-2 text-sm text-amber-700">{geoError}</p>}

      {open && (
        <div className="relative mt-3 overflow-hidden rounded-xl ring-1 ring-slate-300">
          <div ref={containerRef} className="h-64 w-full" />
          {/* Fixed center pin */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-3xl"
            style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,.4))" }}
          >
            📍
          </div>
          <p className="bg-white/90 px-3 py-2 text-center text-sm text-slate-600">
            {t("dragHint")}
          </p>
        </div>
      )}

      {coords && (
        <p className="mt-2 text-sm text-slate-500">
          {t("selected", { lat: coords.lat, lng: coords.lng })}
        </p>
      )}
    </div>
  );
}
