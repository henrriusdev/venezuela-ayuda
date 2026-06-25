import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-[#14212e]">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-[11px] text-sm font-bold text-white"
            style={{ background: "linear-gradient(140deg,#2563a8,#2f9e6e)" }}
          >
            VA
          </span>
          <span>Venezuela Ayuda</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/buscar"
            className="rounded-lg px-3 py-2 text-[#5b6b7b] hover:bg-slate-100"
          >
            Buscar
          </Link>
          <Link
            href="/mapa"
            className="rounded-lg px-3 py-2 text-white"
            style={{ backgroundColor: "#2563a8" }}
          >
            Mapa
          </Link>
        </nav>
      </div>
    </header>
  );
}
