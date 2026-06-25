"use client";

import { useTranslations } from "next-intl";

// Attribution for records ingested from other community efforts. Links back to
// the source and flags it as unverified.
export default function SourceBadge({
  source,
  url,
  className = "",
}: {
  source: string;
  url?: string | null;
  className?: string;
}) {
  const t = useTranslations("components.sourceBadge");
  const text = t("text", { source });
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-block text-xs font-medium text-[#2563a8] underline ${className}`}
      >
        {text}
      </a>
    );
  }
  return <span className={`inline-block text-xs font-medium text-[#8190a0] ${className}`}>{text}</span>;
}
