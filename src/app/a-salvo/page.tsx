import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import CheckinForm from "@/components/forms/CheckinForm";

export const metadata: Metadata = {
  title: "Estoy a salvo — Venezuela Ayuda",
  description: "Avisa a tu familia y amigos que estás bien.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string }>;
}) {
  const sp = await searchParams;
  const isMissing = sp.modo === "desaparecido";

  if (isMissing) {
    return (
      <PageShell
        emoji="🔎"
        title="Reportar persona desaparecida"
        intro="Indica el nombre y la última ubicación conocida para que otros puedan ayudar a encontrarla."
      >
        <CheckinForm initialStatus="LOOKING_FOR_SOMEONE" />
      </PageShell>
    );
  }

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
