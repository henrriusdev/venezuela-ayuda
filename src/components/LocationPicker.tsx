"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MLMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { VENEZUELA_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import { getMapStyle } from "@/lib/mapStyle";

// Optional location picker. Writes lat/lng into hidden inputs so the parent
// <form> submits them. The map is lazy-loaded (dynamic import of maplibre-gl)
// only when the user opens it — keeping the initial form payload tiny.
export default function LocationPicker({ required = false }: { required?: boolean }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);

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
      setGeoError("Tu dispositivo no permite ubicación.");
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
        setGeoError("No pudimos obtener tu ubicación. Puedes elegirla en el mapa.");
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={useMyLocation}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 font-semibold text-blue-700 ring-1 ring-blue-200 active:scale-[0.99]"
        >
          <span aria-hidden>📍</span>
          {locating ? "Buscando…" : "Usar mi ubicación"}
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 active:scale-[0.99]"
        >
          <span aria-hidden>🗺️</span>
          {open ? "Ocultar mapa" : "Elegir en el mapa"}
        </button>
      </div>

      {required && !coords && (
        <p className="mt-2 text-sm text-slate-500">
          Obligatorio: toca el mapa o usa tu ubicación.
        </p>
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
            Mueve el mapa para colocar el pin en tu ubicación.
          </p>
        </div>
      )}

      {coords && (
        <p className="mt-2 text-sm text-slate-500">
          Ubicación seleccionada: {coords.lat}, {coords.lng}
        </p>
      )}
    </div>
  );
}
