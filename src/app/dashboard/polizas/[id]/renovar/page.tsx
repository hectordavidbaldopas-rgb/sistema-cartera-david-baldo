import { prisma } from "@/lib/prisma";
import { requireStaff, policyScopeWhere } from "@/lib/authz";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import { notFound } from "next/navigation";
import RenewForm from "./form";

export default async function RenovarPolizaPage(props: PageProps<"/dashboard/polizas/[id]/renovar">) {
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
          Renovar — {policy.client.fullNameNormalized} · {policy.branch.name}
        </h1>
        <p className="text-sm text-white/70">
          Esto crea una nueva versión histórica y actualiza la vigencia de la póliza. No se pierde
          lo cargado antes.
        </p>
      </header>
      <main className="mx-auto max-w-lg px-6 py-8">
        <RenewForm policy={policy} />
      </main>
    </div>
  );
}
