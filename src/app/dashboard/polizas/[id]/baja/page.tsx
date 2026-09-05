import { prisma } from "@/lib/prisma";
import { requireStaff, policyScopeWhere } from "@/lib/authz";
import Link from "next/link";
import { notFound } from "next/navigation";
import CancelForm from "./form";

export default async function BajaPolizaPage(props: PageProps<"/dashboard/polizas/[id]/baja">) {
  const session = await requireStaff();
  const { id } = await props.params;

  const policy = await prisma.policy.findFirst({
    where: { id, ...policyScopeWhere(session) },
    include: { client: true, branch: true },
  });
  if (!policy) notFound();

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <Link href={`/dashboard/polizas/${policy.id}`} className="text-sm text-white/70 hover:underline">
          ← Volver
        </Link>
        <h1 className="text-lg font-semibold text-gold-300">
          Dar de baja — {policy.client.fullNameNormalized} · {policy.branch.name}
        </h1>
        <p className="text-sm text-white/70">
          La póliza y su historial no se borran — queda marcada como cancelada/perdida.
        </p>
      </header>
      <main className="mx-auto max-w-lg px-6 py-8">
        <CancelForm policyId={policy.id} />
      </main>
    </div>
  );
}
