import Link from "next/link";
import Header from "@/components/Header";
import BigButton from "@/components/BigButton";
import MapView from "@/components/MapView";
import EmergencyPhones from "@/components/EmergencyPhones";
import SupportMeasures from "@/components/SupportMeasures";
import { getStats, getMapMarkers } from "@/lib/data";

export const revalidate = 60;

export default async function Home() {
  const [stats, markers] = await Promise.all([getStats(), getMapMarkers()]);
  const fmt = (n: number) => n.toLocaleString("es-VE");

  return (
    <>
      <Header />
      <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-7">
        {/* Hero (full width, above the two columns) */}
        <section>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#14212e] sm:text-4xl">
            Venezuela Ayuda
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[#5b6b7b] sm:text-lg">
            Conectando personas, familias y ayuda durante la emergencia.
          </p>
        </section>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Actions column */}
          <div>
        {/* Primary actions */}
        <section className="grid gap-3" aria-label="Acciones principales">
          <BigButton
            href="/a-salvo"
            emoji="✅"
            label="Estoy a salvo"
            sublabel="Avisa a tu familia que estás bien"
            tileBg="#eaf3ec"
          />
          <BigButton
            href="/buscar"
            emoji="🔎"
            label="Busco a alguien"
            sublabel="Busca a una persona o repórtala como desaparecida"
            tileBg="#eef3fa"
          />
          <BigButton
            href="/necesito-ayuda"
            emoji="🆘"
            label="Necesito ayuda"
            sublabel="Solicita asistencia de emergencia"
            tileBg="#fdf0e9"
            accent
          />
          <BigButton
            href="/puedo-ayudar"
            emoji="🤝"
            label="Puedo ayudar"
            sublabel="Ofrece tu apoyo a la comunidad"
            tileBg="#e9f6ef"
          />
          <BigButton
            href="/mapa"
            emoji="🗺️"
            label="Ver mapa de ayuda"
            sublabel="Todo en un mapa interactivo"
            tileBg="#eef3fa"
          />
        </section>

        {/* Live stats */}
        <section className="mt-5 grid grid-cols-3 gap-2.5" aria-label="Estadísticas">
          <Stat value={fmt(stats.people)} label="Personas registradas" color="#14212e" />
          <Stat value={fmt(stats.requests)} label="Solicitudes activas" color="#e2603a" />
          <Stat value={fmt(stats.helpers)} label="Personas ayudando" color="#2563a8" />
        </section>

        <section className="mt-5 rounded-2xl border border-[#e6ecf2] bg-white p-5 text-sm text-[#5b6b7b]">
          <p className="font-semibold text-[#14212e]">Sin cuenta. Gratis. Rápido.</p>
          <p className="mt-1">
            No necesitas registrarte. Tu teléfono nunca se muestra públicamente.
            Funciona en conexiones lentas y teléfonos sencillos.
          </p>
        </section>

        <div className="mt-5 grid gap-5">
          <EmergencyPhones />
          <SupportMeasures />
        </div>
          </div>

          {/* Map column */}
          <div className="md:sticky md:top-6 md:self-start">
            <div className="overflow-hidden rounded-2xl border border-[#e6ecf2] bg-white">
              <div className="flex items-center justify-between gap-2 border-b border-[#e6ecf2] px-4 py-3">
                <span className="text-sm font-semibold text-[#14212e]">🗺️ Mapa de ayuda</span>
                <Link href="/mapa" className="text-sm font-semibold text-[#2563a8]">
                  Ver mapa completo →
                </Link>
              </div>
              <MapView
                markers={markers}
                heightClass="h-[55vh] min-h-[380px] md:h-[calc(100dvh-260px)] md:max-h-[640px]"
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-2xl px-4 py-6 text-center text-sm text-[#8190a0]">
        <Link href="/mapa" className="font-semibold text-[#2563a8]">
          Ver mapa completo ›
        </Link>
        <p className="mt-2">Venezuela Ayuda · Plataforma comunitaria de emergencia</p>
      </footer>
    </>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="rounded-[14px] border border-[#e6ecf2] bg-white px-2.5 py-3 text-center">
      <div className="text-xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-[11px] leading-tight text-[#8190a0]">{label}</div>
    </div>
  );
}
