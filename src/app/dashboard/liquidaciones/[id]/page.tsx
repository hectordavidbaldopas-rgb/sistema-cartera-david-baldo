import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { money } from "@/lib/format";
import { cardClass, secondaryButtonClass } from "@/lib/ui";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import { requireSettlementAccess, cancelSettlementAction } from "../actions";
import PayForm from "./pay-form";

export default async function LiquidacionDetallePage(props: PageProps<"/dashboard/liquidaciones/[id]">) {
  const { id } = await props.params;
  const { session, settlement } = await requireSettlementAccess(id);
  const admin = isAdmin(session.user.role);

  const items = await prisma.settlementItem.findMany({
    where: { settlementId: id },
    include: {
      commissionRecord: { include: { policy: { include: { client: true, branch: true } } } },
    },
  });
  const seller = await prisma.seller.findUnique({ where: { id: settlement.sellerId } });

  const canManage = admin && settlement.status !== "cancelled" && settlement.status !== "paid";

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/liquidaciones" className="text-sm text-white/70 hover:underline">
            ← Liquidaciones
          </Link>
          <HomeButton href="/dashboard" />
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gold-300">
            {seller?.displayName} — {settlement.periodMonth}/{settlement.periodYear}
          </h1>
          <span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs font-medium text-white/80">
            {settlement.status}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        <div className={`${cardClass} grid grid-cols-2 gap-4 sm:grid-cols-4`}>
          <Field label="Generado" value={money(settlement.generatedAmount)} />
          <Field label="Cobrado" value={money(settlement.collectedAmount)} />
          <Field label="A pagar" value={money(settlement.payableAmount)} />
          <Field label="Pagado" value={money(settlement.paidAmount)} />
        </div>

        {canManage && settlement.paidAmount < settlement.payableAmount && (
          <div className={cardClass}>
            <p className="mb-2 text-sm font-semibold text-white/90">Registrar pago</p>
            <PayForm id={settlement.id} maxAmount={settlement.payableAmount - settlement.paidAmount} />
          </div>
        )}

        {canManage && (
          <form action={cancelSettlementAction}>
            <input type="hidden" name="id" value={settlement.id} />
            <button type="submit" className={secondaryButtonClass}>
              Cancelar liquidación
            </button>
          </form>
        )}

        <div>
          <h2 className="mb-3 text-sm font-semibold text-white/90">Detalle ({items.length} comisiones)</h2>
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className={cardClass}>
                <p className="font-medium text-gold-300">
                  {it.commissionRecord.policy.client.fullNameNormalized} —{" "}
                  {it.commissionRecord.policy.branch.name}
                </p>
                <p className="text-sm text-white/70">
                  {it.commissionRecord.periodMonth}/{it.commissionRecord.periodYear} · Incluido:{" "}
                  {money(it.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-white/50">{label}</dt>
      <dd className="text-lg font-semibold text-gold-300">{value}</dd>
    </div>
  );
}
