import PageShell from "@/components/PageShell";
import DamagedReportForm from "@/components/forms/DamagedReportForm";

export const metadata = {
  title: "Reportar edificio dañado — Venezuela Ayuda",
  description: "Reporta daños estructurales en un edificio o lugar.",
};

export default function Page() {
  return (
    <PageShell
      emoji="🏚️"
      title="Reportar edificio dañado"
      intro="Ayuda a mapear los daños estructurales. Indica el lugar y la gravedad."
    >
      <DamagedReportForm />
    </PageShell>
  );
}
