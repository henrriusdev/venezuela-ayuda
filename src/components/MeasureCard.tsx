import type { ReactNode } from "react";

// Collapsible card for a single support measure ("medida de apoyo"). The block
// holds several of these, so each is a <details> that stays compact until opened.
export default function MeasureCard({
  title,
  children,
  className = "border-[#e6ecf2] bg-white",
  defaultOpen = false,
}: {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className={`group rounded-xl border p-4 text-sm ${className}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-[#14212e] [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span
          aria-hidden
          className="shrink-0 text-xs text-[#8190a0] transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}
