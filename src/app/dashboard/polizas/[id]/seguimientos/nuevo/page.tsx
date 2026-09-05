import { prisma } from "@/lib/prisma";
import { requireStaff, policyScopeWhere } from "@/lib/authz";
import { notFound } from "next/navigation";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import FollowUpForm from "./form";

export default async function NuevoSeguimientoPage(
  props: PageProps<"/dashboard/polizas/[id]/seguimientos/nuevo">,
) {
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
        <div className="flex items-center justify-between">
          <Link href={`/dashboard/polizas/${policy.id}`} className="text-sm text-white/70 hover:underline">
            ← Volver
          </Link>
          <HomeButton href="/dashboard" />
        </div>
        <h1 className="text-lg font-semibold text-gold-300">
          Nuevo seguimiento — {policy.client.fullNameNormalized} · {policy.branch.name}
        </h1>
      </header>
      <main className="mx-auto max-w-lg px-6 py-8">
        <FollowUpForm policyId={policy.id} />
      </main>
    </div>
  );
}
