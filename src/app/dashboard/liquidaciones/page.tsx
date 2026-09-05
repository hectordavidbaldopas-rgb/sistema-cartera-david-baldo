import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import { money } from "@/lib/format";
import { cardClass } from "@/lib/ui";
import Link from "next/link";
import NewSettlementForm from "./new-settlement-form";

export default async function LiquidacionesPage() {
  const session = await requireStaff();
  const admin = isAdmin(session.user.role);

  const [settlements, sellers] = await Promise.all([
    prisma.sellerSettlement.findMany({
      where: admin ? {} : { sellerId: session.user.sellerId ?? "__none__" },
      include: { seller: true },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
    }),
    admin ? prisma.seller.findMany({ where: { isActive: true }, orderBy: { fullName: "asc" } }) : Promise.resolve([]),
  ]);

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <Link href="/dashboard" className="text-sm text-white/70 hover:underline">
          ← Volver
        </Link>
        <h1 className="text-lg font-semibold text-gold-300">Liquidaciones</h1>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        {admin && <NewSettlementForm sellers={sellers} />}

        <div className="space-y-2">
          {settlements.map((s) => (
            <Link
              key={s.id}
              href={`/dashboard/liquidaciones/${s.id}`}
              className={`${cardClass} block transition hover:border-gold-500/40`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gold-300">
                    {s.seller.displayName} — {s.periodMonth}/{s.periodYear}
                  </p>
                  <p className="text-sm text-white/70">
                    A pagar {money(s.payableAmount)} · Pagado {money(s.paidAmount)}
                  </p>
                </div>
                <span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs text-white/80">{s.status}</span>
              </div>
            </Link>
          ))}
          {settlements.length === 0 && <p className="text-sm text-white/70">No hay liquidaciones todavía.</p>}
        </div>
      </main>
    </div>
  );
}
