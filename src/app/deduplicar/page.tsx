import type { Metadata } from "next";
import Header from "@/components/Header";
import DedupeConsole from "@/components/dedupe/DedupeConsole";
import ReviewerLogin from "@/components/dedupe/ReviewerLogin";
import { getReviewer } from "@/lib/reviewer";
import { reviewerSignOut } from "@/app/deduplicar/actions";

export const metadata: Metadata = {
  title: "Deduplicar registros · Venezuela Ayuda",
  description:
    "Consola de revisión para confirmar o descartar registros duplicados de personas reportadas.",
  robots: { index: false, follow: false },
};

// Auth-gated, so the session (cookies) is always read fresh.
export const dynamic = "force-dynamic";

// Operational tool: the working surface (the review console) is the page.
// Wide layout, no marketing hero — just orientation + the queue/detail split.
export default async function DeduplicarPage() {
  const reviewer = await getReviewer();

  if (!reviewer) {
    return (
      <>
        <Header />
        <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
          <ReviewerLogin />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main id="contenido" className="mx-auto w-full max-w-7xl flex-1 px-3 py-3 sm:px-4 sm:py-4">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-x-3 gap-y-1 sm:mb-3">
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-[#14212e] sm:text-xl">
              Deduplicar registros
            </h1>
            {/* Utility orientation, not workflow narration. Hidden on phones to
                give the console more vertical room. */}
            <p className="hidden text-sm text-[#5b6b7b] sm:block">
              Confirma qué reportes son la misma persona, grupo por grupo.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden truncate text-sm text-[#5b6b7b] sm:inline">
              {reviewer.email}
            </span>
            <form action={reviewerSignOut}>
              <button
                type="submit"
                className="rounded-lg border border-[#e6ecf2] px-3 py-1.5 text-sm font-medium text-[#5b6b7b] transition hover:bg-slate-50"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
        <DedupeConsole />
      </main>
    </>
  );
}
