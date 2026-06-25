import Link from "next/link";

type Props = {
  href: string;
  emoji: string;
  label: string;
  sublabel?: string;
  className?: string;
};

// Large, high-contrast call-to-action used on the landing page. Generous
// padding gives a comfortable tap target on mobile.
export default function BigButton({ href, emoji, label, sublabel, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-2xl px-5 py-5 text-left shadow-sm ring-1 ring-black/5 transition active:scale-[0.99] ${className}`}
    >
      <span aria-hidden className="text-3xl leading-none">
        {emoji}
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-bold leading-tight">{label}</span>
        {sublabel && (
          <span className="block text-sm font-medium opacity-80">{sublabel}</span>
        )}
      </span>
    </Link>
  );
}
