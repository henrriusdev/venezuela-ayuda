import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PageShell from "@/components/PageShell";
import HelpRequestForm from "@/components/forms/HelpRequestForm";

export const metadata: Metadata = {
  title: "Necesito ayuda — Venezuela Ayuda",
  description: "Pide ayuda médica, agua, comida, refugio, transporte o rescate.",
};

export default async function Page() {
  const t = await getTranslations("create");
  return (
    <PageShell
      emoji="🆘"
      title={t("needHelp.title")}
      intro={t("needHelp.intro")}
    >
      <HelpRequestForm />
    </PageShell>
  );
}
