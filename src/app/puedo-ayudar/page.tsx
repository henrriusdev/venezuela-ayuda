import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import HelpOfferForm from "@/components/forms/HelpOfferForm";

export const metadata: Metadata = {
  title: "Puedo ayudar — Venezuela Ayuda",
  description: "Ofrece transporte, comida, refugio, atención médica, suministros o traducción.",
};

export default function Page() {
  return (
    <PageShell
      emoji="🙌"
      title="Puedo ayudar"
      intro="Ofrece lo que puedas. Tu oferta aparecerá en el mapa para quienes la necesitan."
    >
      <HelpOfferForm />
    </PageShell>
  );
}
