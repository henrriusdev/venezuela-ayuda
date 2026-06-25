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
  /** Solid, attention-grabbing variant (e.g. for Donate). */
  highlight?: boolean;
};

// White action card with a soft-tinted icon tile and a chevron — the calm,
// community feel from the design system. `highlight` makes a solid standout card;
// external (http) links open in a new tab.
export default function BigButton({
  href,
  emoji,
  label,
  sublabel,
  tileBg = "#eef3fa",
  accent = false,
  highlight = false,
}: Props) {
  const isExternal = /^https?:\/\//.test(href);

  const inner = (
    <>
      <span
        aria-hidden
        className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-[15px] text-[26px] leading-none"
        style={{ backgroundColor: highlight ? "rgba(255,255,255,0.22)" : tileBg }}
      >
        {emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block text-lg font-semibold leading-tight"
          style={highlight ? undefined : accent ? { color: "#c0512c" } : undefined}
        >
          {label}
        </span>
        {sublabel && (
          <span
            className="mt-0.5 block text-sm"
            style={highlight ? { color: "rgba(255,255,255,0.9)" } : { color: accent ? "#b07a66" : "#7a8796" }}
          >
            {sublabel}
          </span>
        )}
      </span>
      <span aria-hidden className={`text-2xl ${highlight ? "text-white/80" : "text-[#c2ccd6]"}`}>
        {isExternal ? "↗" : "›"}
      </span>
    </>
  );

  const className = `flex items-center gap-4 rounded-[18px] px-[18px] py-[17px] shadow-sm transition active:scale-[0.99] ${
    highlight
      ? "border-0 text-white"
      : `border bg-white ${accent ? "border-[#f0d9d0]" : "border-[#e6ecf2]"}`
  }`;
  const style = highlight
    ? { background: "linear-gradient(135deg,#16a34a,#0d9488)" }
    : undefined;

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={className} style={style}>
      {inner}
    </Link>
  );
}
