// Dataset picker. The API hosts several datasets; switching reloads the queue
// against `/{slug}/api/...`. Hidden entirely when only one dataset is
// configured (the common case) so the UI stays uncluttered.
"use client";

import type { DatasetOption } from "@/lib/dedupeApi";

export default function DatasetSelector({
  options,
  value,
  onChange,
}: {
  options: DatasetOption[];
  value: string;
  onChange: (slug: string) => void;
}) {
  if (options.length < 2) return null;

  return (
    <label className="flex items-center gap-1.5 text-sm">
      <span className="text-[#5b6b7b]">Dataset</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[#e6ecf2] bg-white px-2.5 py-1.5 text-sm font-medium text-[#14212e] outline-none transition focus:border-[#2563a8]"
      >
        {options.map((d) => (
          <option key={d.slug} value={d.slug}>
            {d.label}
          </option>
        ))}
      </select>
    </label>
  );
}
