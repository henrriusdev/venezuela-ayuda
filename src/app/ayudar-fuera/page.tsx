import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import HelpAbroadList from "@/components/HelpAbroadList";
import { HELP_ABROAD_CITIES } from "@/lib/helpAbroad";

export const metadata: Metadata = {
  title: "Quiero ayudar fuera de Venezuela — Venezuela Ayuda",
  description:
    "Encuentra en tu ciudad lugares donde puedes ayudar: voluntariado y centros de acopio para la respuesta al terremoto en Venezuela.",
};

export default function Page() {
  return (
    <PageShell
      wide
      emoji="🌍"
      title="Quiero ayudar fuera de Venezuela"
      intro="Busca tu ciudad y encuentra lugares donde sumarte como voluntario o llevar donaciones a un centro de acopio."
    >
      <HelpAbroadList cities={HELP_ABROAD_CITIES} />
    </PageShell>
  );
}
