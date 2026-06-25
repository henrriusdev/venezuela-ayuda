import Link from "next/link";
import Header from "@/components/Header";

// Consistent inner-page chrome: header, a back link, a title and intro.
export default function PageShell({
  title,
  intro,
  emoji,
  children,
  wide = false,
}: {
  title: string;
  intro?: string;
  emoji?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <>
      <Header />
      <main
        id="contenido"
        className={`mx-auto w-full flex-1 px-4 py-6 ${wide ? "max-w-5xl" : "max-w-xl"}`}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800"
        >
          ← Inicio
        </Link>
        <h1 className="mt-3 flex items-center gap-2 text-2xl font-extrabold text-slate-900">
          {emoji && <span aria-hidden>{emoji}</span>}
          {title}
        </h1>
        {intro && <p className="mt-1 text-slate-600">{intro}</p>}
        <div className="mt-6">{children}</div>
      </main>
    </>
  );
}
