// Compact third-party announcement (Yummy). We are NOT affiliated — we just
// surface the info and link to the original source.
const TWEET_URL = "https://x.com/metavarce/status/2069928794526249026?s=20";

export default function SupportMeasures() {
  return (
    <section
      aria-labelledby="apoyo-title"
      className="rounded-xl border border-[#cde6da] bg-[#eef9f2] p-4 text-sm"
    >
      <h2 id="apoyo-title" className="font-semibold text-[#14212e]">
        💚 Yummy · medidas de apoyo (hoy)
      </h2>
      <p className="mt-1 leading-relaxed text-[#33414f]">
        Viajes gratis a hospitales y clínicas en Caracas, sin tarifas dinámicas el
        resto del día.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <a
          href={TWEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#1f7a52] underline"
        >
          Ver anuncio original →
        </a>
        <span className="text-[#8190a0]">No estamos afiliados a Yummy.</span>
      </div>
    </section>
  );
}
