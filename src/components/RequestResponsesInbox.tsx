"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { fetchRequestResponses } from "@/app/actions";
import type { RequestResponse } from "@/lib/types";
import { timeAgo } from "@/lib/format";

// Only the original requester (who holds the manage token) sees the responses.
// The token comes from the URL on first visit and is then cached locally.
export default function RequestResponsesInbox({
  requestId,
  urlToken,
}: {
  requestId: string;
  urlToken?: string;
}) {
  const t = useTranslations("components.requestResponsesInbox");
  const tc = useTranslations("common");
  const [token, setToken] = useState<string | null>(urlToken ?? null);
  const [responses, setResponses] = useState<RequestResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Resolve the token: persist the URL token, or recover it from localStorage.
  useEffect(() => {
    const key = "manage:" + requestId;
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
  }, [requestId, urlToken]);

  // Load responses once, when a token becomes available.
  useEffect(() => {
    if (!token || loaded) return;
    let active = true;
    fetchRequestResponses(requestId, token).then((res) => {
      if (!active) return;
      setLoaded(true);
      if (res.ok) {
        setResponses(res.responses ?? []);
      } else {
        setError(res.error ?? t("loadFailed"));
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, token, loaded]);

  if (!token) return null;

  const count = responses?.length ?? 0;

  return (
    <section className="mt-4 rounded-2xl border border-[#e6ecf2] bg-white p-4">
      <h2 className="font-semibold text-[#14212e]">
        {t("title", { count })}
      </h2>

      {error ? (
        <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
      ) : !responses ? (
        <p className="mt-2 text-sm text-[#8190a0]">{tc("loading")}</p>
      ) : responses.length === 0 ? (
        <p className="mt-2 text-sm text-[#8190a0]">{t("empty")}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {responses.map((r) => (
            <li key={r.id} className="rounded-xl border border-[#e6ecf2] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[#14212e]">
                  {r.responder_name || t("anonymous")}
                </span>
                <span className="text-xs text-[#8190a0]">
                  {timeAgo(r.created_at)}
                </span>
              </div>
              {r.responder_contact && (
                <p className="mt-1 text-sm font-bold text-[#14212e]">
                  {r.responder_contact}
                </p>
              )}
              {r.message && (
                <p className="mt-1 text-sm text-[#5b6b7b]">{r.message}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
