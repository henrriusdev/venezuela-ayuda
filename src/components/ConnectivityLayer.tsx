"use client";

import { useEffect, useState } from "react";

// Registers the service worker and shows a thin banner when the device goes
// offline, so users on flaky connections understand why things may stall.
export default function ConnectivityLayer() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;
  return (
    <div
      role="status"
      className="sticky top-0 z-50 bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-white"
    >
      📡 Sin conexión — algunos datos pueden no cargar. Tu información se enviará al reconectar.
    </div>
  );
}
