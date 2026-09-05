import { prisma } from "@/lib/prisma";
import { requireStaff, clientScopeWhere } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import { EXPIRY_THRESHOLDS } from "@/lib/expiry";
import LogoutButton from "../logout-button";
import { LogoMark } from "@/components/logo";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await requireStaff();
  const role = session.user.role;
  const sellerId = session.user.sellerId;

  const admin = isAdmin(role);
  const sellerFilter = admin ? {} : { sellerId: sellerId ?? "__none__" };

  const soon = new Date();
  soon.setDate(soon.getDate() + EXPIRY_THRESHOLDS.warningDays);

  const [clientCount, policyCount, draftPolicyCount, expiringSoonCount, sellers] = await Promise.all([
    prisma.client.count({ where: clientScopeWhere(session) }),
    prisma.policy.count({ where: sellerFilter }),
    prisma.policy.count({ where: { ...sellerFilter, status: "draft" } }),
    prisma.policy.count({
      where: {
        ...sellerFilter,
        endDate: { lte: soon },
        status: { notIn: ["cancelled", "lost"] },
      },
    }),
    admin ? prisma.seller.findMany({ orderBy: { fullName: "asc" } }) : Promise.resolve([]),
  ]);

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="bg-texture-navy flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <LogoMark size={40} />
          <div>
            <h1 className="text-lg font-bold text-gold-300">
              {admin ? "Panel general" : "Mi cartera"}
            </h1>
            <p className="text-sm text-white/70">
              {session.user.name} · {admin ? "Administrador" : "Vendedor"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {admin && (
            <Link href="/admin/vendedores" className="text-sm text-white/80 hover:text-white hover:underline">
              Administración
            </Link>
          )}
          <Link href="/dashboard/mi-cuenta" className="text-sm text-white/80 hover:text-white hover:underline">
            Mi cuenta
          </Link>
          <LogoutButton variant="dark" />
        </div>
      </header>
      <div className="divider-gold" />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/clientes/nuevo"
            className="flex items-center gap-4 rounded-xl border border-gold-500/30 bg-navy-900 p-6 transition hover:border-gold-500/50 hover:shadow-sm"
          >
            <span className="text-4xl">👤</span>
            <span>
              <span className="block text-lg font-semibold text-gold-300">Crear nuevo cliente</span>
              <span className="block text-sm text-white/70">Cargar un cliente nuevo en la cartera</span>
            </span>
          </Link>
          <Link
            href="/dashboard/polizas/nuevo"
            className="flex items-center gap-4 rounded-xl border border-gold-500/30 bg-navy-900 p-6 transition hover:border-gold-500/50 hover:shadow-sm"
          >
            <span className="text-4xl">📄</span>
            <span>
              <span className="block text-lg font-semibold text-gold-300">Cargar nueva póliza</span>
              <span className="block text-sm text-white/70">Agregar una cobertura a un cliente</span>
            </span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StatCard label="Clientes" value={clientCount} />
          <StatCard label="Pólizas" value={policyCount} />
          <StatCard label="Pólizas incompletas (draft)" value={draftPolicyCount} />
          <Link href="/dashboard/vencimientos" className="block">
            <StatCard label="Vencidas o por vencer (30d)" value={expiringSoonCount} highlight={expiringSoonCount > 0} />
          </Link>
        </div>

        {admin && sellers.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-white/90">
              Vendedores
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {sellers.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/vendedores/${s.id}`}
                  className="rounded-xl border border-gold-500/30 bg-navy-900 p-4 transition hover:border-gold-500/40"
                >
                  <p className="font-medium text-gold-300">{s.fullName}</p>
                  <p className="text-sm text-white/70">{s.locality ?? "—"}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-6">
          <Link
            href="/dashboard/clientes"
            className="text-sm font-medium text-gold-300 underline underline-offset-4"
          >
            Ver cartera de clientes →
          </Link>
          <Link
            href="/dashboard/vencimientos"
            className="text-sm font-medium text-gold-300 underline underline-offset-4"
          >
            Ver vencimientos →
          </Link>
          <Link
            href="/dashboard/seguimientos"
            className="text-sm font-medium text-gold-300 underline underline-offset-4"
          >
            Ver seguimientos →
          </Link>
          <Link
            href="/dashboard/tareas"
            className="text-sm font-medium text-gold-300 underline underline-offset-4"
          >
            Centro de tareas →
          </Link>
          <Link
            href="/dashboard/estadisticas"
            className="text-sm font-medium text-gold-300 underline underline-offset-4"
          >
            Ver estadísticas →
          </Link>
          <Link
            href="/dashboard/importar"
            className="text-sm font-medium text-gold-300 underline underline-offset-4"
          >
            Importar Excel →
          </Link>
          <Link
            href="/dashboard/oportunidades"
            className="text-sm font-medium text-gold-300 underline underline-offset-4"
          >
            Oportunidades →
          </Link>
          <Link
            href="/dashboard/comisiones"
            className="text-sm font-medium text-gold-300 underline underline-offset-4"
          >
            Comisiones →
          </Link>
          <Link
            href="/dashboard/liquidaciones"
            className="text-sm font-medium text-gold-300 underline underline-offset-4"
          >
            Liquidaciones →
          </Link>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 transition ${
        highlight
          ? "border-amber-200 bg-amber-50 hover:border-amber-300"
          : "border-gold-500/30 bg-navy-900"
      }`}
    >
      <p className="text-sm text-white/70">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${highlight ? "text-amber-700" : "text-gold-300"}`}>
        {value}
      </p>
    </div>
  );
}
