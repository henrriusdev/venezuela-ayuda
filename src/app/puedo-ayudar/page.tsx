import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import PageShell from "@/components/PageShell";
import HelpOfferForm from "@/components/forms/HelpOfferForm";

export const metadata: Metadata = {
  title: "Puedo ayudar — Venezuela Ayuda",
  description: "Ofrece transporte, comida, refugio, atención médica, suministros o traducción.",
};

export default async function Page() {
  const t = await getTranslations("create");
  return (
    <PageShell
      emoji="🙌"
      title={t("canHelp.title")}
      intro={t("canHelp.intro")}
    >
      <Link
        href="/solicitudes"
        className="mb-4 inline-block font-semibold text-[#2563a8]"
      >
        {t("canHelp.seeRequests")}
      </Link>
      <HelpOfferForm />
    </PageShell>
  );
}
