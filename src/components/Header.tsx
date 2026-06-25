import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span aria-hidden className="text-xl">🇻🇪</span>
          <span>Venezuela Ayuda</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/buscar"
            className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
          >
            Buscar
          </Link>
          <Link
            href="/mapa"
            className="rounded-lg bg-slate-900 px-3 py-2 text-white hover:bg-slate-700"
          >
            Mapa
          </Link>
        </nav>
      </div>
    </header>
  );
}
