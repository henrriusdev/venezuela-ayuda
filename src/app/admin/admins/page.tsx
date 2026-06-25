import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import AdminManager from "@/components/admin/AdminManager";
import { getAdminEmail, listAdmins } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const email = await getAdminEmail();
  if (!email) redirect("/admin");

  const admins = await listAdmins();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#2563a8] hover:underline"
        >
          ← Volver al panel
        </Link>
        <h1 className="mt-3 text-xl font-bold text-[#14212e]">
          Administradores
        </h1>
        <div className="mt-5">
          <AdminManager admins={admins} currentEmail={email} />
        </div>
      </main>
    </>
  );
}
