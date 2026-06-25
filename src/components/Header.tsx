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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 font-bold leading-tight text-[#14212e]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.webp"
            alt=""
            className="h-11 w-11 shrink-0 rounded-[11px] sm:h-14 sm:w-14"
          />
          <span className="text-sm sm:text-base">Hazlo Hoy · Venezuela Ayuda</span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 text-sm font-medium">
          <div className="hidden items-center gap-1 sm:flex">
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
          </div>
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}
