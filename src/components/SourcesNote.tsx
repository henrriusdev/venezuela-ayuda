// Transparency note: explains that some records are aggregated from allied
// citizen efforts and refreshed automatically.
export default function SourcesNote() {
  return (
    <p className="mt-6 rounded-xl bg-slate-100 p-3 text-center text-xs leading-relaxed text-[#5b6b7b]">
      🌐 Incluye datos de esfuerzos ciudadanos aliados —{" "}
      <a href="https://venezuelatebusca.com" target="_blank" rel="noopener noreferrer" className="underline">
        venezuelatebusca.com
      </a>
      ,{" "}
      <a href="https://desaparecidosterremotovenezuela.com" target="_blank" rel="noopener noreferrer" className="underline">
        desaparecidosterremotovenezuela.com
      </a>
      ,{" "}
      <a href="https://terremotovenezuela.com" target="_blank" rel="noopener noreferrer" className="underline">
        terremotovenezuela.com
      </a>
      ,{" "}
      <a href="https://terremotovenezuela.app" target="_blank" rel="noopener noreferrer" className="underline">
        .app
      </a>{" "}
      y más — integrados y atribuidos automáticamente cada 6 horas. La información
      externa se muestra como «sin verificar».
    </p>
  );
}
