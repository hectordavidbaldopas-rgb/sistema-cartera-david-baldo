import { prisma } from "@/lib/prisma";
import { requireStaff, clientScopeWhere } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import Link from "next/link";
import { notFound } from "next/navigation";
import PolicyForm from "@/app/dashboard/polizas/policy-form";
import { createPolicyAction } from "@/app/dashboard/polizas/actions";

export default async function NuevaPolizaPage(
  props: PageProps<"/dashboard/clientes/[id]/polizas/nuevo">,
) {
  const session = await requireStaff();
  const { id } = await props.params;

  const client = await prisma.client.findFirst({
    where: { id, ...clientScopeWhere(session) },
  });
  if (!client) notFound();

  const [branches, companies, sellers] = await Promise.all([
    prisma.insuranceBranch.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.insuranceCompany.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.seller.findMany({ where: { isActive: true }, orderBy: { fullName: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <Link href={`/dashboard/clientes/${client.id}`} className="text-sm text-white/70 hover:underline">
          ← {client.fullNameNormalized}
        </Link>
        <h1 className="text-lg font-semibold text-gold-300">Nueva póliza</h1>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <PolicyForm
          action={createPolicyAction}
          clientId={client.id}
          branches={branches}
          companies={companies}
          sellers={sellers}
          lockSellerId={isAdmin(session.user.role) ? null : (session.user.sellerId ?? null)}
          submitLabel="Crear póliza"
        />
      </main>
    </div>
  );
}
