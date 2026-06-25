import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import CheckinForm from "@/components/forms/CheckinForm";

export const metadata: Metadata = {
  title: "Estoy a salvo — Venezuela Ayuda",
  description: "Avisa a tu familia y amigos que estás bien.",
};

export default function Page() {
  return (
    <PageShell
      emoji="✅"
      title="Estoy a salvo"
      intro="Comparte tu estado para tranquilizar a tu familia. Solo toma un momento."
    >
      <CheckinForm />
    </PageShell>
  );
}
