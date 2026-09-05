import { prisma } from "@/lib/prisma";
import { requireStaff, clientScopeWhere } from "@/lib/authz";
import { previewBulkPortalAccess } from "@/lib/portal-bulk";
import { primaryButtonClass, inputClass, labelClass } from "@/lib/ui";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import BulkPortalBox from "./bulk-portal-box";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 25;

const PORTAL_STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "not_sent", label: "Todavía no le mandamos el link" },
  { value: "pending", label: "Enviado, esperando que entre" },
  { value: "logged_in", label: "Ya ingresó al portal" },
] as const;

type PortalStatus = (typeof PORTAL_STATUS_OPTIONS)[number]["value"];

function asString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v || undefined;
}

function pageHref(page: number, q: string | undefined, portalStatus: string): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (portalStatus) params.set("portalStatus", portalStatus);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/dashboard/clientes?${qs}` : "/dashboard/clientes";
}

function formatDateTime(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function portalStatusLabel(c: {
  phone: string | null;
  clientAccount: { lastLoginAt: Date | null; inviteLinkSentAt: Date | null; inviteLinkSentCount: number } | null;
}): { text: string; className: string } {
  if (c.clientAccount?.lastLoginAt) {
    return {
      text: `Ingresó: ${formatDateTime(c.clientAccount.lastLoginAt)}`,
      className: "bg-green-100 text-green-700",
    };
  }
  if (c.clientAccount && c.clientAccount.inviteLinkSentCount > 0) {
    return {
      text: `Enviado ${formatDateTime(c.clientAccount.inviteLinkSentAt)} — sin responder`,
      className: "bg-amber-100 text-amber-700",
    };
  }
  if (c.clientAccount) {
    return { text: "Acceso generado, sin enviar", className: "bg-navy-800 text-white/80" };
  }
  if (!c.phone) {
    return { text: "Sin teléfono", className: "bg-navy-800 text-white/50" };
  }
  return { text: "Sin enviar todavía", className: "bg-navy-800 text-white/80" };
}

export default async function ClientesPage(props: PageProps<"/dashboard/clientes">) {
  const session = await requireStaff();
  const scope = clientScopeWhere(session);
  const searchParams = await props.searchParams;

  const q = asString(searchParams.q)?.trim();
  const portalStatus = (asString(searchParams.portalStatus) ?? "") as PortalStatus;
  const page = Math.max(1, Number(asString(searchParams.page)) || 1);

  const portalFilter: Prisma.ClientWhereInput =
    portalStatus === "logged_in"
      ? { clientAccount: { lastLoginAt: { not: null } } }
      : portalStatus === "pending"
        ? { clientAccount: { lastLoginAt: null, inviteLinkSentCount: { gt: 0 } } }
        : portalStatus === "not_sent"
          ? {
              OR: [
                { clientAccount: null },
                { clientAccount: { lastLoginAt: null, inviteLinkSentCount: 0 } },
              ],
            }
          : {};

  const where: Prisma.ClientWhereInput = {
    AND: [
      scope,
      q ? { fullNameNormalized: { contains: q, mode: "insensitive" } } : {},
      portalFilter,
    ],
  };

  const orderBy: Prisma.ClientOrderByWithRelationInput =
    portalStatus === "logged_in"
      ? { clientAccount: { lastLoginAt: "desc" } }
      : portalStatus === "pending"
        ? { clientAccount: { inviteLinkSentAt: "asc" } }
        : { fullNameNormalized: "asc" };

  const [totalCount, clients, portalPreview] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        policies: {
          select: { id: true, status: true, seller: { select: { displayName: true } } },
        },
        clientAccount: {
          select: { lastLoginAt: true, inviteLinkSentAt: true, inviteLinkSentCount: true },
        },
      },
    }),
    previewBulkPortalAccess(scope),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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
            Cartera de clientes ({totalCount})
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
          <div className="min-w-[240px]">
            <label className={labelClass}>Estado del portal</label>
            <select name="portalStatus" defaultValue={portalStatus} className={inputClass}>
              {PORTAL_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-full bg-[image:var(--gradient-gold)] px-4 py-2 text-sm font-semibold text-navy-950 shadow-sm transition duration-150 hover:brightness-105 active:translate-y-px active:shadow-none active:brightness-95"
          >
            Buscar
          </button>
          {(q || portalStatus) && (
            <Link href="/dashboard/clientes" className="pb-2 text-sm text-white/70 underline">
              Limpiar
            </Link>
          )}
        </form>

        <div className="overflow-x-auto rounded-xl border border-gold-500/30 bg-navy-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-800 text-white/70">
              <tr>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Teléfono</th>
                <th className="px-4 py-2 font-medium">Datos</th>
                <th className="px-4 py-2 font-medium">Portal</th>
                <th className="px-4 py-2 font-medium">Pólizas</th>
                <th className="px-4 py-2 font-medium">Vendedor</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const portal = portalStatusLabel(c);
                return (
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
                    <td className="px-4 py-2">
                      <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${portal.className}`}>
                        {portal.text}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-white/80">
                      {c.policies.length}
                    </td>
                    <td className="px-4 py-2 text-white/80">
                      {c.policies[0]?.seller.displayName ?? "—"}
                    </td>
                  </tr>
                );
              })}
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

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1, q, portalStatus)}
                className="rounded-full border border-gold-500/40 px-4 py-2 text-sm font-medium text-gold-300 transition duration-150 hover:border-gold-400 hover:bg-gold-500/10 active:translate-y-px active:bg-gold-500/20"
              >
                ← Anterior
              </Link>
            ) : (
              <span className="rounded-full border border-gold-500/10 px-4 py-2 text-sm font-medium text-white/30">
                ← Anterior
              </span>
            )}
            <span className="text-sm text-white/70">
              Página {page} de {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={pageHref(page + 1, q, portalStatus)}
                className="rounded-full border border-gold-500/40 px-4 py-2 text-sm font-medium text-gold-300 transition duration-150 hover:border-gold-400 hover:bg-gold-500/10 active:translate-y-px active:bg-gold-500/20"
              >
                Siguiente →
              </Link>
            ) : (
              <span className="rounded-full border border-gold-500/10 px-4 py-2 text-sm font-medium text-white/30">
                Siguiente →
              </span>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
