import Link from "next/link";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="contenido" className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div aria-hidden className="text-5xl">🧭</div>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900">No encontramos esta página</h1>
        <p className="mt-2 text-slate-600">El enlace puede haber cambiado o no existe.</p>
        <Link href="/" className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">
          Volver al inicio
        </Link>
      </main>
    </>
  );
}
