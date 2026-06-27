import Link from "next/link";
import Header from "@/components/Header";
import AdminLogin from "@/components/admin/AdminLogin";
import DamagedAdminRow from "@/components/admin/DamagedAdminRow";
import ModerationRow from "@/components/admin/ModerationRow";
import CenterAdminRow from "@/components/admin/CenterAdminRow";
import {
  getAdminSession,
  listDamagedReportsAdmin,
  listModerationItems,
  listCollectionCentersAdmin,
} from "@/lib/admin";
import { adminSignOut } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

type AdminTab = "centros" | "danados" | "moderacion";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getAdminSession();

  if (!session) {
    return (
      <>
        <Header />
        <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
          <AdminLogin />
        </main>
      </>
    );
  }

  const { email, isSuper } = session;
  const [damaged, mod, centers] = await Promise.all([
    listDamagedReportsAdmin(),
    listModerationItems(),
    listCollectionCentersAdmin(),
  ]);
  const pendingCenters = centers.filter((c) => !c.verified).length;

  const sp = await searchParams;
  const tab: AdminTab =
    sp.tab === "danados" || sp.tab === "moderacion" ? sp.tab : "centros";
  const TABS: Array<{ value: AdminTab; label: string; badge?: number }> = [
    { value: "centros", label: "Centros de acopio", badge: pendingCenters || undefined },
    { value: "danados", label: "Edificios dañados", badge: damaged.length || undefined },
    { value: "moderacion", label: "Moderación", badge: mod.length || undefined },
  ];

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e6ecf2] bg-white p-4">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-[#14212e]">
              🛡️ Panel de administración
            </h1>
            <p className="mt-0.5 flex items-center gap-2 truncate text-sm text-[#5b6b7b]">
              {email}
              {isSuper && (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700">
                  super-admin
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSuper && (
              <>
                <Link
                  href="/admin/ingesta"
                  className="rounded-lg border border-[#e6ecf2] px-3 py-2 text-sm font-medium text-[#14212e] transition hover:bg-slate-50"
                >
                  Ingesta
                </Link>
                <Link
                  href="/admin/colaboradores"
                  className="rounded-lg border border-[#e6ecf2] px-3 py-2 text-sm font-medium text-[#14212e] transition hover:bg-slate-50"
                >
                  Colaboradores
                </Link>
                <Link
                  href="/admin/admins"
                  className="rounded-lg border border-[#e6ecf2] px-3 py-2 text-sm font-medium text-[#14212e] transition hover:bg-slate-50"
                >
                  Administradores
                </Link>
              </>
            )}
            <form action={adminSignOut}>
              <button
                type="submit"
                className="rounded-lg border border-[#e6ecf2] px-3 py-2 text-sm font-medium text-[#5b6b7b] transition hover:bg-slate-50"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>

        {/* Tabs — switch category to validate without scrolling a long page */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-[#e6ecf2] pb-2">
          {TABS.map((t) => {
            const active = tab === t.value;
            return (
              <Link
                key={t.value}
                href={t.value === "centros" ? "/admin" : `/admin?tab=${t.value}`}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-[#2563a8] text-white"
                    : "text-[#5b6b7b] hover:bg-slate-50"
                }`}
              >
                {t.label}
                {t.badge != null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      active ? "bg-white/25 text-white" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {tab === "centros" && (
          <section className="mt-6">
            {centers.length === 0 ? (
              <p className="mt-3 text-sm text-[#8190a0]">No hay centros de acopio.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {centers.map((c) => (
                  <CenterAdminRow item={c} key={c.id} />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "danados" && (
          <section className="mt-6">
            {damaged.length === 0 ? (
              <p className="mt-3 text-sm text-[#8190a0]">
                No hay reportes de edificios dañados.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {damaged.map((d) => (
                  <DamagedAdminRow item={d} key={d.id} />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "moderacion" && (
          <section className="mt-6">
            {mod.length === 0 ? (
              <p className="mt-3 text-sm text-[#8190a0]">
                No hay reportes recientes.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {mod.map((m) => (
                  <ModerationRow item={m} key={m.table + m.id} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}
