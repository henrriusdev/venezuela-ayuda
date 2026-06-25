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
          <h1 className="text-[26px] font-extrabold uppercase leading-tight tracking-tight text-[#14212e] sm:text-[34px]">
            Ayudemos a las víctimas del terremoto en Venezuela
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
            href="https://donate.stripe.com/eVq14m62u9BRdpm4Xw2sM02"
            emoji="❤️"
            label="Donar"
            sublabel="Apoya la respuesta al terremoto en Venezuela"
            highlight
          />
          <a
            href="https://vaccfoundation.org/about-us/"
            target="_blank"
            rel="noopener noreferrer"
            className="-mt-1 text-center text-sm font-semibold text-[#2563a8]"
          >
            Conocer más sobre la fundación ↗
          </a>
          <BigButton
            href="/buscar"
            emoji="🔎"
            label="Buscar o Reportar persona desaparecida"
            sublabel="Encuentra a alguien o crea un reporte"
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
            href="/reportar-edificio"
            emoji="🏚️"
            label="Reportar edificio dañado"
            sublabel="Reporta daños estructurales"
            tileBg="#f6dada"
          />
          <BigButton
            href="/a-salvo"
            emoji="✅"
            label="Estoy a salvo"
            sublabel="Avisa a tu familia que estás bien"
            tileBg="#eaf3ec"
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
        <section className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3" aria-label="Estadísticas">
          <Stat emoji="✅" value={fmt(stats.safe)} label="A salvo" color="#2f9e6e" />
          <Stat emoji="🔎" value={fmt(stats.missing)} label="Desaparecidos" color="#b5811f" />
          <Stat emoji="💚" value={fmt(stats.found)} label="Encontrados" color="#1f7a52" />
          <Stat emoji="🆘" value={fmt(stats.requests)} label="Solicitudes activas" color="#e2603a" />
          <Stat emoji="🤝" value={fmt(stats.helpers)} label="Voluntarios" color="#2563a8" />
          <Stat emoji="🏚️" value={fmt(stats.damaged)} label="Edificios dañados" color="#7f1d1d" />
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

      <footer className="mx-auto w-full max-w-5xl px-4 py-8 text-center text-sm text-[#8190a0]">
        <div className="grid gap-4 text-left md:grid-cols-2">
          <div className="rounded-2xl border border-[#e6ecf2] bg-white p-5 text-[#5b6b7b]">
            <p className="font-semibold text-[#14212e]">Sin cuenta. Gratis. Rápido.</p>
            <p className="mt-1">
              No necesitas registrarte. Tu teléfono nunca se muestra públicamente.
              Funciona en conexiones lentas y teléfonos sencillos.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e6ecf2] bg-white p-5 text-[#5b6b7b]">
            <p className="font-semibold text-[#14212e]">Contribuir</p>
            <p className="mt-1">
              Este es un proyecto comunitario y sin fines de lucro. Si quieres
              colaborar —desarrollo, datos, difusión o verificación de información—
              escríbeme a{" "}
              <a href="mailto:hola@maw.dev" className="font-semibold text-[#2563a8] underline">
                hola@maw.dev
              </a>
              .
            </p>
            <p className="mt-3 font-medium text-[#14212e]">
              Hecho con cariño para Venezuela. 🇻🇪
            </p>
          </div>
        </div>

        <p className="mt-4">Venezuela Ayuda · Plataforma comunitaria de emergencia</p>
      </footer>
    </>
  );
}

function Stat({
  value,
  label,
  color,
  emoji,
}: {
  value: string;
  label: string;
  color: string;
  emoji: string;
}) {
  return (
    <div className="rounded-[14px] border border-[#e6ecf2] bg-white px-2.5 py-3 text-center">
      <div aria-hidden className="text-base leading-none">
        {emoji}
      </div>
      <div className="mt-1 text-2xl font-bold leading-none" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-[11px] font-medium leading-tight text-[#5b6b7b]">{label}</div>
    </div>
  );
}
