import Header from "@/components/Header";
import BigButton from "@/components/BigButton";

export default function Home() {
  return (
    <>
      <Header />
      <main id="contenido" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Venezuela Ayuda
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate-600">
            Conecta personas, familias y ayuda durante la emergencia.
          </p>
        </section>

        {/* Primary actions */}
        <section className="mt-8 grid gap-3" aria-label="Acciones principales">
          <BigButton
            href="/a-salvo"
            emoji="✅"
            label="Estoy a salvo"
            sublabel="Avisa a tu familia que estás bien"
            className="bg-green-600 text-white"
          />
          <BigButton
            href="/buscar"
            emoji="🔎"
            label="Busco a alguien"
            sublabel="Encuentra a un familiar o amigo"
            className="bg-violet-600 text-white"
          />
          <BigButton
            href="/necesito-ayuda"
            emoji="🆘"
            label="Necesito ayuda"
            sublabel="Pide ayuda médica, agua, rescate…"
            className="bg-red-600 text-white"
          />
          <BigButton
            href="/puedo-ayudar"
            emoji="🙌"
            label="Puedo ayudar"
            sublabel="Ofrece transporte, comida, refugio…"
            className="bg-blue-600 text-white"
          />
          <BigButton
            href="/mapa"
            emoji="🗺️"
            label="Ver mapa de ayuda"
            sublabel="Todo en un mapa interactivo"
            className="bg-slate-900 text-white"
          />
        </section>

        <section className="mt-8 rounded-2xl bg-white p-5 text-sm text-slate-600 ring-1 ring-black/5">
          <p className="font-semibold text-slate-800">Sin cuenta. Gratis. Rápido.</p>
          <p className="mt-1">
            No necesitas registrarte. Tu teléfono nunca se muestra públicamente.
            Funciona en conexiones lentas y teléfonos sencillos.
          </p>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-3xl px-4 py-6 text-center text-sm text-slate-400">
        Venezuela Ayuda · Plataforma comunitaria de emergencia
      </footer>
    </>
  );
}
