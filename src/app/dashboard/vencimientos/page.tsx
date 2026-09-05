import { prisma } from "@/lib/prisma";
import { requireStaff, policyScopeWhere } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import { cardClass, inputClass, labelClass } from "@/lib/ui";
import { expiryLabel, expiryLevel, EXPIRY_BADGE_CLASS } from "@/lib/expiry";
import { POLICY_STATUS } from "@/lib/policy-fields";
import Link from "next/link";
import type { Prisma } from "@prisma/client";

export default async function VencimientosPage(props: PageProps<"/dashboard/vencimientos">) {
  const session = await requireStaff();
  const admin = isAdmin(session.user.role);
  const searchParams = await props.searchParams;

  const sellerId = admin ? asString(searchParams.vendedor) : undefined;
  const branchId = asString(searchParams.ramo);
  const companyId = asString(searchParams.compania);
  const status = asString(searchParams.estado);
  const from = asString(searchParams.desde);
  const to = asString(searchParams.hasta);

  const where: Prisma.PolicyWhereInput = {
    ...policyScopeWhere(session),
    endDate: {
      not: null,
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    },
    status: status ? status : { notIn: ["cancelled", "lost"] },
    ...(sellerId ? { sellerId } : {}),
    ...(branchId ? { branchId } : {}),
    ...(companyId ? { companyId } : {}),
  };

  const [policies, sellers, branches, companies] = await Promise.all([
    prisma.policy.findMany({
      where,
      include: { client: true, branch: true, company: true, seller: true },
      orderBy: { endDate: "asc" },
      take: 200,
    }),
    admin ? prisma.seller.findMany({ where: { isActive: true }, orderBy: { fullName: "asc" } }) : Promise.resolve([]),
    prisma.insuranceBranch.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.insuranceCompany.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <Link href="/dashboard" className="text-sm text-white/70 hover:underline">
          ← Volver
        </Link>
        <h1 className="text-lg font-semibold text-gold-300">
          Vencimientos ({policies.length})
        </h1>
        <p className="text-sm text-white/70">Ordenado por fecha más próxima.</p>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-6 py-8">
        <form method="get" className={`${cardClass} grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6`}>
          {admin && (
            <div>
              <label className={labelClass}>Vendedor</label>
              <select name="vendedor" defaultValue={sellerId ?? ""} className={inputClass}>
                <option value="">Todos</option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.displayName}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className={labelClass}>Ramo</label>
            <select name="ramo" defaultValue={branchId ?? ""} className={inputClass}>
              <option value="">Todos</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Compañía</label>
            <select name="compania" defaultValue={companyId ?? ""} className={inputClass}>
              <option value="">Todas</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <select name="estado" defaultValue={status ?? ""} className={inputClass}>
              <option value="">Todos (activos)</option>
              {POLICY_STATUS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Desde</label>
            <input name="desde" type="date" defaultValue={from ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Hasta</label>
            <input name="hasta" type="date" defaultValue={to ?? ""} className={inputClass} />
          </div>
          <div className="col-span-2 flex items-end gap-2 sm:col-span-3 lg:col-span-6">
            <button type="submit" className="rounded-full bg-[image:var(--gradient-gold)] px-4 py-2 text-sm font-semibold text-navy-950 shadow-sm transition hover:brightness-105">
              Filtrar
            </button>
            <Link href="/dashboard/vencimientos" className="text-sm text-white/70 underline">
              Limpiar filtros
            </Link>
          </div>
        </form>

        <div className="space-y-2">
          {policies.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/polizas/${p.id}`}
              className={`${cardClass} flex items-center justify-between transition hover:border-gold-500/40`}
            >
              <div>
                <p className="font-medium text-gold-300">
                  {p.client.fullNameNormalized} — {p.branch.name}
                </p>
                <p className="text-sm text-white/70">
                  {p.company?.name ?? "Compañía a confirmar"}
                  {admin ? ` · Vendedor: ${p.seller.displayName}` : ""}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${EXPIRY_BADGE_CLASS[expiryLevel(p.endDate)]}`}
              >
                {expiryLabel(p.endDate)}
              </span>
            </Link>
          ))}
          {policies.length === 0 && (
            <p className="text-sm text-white/70">No hay pólizas que cumplan estos filtros.</p>
          )}
        </div>
      </main>
    </div>
  );
}

function asString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v || undefined;
}
