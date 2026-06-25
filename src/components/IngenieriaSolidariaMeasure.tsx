// Third-party support initiative (RedesAyuda · Ingeniería Solidaria). We surface
// the info and link to their directory; not affiliated.
export default function IngenieriaSolidariaMeasure() {
  return (
    <section
      aria-labelledby="ingsolidaria-title"
      className="rounded-xl border border-[#e6ddc6] bg-[#fbf6ea] p-4 text-sm"
    >
      <h2 id="ingsolidaria-title" className="font-semibold text-[#14212e]">
        🏗️ Ingeniería Solidaria · RedesAyuda
      </h2>
      <p className="mt-1 leading-relaxed text-[#33414f]">
        Conecta a personas afectadas por el terremoto con ingenieros civiles
        voluntarios que ofrecen orientación y evaluaciones estructurales
        preliminares gratuitas. Busca un profesional por zona en su directorio —o
        regístrate si eres ingeniero—. Para emergencias críticas (colapso,
        incendio, heridos), llama primero a los servicios de emergencia.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <a
          href="https://redesayuda.org/ingenieriasolidaria/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#2563a8] hover:underline"
        >
          Ir al directorio ↗
        </a>
        <span className="text-[#8190a0]">Iniciativa de RedesAyuda · no estamos afiliados.</span>
      </div>
    </section>
  );
}
