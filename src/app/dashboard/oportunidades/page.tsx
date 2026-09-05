import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import { cardClass } from "@/lib/ui";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import UpdateStatusSelect from "./update-status-select";

export default async function OportunidadesPage() {
  const session = await requireStaff();
  const admin = isAdmin(session.user.role);

  const opportunities = await prisma.opportunity.findMany({
    where: admin ? {} : { sellerId: session.user.sellerId ?? "__none__" },
    include: { client: true, seller: true, branch: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-white/70 hover:underline">
            ← Volver
          </Link>
          <HomeButton href="/dashboard" />
        </div>
        <h1 className="text-lg font-semibold text-gold-300">
          Oportunidades ({opportunities.length})
        </h1>
        <p className="text-sm text-white/70">
          Se generan solas cuando un cliente responde una encuesta marcando interés en un ramo
          que todavía no tiene.
        </p>
      </header>
      <main className="mx-auto max-w-3xl space-y-2 px-6 py-8">
        {opportunities.map((o) => (
          <div key={o.id} className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/dashboard/clientes/${o.clientId}`} className="font-medium text-gold-300 hover:underline">
                  {o.title}
                </Link>
                <p className="text-sm text-white/70">
                  {o.client.fullNameNormalized}
                  {admin ? ` · ${o.seller.displayName}` : ""}
                  {o.branch ? ` · ${o.branch.name}` : ""}
                </p>
              </div>
              <UpdateStatusSelect id={o.id} status={o.status} />
            </div>
          </div>
        ))}
        {opportunities.length === 0 && (
          <p className="text-sm text-white/70">No hay oportunidades todavía.</p>
        )}
      </main>
    </div>
  );
}
