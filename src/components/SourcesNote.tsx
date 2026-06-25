import { useTranslations } from "next-intl";

// Transparency note: explains that some records are aggregated from allied
// citizen efforts and refreshed automatically.
export default function SourcesNote() {
  const t = useTranslations("search");
  return (
    <p className="mt-6 rounded-xl bg-slate-100 p-3 text-center text-xs leading-relaxed text-[#5b6b7b]">
      {t("sourcesIntro")}{" "}
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
      {t("sourcesOutro")}
    </p>
  );
}
