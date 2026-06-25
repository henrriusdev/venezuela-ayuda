import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { timeAgo } from "@/lib/format";
import type { PublicCheckin } from "@/lib/types";

export default function CheckinCard({ c }: { c: PublicCheckin }) {
  return (
    <Link
      href={`/persona/${c.id}`}
      className="block rounded-2xl bg-white p-4 ring-1 ring-black/5 transition hover:ring-blue-300"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
        <StatusBadge status={c.status} />
      </div>
      {c.city && <p className="mt-0.5 text-sm text-slate-500">📍 {c.city}</p>}
      {c.message && <p className="mt-2 line-clamp-3 text-slate-700">“{c.message}”</p>}
      <p className="mt-2 text-xs text-slate-400">Actualizado {timeAgo(c.created_at)}</p>
    </Link>
  );
}
