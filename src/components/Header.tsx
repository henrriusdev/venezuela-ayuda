"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import LanguageToggle from "@/components/LanguageToggle";

const LINKS = [
  { href: "/buscar", key: "search" },
  { href: "/mapa", key: "map" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const t = useTranslations("header");

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-[#14212e]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="" className="h-11 w-11 rounded-[11px]" />
          <span>Hazlo Hoy · Venezuela Ayuda</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 ${
                  active ? "text-white" : "text-[#5b6b7b] hover:bg-slate-100"
                }`}
                style={active ? { backgroundColor: "#2563a8" } : undefined}
              >
                {t(l.key)}
              </Link>
            );
          })}
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}
