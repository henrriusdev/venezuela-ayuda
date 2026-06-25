// Emergency phone numbers for Caracas. Tappable (tel:) so people can call with
// one touch on mobile.
const PHONES = [
  { number: "171", dial: "171", label: "Teléfono fijo CANTV" },
  { number: "*1", dial: "*1", label: "Movilnet" },
  { number: "112", dial: "112", label: "Digitel" },
  { number: "911", dial: "911", label: "Movistar" },
];

export default function EmergencyPhones() {
  return (
    <section
      aria-labelledby="emergencia-title"
      className="rounded-2xl border border-[#e6ecf2] bg-white p-5"
    >
      <h2
        id="emergencia-title"
        className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#dc2626]"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" aria-hidden>
          <path
            d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.57 3.6a1 1 0 0 1-.25 1l-2.2 2.2Z"
            fill="#dc2626"
          />
        </svg>
        Teléfonos de emergencia · Caracas
      </h2>

      <ul className="grid gap-3">
        {PHONES.map((p) => (
          <li key={p.label}>
            <a
              href={`tel:${p.dial}`}
              className="block rounded-2xl bg-[#f4f7fb] px-5 py-4 transition active:scale-[0.99] hover:bg-[#eef3fa]"
            >
              <div className="text-3xl font-extrabold leading-none text-[#1e2a52]">
                {p.number}
              </div>
              <div className="mt-1.5 font-semibold text-[#8190a0]">{p.label}</div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
