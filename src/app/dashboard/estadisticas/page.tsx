import { requireStaff, clientScopeWhere, policyScopeWhere } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import { getCarteraTotal, getStatsBySeller, getStatsByBranch, getStatsByCompany, getRetention } from "@/lib/stats";
import { money, percent } from "@/lib/format";
import { formatDate } from "@/lib/dates";
import { cardClass } from "@/lib/ui";
import { labelFor } from "@/lib/crm-fields";
import { CANCELLATION_REASON } from "@/lib/policy-fields";
import Link from "next/link";
import HomeButton from "@/components/home-button";

export default async function EstadisticasPage() {
  const session = await requireStaff();
  const admin = isAdmin(session.user.role);
  const pWhere = policyScopeWhere(session);
  const cWhere = clientScopeWhere(session);

  const [cartera, byBranch, byCompany, retention, bySeller] = await Promise.all([
    getCarteraTotal(pWhere, cWhere),
    getStatsByBranch(pWhere),
    getStatsByCompany(pWhere),
    getRetention(pWhere),
    admin ? getStatsBySeller() : Promise.resolve(null),
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
        <h1 className="text-lg font-semibold text-gold-300">
          Estadísticas {admin ? "— cartera general" : "— mi cartera"}
        </h1>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-white/90">Cartera total</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Clientes activos" value={cartera.clientsActive} />
            <Stat label="Pólizas vigentes" value={cartera.activePolicies} />
            <Stat label="Pólizas incompletas" value={cartera.incompletePolicies} />
            <Stat label="Premio total (vigentes)" value={money(cartera.totalPremium)} />
            <Stat label="Comisión estimada" value={money(cartera.estimatedCommission)} />
            <Stat label="Renovaciones próximas (30d)" value={cartera.upcomingRenewals} />
          </div>
        </section>

        {bySeller && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-white/90">Por vendedor</h2>
            <div className="overflow-x-auto rounded-xl border border-gold-500/30 bg-navy-900">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-navy-800 text-white/70">
                  <tr>
                    <th className="px-4 py-2 font-medium">Vendedor</th>
                    <th className="px-4 py-2 font-medium">Clientes</th>
                    <th className="px-4 py-2 font-medium">Pólizas vigentes</th>
                    <th className="px-4 py-2 font-medium">Premio</th>
                    <th className="px-4 py-2 font-medium">Comisión</th>
                    <th className="px-4 py-2 font-medium">Vencen 30d</th>
                    <th className="px-4 py-2 font-medium">Seguimientos abiertos</th>
                    <th className="px-4 py-2 font-medium">Tareas pendientes</th>
                  </tr>
                </thead>
                <tbody>
                  {bySeller.map((s) => (
                    <tr key={s.seller.id} className="border-t border-gold-500/20">
                      <td className="px-4 py-2 font-medium text-gold-300">{s.seller.displayName}</td>
                      <td className="px-4 py-2 text-white/80">{s.clientsActive}</td>
                      <td className="px-4 py-2 text-white/80">{s.activePolicies}</td>
                      <td className="px-4 py-2 text-white/80">{money(s.totalPremium)}</td>
                      <td className="px-4 py-2 text-white/80">{money(s.estimatedCommission)}</td>
                      <td className="px-4 py-2 text-white/80">{s.upcomingRenewals}</td>
                      <td className="px-4 py-2 text-white/80">{s.openFollowUps}</td>
                      <td className="px-4 py-2 text-white/80">{s.pendingTasks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-sm font-semibold text-white/90">Por ramo</h2>
          <div className="overflow-x-auto rounded-xl border border-gold-500/30 bg-navy-900">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-navy-800 text-white/70">
                <tr>
                  <th className="px-4 py-2 font-medium">Ramo</th>
                  <th className="px-4 py-2 font-medium">Pólizas</th>
                  <th className="px-4 py-2 font-medium">Premio</th>
                  <th className="px-4 py-2 font-medium">Retención</th>
                </tr>
              </thead>
              <tbody>
                {byBranch.map((b) => (
                  <tr key={b.branch.id} className="border-t border-gold-500/20">
                    <td className="px-4 py-2 font-medium text-gold-300">{b.branch.name}</td>
                    <td className="px-4 py-2 text-white/80">{b.total}</td>
                    <td className="px-4 py-2 text-white/80">{money(b.premium)}</td>
                    <td className="px-4 py-2 text-white/80">{percent(b.retention)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-white/90">Por compañía</h2>
          <div className="overflow-x-auto rounded-xl border border-gold-500/30 bg-navy-900">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-navy-800 text-white/70">
                <tr>
                  <th className="px-4 py-2 font-medium">Compañía</th>
                  <th className="px-4 py-2 font-medium">Pólizas</th>
                  <th className="px-4 py-2 font-medium">Premio</th>
                  <th className="px-4 py-2 font-medium">Retención</th>
                  <th className="px-4 py-2 font-medium">Cliente más antiguo desde</th>
                </tr>
              </thead>
              <tbody>
                {byCompany.map((c) => (
                  <tr key={c.company.id} className="border-t border-gold-500/20">
                    <td className="px-4 py-2 font-medium text-gold-300">{c.company.name}</td>
                    <td className="px-4 py-2 text-white/80">{c.total}</td>
                    <td className="px-4 py-2 text-white/80">{money(c.premium)}</td>
                    <td className="px-4 py-2 text-white/80">{percent(c.retention)}</td>
                    <td className="px-4 py-2 text-white/80">
                      {c.oldestStartDate ? formatDate(c.oldestStartDate) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-white/90">Retención</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="Pólizas renovadas (histórico)" value={retention.renewed} />
            <Stat label="Pólizas perdidas" value={retention.lost} />
            <Stat label="Tasa de retención" value={percent(retention.retentionRate)} />
          </div>
          {retention.cancellationReasons.length > 0 && (
            <div className={`${cardClass} mt-4`}>
              <p className="mb-2 text-sm font-medium text-white/90">Motivos de baja</p>
              <ul className="space-y-1 text-sm text-white/80">
                {retention.cancellationReasons.map((r) => (
                  <li key={r.reason}>
                    {r.count} — {labelFor(CANCELLATION_REASON, r.reason)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={cardClass}>
      <p className="text-sm text-white/70">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gold-300">{value}</p>
    </div>
  );
}
