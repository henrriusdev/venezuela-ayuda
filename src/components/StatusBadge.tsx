import { useTranslations } from "next-intl";
import { CHECKIN_STATUSES, type CheckinStatus } from "@/lib/constants";

export default function StatusBadge({ status }: { status: CheckinStatus }) {
  const s = CHECKIN_STATUSES[status];
  const tD = useTranslations("domain");
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold"
      style={{ backgroundColor: s.tintBg, color: s.tintText }}
    >
      <span aria-hidden>{s.emoji}</span>
      {tD(`checkinStatus.${status}`)}
    </span>
  );
}
