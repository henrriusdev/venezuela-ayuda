// Third-party support announcement (Digitel). We surface the info and note we
// are not affiliated.
export default function DigitelMeasure() {
  return (
    <section
      aria-labelledby="digitel-title"
      className="rounded-xl border border-[#cddbee] bg-[#eef3fa] p-4 text-sm"
    >
      <h2 id="digitel-title" className="font-semibold text-[#14212e]">
        📱 Digitel · medidas de apoyo
      </h2>
      <p className="mt-1 leading-relaxed text-[#33414f]">
        Llamadas nacionales y mensajes de texto (SMS) gratuitos durante las
        próximas 48 horas, principalmente para clientes en Caracas y La Guaira, y
        en Morón, Valencia, San Diego, Maracay, San Felipe y Barquisimeto — para
        facilitar la comunicación entre familiares y seres queridos.
      </p>
      <p className="mt-2 text-xs text-[#8190a0]">
        Información difundida por terceros · no estamos afiliados a Digitel.
      </p>
    </section>
  );
}
