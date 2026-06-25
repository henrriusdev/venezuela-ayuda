// Time-sensitive support-measures announcement (Yummy). Spanish to match the UI.
const MEASURES = [
  {
    emoji: "🏥",
    text: "Todos los viajes a hospitales y clínicas en Caracas serán gratuitos, financiados por Yummy.",
  },
  {
    emoji: "🚗",
    text: "No habrá tarifas dinámicas por el resto del día para mantener la movilidad accesible para todos.",
  },
  {
    emoji: "💚",
    text: "Los conductores que decidan salir a trabajar recibirán el 100% de sus ganancias. Hoy, Yummy no cobrará comisión.",
  },
];

export default function SupportMeasures() {
  return (
    <section
      aria-labelledby="apoyo-title"
      className="rounded-2xl border border-[#cde6da] bg-[#eef9f2] p-5"
    >
      <h2 id="apoyo-title" className="flex items-center gap-2 font-bold text-[#14212e]">
        <span aria-hidden>💚</span> Medidas de apoyo · Yummy
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[#33414f]">
        Nuestra prioridad es la seguridad de todos los venezolanos. Como medida de
        apoyo ante la situación de hoy, estamos tomando las siguientes acciones:
      </p>

      <ul className="mt-3 grid gap-2.5">
        {MEASURES.map((m) => (
          <li key={m.emoji} className="flex gap-2.5 text-sm leading-relaxed text-[#33414f]">
            <span aria-hidden className="shrink-0">{m.emoji}</span>
            <span>{m.text}</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 border-t border-[#cde6da] pt-3 text-sm font-semibold text-[#1f7a52]">
        La seguridad es lo primero. Nadie está obligado a salir a manejar.
        Seguiremos informando.
      </p>
    </section>
  );
}
