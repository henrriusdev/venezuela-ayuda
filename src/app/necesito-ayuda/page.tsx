import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import HelpRequestForm from "@/components/forms/HelpRequestForm";

export const metadata: Metadata = {
  title: "Necesito ayuda — Venezuela Ayuda",
  description: "Pide ayuda médica, agua, comida, refugio, transporte o rescate.",
};

export default function Page() {
  return (
    <PageShell
      emoji="🆘"
      title="Necesito ayuda"
      intro="Describe lo que necesitas. Aparecerá en el mapa para rescatistas y voluntarios."
    >
      <HelpRequestForm />
    </PageShell>
  );
}
