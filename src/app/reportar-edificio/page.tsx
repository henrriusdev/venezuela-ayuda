import { getTranslations } from "next-intl/server";
import PageShell from "@/components/PageShell";
import DamagedReportForm from "@/components/forms/DamagedReportForm";

export const metadata = {
  title: "Reportar edificio dañado — Venezuela Ayuda",
  description: "Reporta daños estructurales en un edificio o lugar.",
};

export default async function Page() {
  const t = await getTranslations("create");
  return (
    <PageShell
      emoji="🏚️"
      title={t("report.title")}
      intro={t("report.intro")}
    >
      <DamagedReportForm />
    </PageShell>
  );
}
