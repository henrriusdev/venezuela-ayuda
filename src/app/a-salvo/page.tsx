import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("create");

  if (isMissing) {
    return (
      <PageShell
        emoji="🔎"
        title={t("missing.title")}
        intro={t("missing.intro")}
      >
        <CheckinForm initialStatus="LOOKING_FOR_SOMEONE" />
      </PageShell>
    );
  }

  return (
    <PageShell emoji="✅" title={t("safe.title")} intro={t("safe.intro")}>
      <CheckinForm />
    </PageShell>
  );
}
