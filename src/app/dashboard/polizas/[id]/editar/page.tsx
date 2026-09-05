import { prisma } from "@/lib/prisma";
import { requireStaff, policyScopeWhere } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import Link from "next/link";
import { notFound } from "next/navigation";
import PolicyForm from "../../policy-form";
import { updatePolicyAction } from "../../actions";

export default async function EditarPolizaPage(props: PageProps<"/dashboard/polizas/[id]/editar">) {
  const session = await requireStaff();
  const { id } = await props.params;

  const policy = await prisma.policy.findFirst({ where: { id, ...policyScopeWhere(session) } });
  if (!policy) notFound();

  const [branches, companies, sellers] = await Promise.all([
    prisma.insuranceBranch.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.insuranceCompany.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.seller.findMany({ where: { isActive: true }, orderBy: { fullName: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <Link href={`/dashboard/polizas/${policy.id}`} className="text-sm text-white/70 hover:underline">
          ← Volver
        </Link>
        <h1 className="text-lg font-semibold text-gold-300">Editar póliza</h1>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <PolicyForm
          action={updatePolicyAction}
          clientId={policy.clientId}
          policy={policy}
          branches={branches}
          companies={companies}
          sellers={sellers}
          lockSellerId={isAdmin(session.user.role) ? null : (session.user.sellerId ?? null)}
          submitLabel="Guardar cambios"
        />
      </main>
    </div>
  );
}
