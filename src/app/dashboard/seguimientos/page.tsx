import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import { cardClass } from "@/lib/ui";
import { formatDate } from "@/lib/dates";
import { labelFor, FOLLOW_UP_STATUS, PRIORITY } from "@/lib/crm-fields";
import Link from "next/link";
import HomeButton from "@/components/home-button";

const PRIORITY_BADGE: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-amber-100 text-amber-700",
  medium: "bg-navy-800 text-white/80",
  low: "bg-navy-800 text-white/70",
};

export default async function SeguimientosPage() {
  const session = await requireStaff();
  const admin = isAdmin(session.user.role);

  const followUps = await prisma.followUp.findMany({
    where: {
      sellerId: admin ? undefined : (session.user.sellerId ?? "__none__"),
      status: { notIn: ["renewed", "lost"] },
    },
    include: { client: true, policy: { include: { branch: true } }, seller: true },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
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
          Seguimientos abiertos ({followUps.length})
        </h1>
      </header>
      <main className="mx-auto max-w-4xl space-y-2 px-6 py-8">
        {followUps.map((f) => (
          <Link
            key={f.id}
            href={`/dashboard/seguimientos/${f.id}`}
            className={`${cardClass} flex items-center justify-between transition hover:border-gold-500/40`}
          >
            <div>
              <p className="font-medium text-gold-300">{f.subject}</p>
              <p className="text-sm text-white/70">
                {f.client.fullNameNormalized} · {f.policy.branch.name}
                {admin ? ` · ${f.seller.displayName}` : ""}
                {f.dueDate ? ` · Vence ${formatDate(f.dueDate)}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE[f.priority]}`}>
                {labelFor(PRIORITY, f.priority)}
              </span>
              <span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs text-white/80">
                {labelFor(FOLLOW_UP_STATUS, f.status)}
              </span>
            </div>
          </Link>
        ))}
        {followUps.length === 0 && (
          <p className="text-sm text-white/70">No hay seguimientos abiertos.</p>
        )}
      </main>
    </div>
  );
}
