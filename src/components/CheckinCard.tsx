import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { timeAgo } from "@/lib/format";
import { CHECKIN_STATUSES } from "@/lib/constants";
import type { PublicCheckin } from "@/lib/types";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CheckinCard({ c }: { c: PublicCheckin }) {
  const s = CHECKIN_STATUSES[c.status];
  return (
    <Link
      href={`/persona/${c.id}`}
      className="block rounded-2xl border border-[#e6ecf2] bg-white p-4 transition hover:border-[#c9d6e3]"
    >
      <div className="flex items-center gap-3.5">
        <span
          aria-hidden
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-base font-semibold"
          style={{ backgroundColor: s.tintBg, color: s.tintText }}
        >
          {initials(c.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-[#14212e]">{c.name}</h3>
          <p className="mt-0.5 text-xs text-[#8190a0]">
            {c.city ? `${c.city} · ` : ""}Actualizado {timeAgo(c.created_at)}
          </p>
        </div>
        <StatusBadge status={c.status} />
      </div>
      {c.message && (
        <p className="mt-3 line-clamp-2 text-sm text-[#5b6b7b]">“{c.message}”</p>
      )}
    </Link>
  );
}
