import Link from "next/link";

type Props = {
  href: string;
  emoji: string;
  label: string;
  sublabel?: string;
  /** Soft tint behind the icon tile, e.g. "#eaf3ec". */
  tileBg?: string;
  /** Emphasis variant for the emergency action (warm border + colored title). */
  accent?: boolean;
};

// White action card with a soft-tinted icon tile and a chevron — the calm,
// community feel from the design system (no saturated full-bleed buttons).
export default function BigButton({
  href,
  emoji,
  label,
  sublabel,
  tileBg = "#eef3fa",
  accent = false,
}: Props) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-[18px] border bg-white px-[18px] py-[17px] shadow-sm transition active:scale-[0.99] ${
        accent ? "border-[#f0d9d0]" : "border-[#e6ecf2]"
      }`}
    >
      <span
        aria-hidden
        className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-[15px] text-[26px] leading-none"
        style={{ backgroundColor: tileBg }}
      >
        {emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block text-lg font-semibold leading-tight"
          style={accent ? { color: "#c0512c" } : undefined}
        >
          {label}
        </span>
        {sublabel && (
          <span
            className="mt-0.5 block text-sm"
            style={{ color: accent ? "#b07a66" : "#7a8796" }}
          >
            {sublabel}
          </span>
        )}
      </span>
      <span aria-hidden className="text-2xl text-[#c2ccd6]">
        ›
      </span>
    </Link>
  );
}
