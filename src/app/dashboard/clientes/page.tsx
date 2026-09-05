import { prisma } from "@/lib/prisma";
import { requireStaff, clientScopeWhere } from "@/lib/authz";
import { previewBulkPortalAccess } from "@/lib/portal-bulk";
import { primaryButtonClass } from "@/lib/ui";
import Link from "next/link";
import BulkPortalBox from "./bulk-portal-box";

export default async function ClientesPage() {
  const session = await requireStaff();
  const scope = clientScopeWhere(session);

  const [clients, portalPreview] = await Promise.all([
    prisma.client.findMany({
      where: scope,
      orderBy: { fullNameNormalized: "asc" },
      take: 100,
      include: {
        policies: {
          select: { id: true, status: true, seller: { select: { displayName: true } } },
        },
      },
    }),
    previewBulkPortalAccess(scope),
  ]);

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <Link href="/dashboard" className="text-sm text-white/70 hover:underline">
          ← Volver
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gold-300">
            Cartera de clientes ({clients.length}
            {clients.length === 100 ? "+" : ""})
          </h1>
          <Link href="/dashboard/clientes/nuevo" className={primaryButtonClass}>
            + Nuevo cliente
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <BulkPortalBox candidateCount={portalPreview.candidates.length} skipped={portalPreview.skipped} />
        <div className="overflow-hidden rounded-xl border border-gold-500/30 bg-navy-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-800 text-white/70">
              <tr>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Teléfono</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium">Pólizas</th>
                <th className="px-4 py-2 font-medium">Vendedor</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t border-gold-500/20">
                  <td className="px-4 py-2">
                    <Link
                      href={`/dashboard/clientes/${c.id}`}
                      className="font-medium text-gold-300 underline-offset-4 hover:underline"
                    >
                      {c.fullNameNormalized}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-white/80">{c.phone ?? "—"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.informationStatus === "complete"
                          ? "bg-green-100 text-green-700"
                          : c.informationStatus === "partial"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-navy-800 text-white/80"
                      }`}
                    >
                      {c.informationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-white/80">
                    {c.policies.length}
                  </td>
                  <td className="px-4 py-2 text-white/80">
                    {c.policies[0]?.seller.displayName ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
