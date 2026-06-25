import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import PageShell from "@/components/PageShell";
import HelpAbroadList from "@/components/HelpAbroadList";
import { HELP_ABROAD_CITIES } from "@/lib/helpAbroad";

export const metadata: Metadata = {
  title: "Quiero ayudar fuera de Venezuela — Venezuela Ayuda",
  description:
    "Encuentra en tu ciudad lugares donde puedes ayudar: voluntariado y centros de acopio para la respuesta al terremoto en Venezuela.",
};

export default function Page() {
  const t = useTranslations("abroad");
  return (
    <PageShell wide emoji="🌍" title={t("title")} intro={t("intro")}>
      <HelpAbroadList cities={HELP_ABROAD_CITIES} />
    </PageShell>
  );
}
