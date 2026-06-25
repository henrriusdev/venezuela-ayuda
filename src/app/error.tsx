"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div aria-hidden className="text-5xl">⚠️</div>
      <h1 className="mt-3 text-2xl font-extrabold text-slate-900">Algo salió mal</h1>
      <p className="mt-2 text-slate-600">
        Ocurrió un error. Revisa tu conexión e intenta de nuevo.
      </p>
      <div className="mt-6 flex gap-2">
        <button
          onClick={reset}
          className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
        >
          Reintentar
        </button>
        <Link href="/" className="rounded-xl bg-white px-5 py-3 font-bold text-slate-700 ring-1 ring-slate-300">
          Inicio
        </Link>
      </div>
    </main>
  );
}
