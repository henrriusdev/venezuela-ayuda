import { CHECKIN_STATUSES, type CheckinStatus } from "@/lib/constants";

export default function StatusBadge({ status }: { status: CheckinStatus }) {
  const s = CHECKIN_STATUSES[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold text-white"
      style={{ backgroundColor: s.color }}
    >
      <span aria-hidden>{s.emoji}</span>
      {s.label}
    </span>
  );
}
