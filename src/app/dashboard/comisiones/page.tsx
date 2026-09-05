import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import { previewCommissionGeneration } from "@/lib/commissions";
import { money } from "@/lib/format";
import { cardClass, inputClass, labelClass } from "@/lib/ui";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import GenerateBox from "./generate-box";
import CollectForm from "./collect-form";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function asNumber(v: string | string[] | undefined, fallback: number): number {
  const s = Array.isArray(v) ? v[0] : v;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default async function ComisionesPage(props: PageProps<"/dashboard/comisiones">) {
  const session = await requireStaff();
  const admin = isAdmin(session.user.role);
  const searchParams = await props.searchParams;

  const now = new Date();
  const periodMonth = asNumber(searchParams.mes, now.getMonth() + 1);
  const periodYear = asNumber(searchParams.anio, now.getFullYear());

  const sellerFilter = admin ? {} : { sellerId: session.user.sellerId ?? "__none__" };

  const [records, sellers, candidates] = await Promise.all([
    prisma.commissionRecord.findMany({
      where: { ...sellerFilter, periodMonth, periodYear },
      include: { policy: { include: { branch: true, client: true } }, seller: true },
      orderBy: { generatedAmount: "desc" },
    }),
    admin ? prisma.seller.findMany({ where: { isActive: true }, orderBy: { fullName: "asc" } }) : Promise.resolve([]),
    admin ? previewCommissionGeneration(periodMonth, periodYear, null) : Promise.resolve([]),
  ]);

  const totals = records.reduce(
    (acc, r) => ({
      generated: acc.generated + r.generatedAmount,
      collected: acc.collected + r.collectedAmount,
      pending: acc.pending + r.pendingAmount,
    }),
    { generated: 0, collected: 0, pending: 0 },
  );

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
          Comisiones — {MONTH_NAMES[periodMonth - 1]} {periodYear}
        </h1>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <form method="get" className={`${cardClass} flex flex-wrap items-end gap-3`}>
          <div>
            <label className={labelClass}>Mes</label>
            <select name="mes" defaultValue={periodMonth} className={inputClass}>
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Año</label>
            <input name="anio" type="number" defaultValue={periodYear} className={`${inputClass} w-24`} />
          </div>
          <button type="submit" className="rounded-full bg-[image:var(--gradient-gold)] px-4 py-2 text-sm font-semibold text-navy-950 shadow-sm transition duration-150 hover:brightness-105 active:translate-y-px active:shadow-none active:brightness-95">
            Ver
          </button>
        </form>

        <div className="grid grid-cols-3 gap-4">
          <Stat label="Generada" value={money(totals.generated)} />
          <Stat label="Cobrada" value={money(totals.collected)} />
          <Stat label="Pendiente de cobro" value={money(totals.pending)} />
        </div>

        {admin && (
          <GenerateBox periodMonth={periodMonth} periodYear={periodYear} sellers={sellers} candidateCount={candidates.length} />
        )}

        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className={cardClass}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gold-300">
                    {r.policy.client.fullNameNormalized} — {r.policy.branch.name}
                  </p>
                  <p className="text-sm text-white/70">
                    {admin ? `${r.seller.displayName} · ` : ""}
                    Prima {money(r.premiumBase)} × {(r.commissionPercentage * 100).toFixed(0)}% ={" "}
                    {money(r.generatedAmount)}
                  </p>
                  <p className="text-sm text-white/70">
                    Cobrado {money(r.collectedAmount)} · Pendiente {money(r.pendingAmount)} ·{" "}
                    <span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs">{r.status}</span>
                  </p>
                </div>
                {r.pendingAmount > 0 && <CollectForm id={r.id} maxAmount={r.pendingAmount} />}
              </div>
            </div>
          ))}
          {records.length === 0 && (
            <p className="text-sm text-white/70">No hay comisiones generadas para este período.</p>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cardClass}>
      <p className="text-sm text-white/70">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gold-300">{value}</p>
    </div>
  );
}
