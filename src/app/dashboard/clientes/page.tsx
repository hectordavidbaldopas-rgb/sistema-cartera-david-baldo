import { prisma } from "@/lib/prisma";
import { requireStaff, clientScopeWhere } from "@/lib/authz";
import { previewBulkPortalAccess } from "@/lib/portal-bulk";
import { primaryButtonClass, inputClass, labelClass } from "@/lib/ui";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import BulkPortalBox from "./bulk-portal-box";
import type { Prisma } from "@prisma/client";

function asString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v || undefined;
}

function formatLastLogin(d: Date | null | undefined): string {
  if (!d) return "Nunca";
  return new Date(d).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ClientesPage(props: PageProps<"/dashboard/clientes">) {
  const session = await requireStaff();
  const scope = clientScopeWhere(session);
  const searchParams = await props.searchParams;

  const q = asString(searchParams.q)?.trim();
  const onlyPortal = asString(searchParams.portal) === "1";

  const where: Prisma.ClientWhereInput = {
    AND: [
      scope,
      q ? { fullNameNormalized: { contains: q, mode: "insensitive" } } : {},
      onlyPortal ? { clientAccount: { lastLoginAt: { not: null } } } : {},
    ],
  };

  const [clients, portalPreview] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: onlyPortal
        ? { clientAccount: { lastLoginAt: "desc" } }
        : { fullNameNormalized: "asc" },
      take: 1000,
      include: {
        policies: {
          select: { id: true, status: true, seller: { select: { displayName: true } } },
        },
        clientAccount: { select: { lastLoginAt: true } },
      },
    }),
    previewBulkPortalAccess(scope),
  ]);

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-white/70 hover:underline">
            ← Volver
          </Link>
          <HomeButton href="/dashboard" />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gold-300">
            Cartera de clientes ({clients.length})
          </h1>
          <Link href="/dashboard/clientes/nuevo" className={primaryButtonClass}>
            + Nuevo cliente
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <BulkPortalBox candidateCount={portalPreview.candidates.length} skipped={portalPreview.skipped} />

        <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className={labelClass}>Buscar por nombre</label>
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Ej: Abriata Carlos"
              className={inputClass}
            />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm text-white/80">
            <input type="checkbox" name="portal" value="1" defaultChecked={onlyPortal} className="h-4 w-4" />
            Solo quienes ingresaron al portal
          </label>
          <button
            type="submit"
            className="rounded-full bg-[image:var(--gradient-gold)] px-4 py-2 text-sm font-semibold text-navy-950 shadow-sm transition hover:brightness-105"
          >
            Buscar
          </button>
          {(q || onlyPortal) && (
            <Link href="/dashboard/clientes" className="pb-2 text-sm text-white/70 underline">
              Limpiar
            </Link>
          )}
        </form>

        <div className="overflow-hidden rounded-xl border border-gold-500/30 bg-navy-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-800 text-white/70">
              <tr>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Teléfono</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium">Último ingreso al portal</th>
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
                    {formatLastLogin(c.clientAccount?.lastLoginAt)}
                  </td>
                  <td className="px-4 py-2 text-white/80">
                    {c.policies.length}
                  </td>
                  <td className="px-4 py-2 text-white/80">
                    {c.policies[0]?.seller.displayName ?? "—"}
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-white/60">
                    No se encontraron clientes con esos criterios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
