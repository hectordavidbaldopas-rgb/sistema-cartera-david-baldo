import { prisma } from "@/lib/prisma";
import { requireStaff, policyScopeWhere } from "@/lib/authz";
import { cardClass, secondaryButtonClass, primaryButtonClass } from "@/lib/ui";
import { expiryLabel, EXPIRY_BADGE_CLASS, expiryLevel } from "@/lib/expiry";
import { formatDate } from "@/lib/dates";
import { labelFor, FOLLOW_UP_STATUS } from "@/lib/crm-fields";
import { money } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";

const CHANGE_REASON_LABEL: Record<string, string> = {
  renewal: "Renovación",
  premium_update: "Actualización de prima",
  coverage_change: "Cambio de cobertura",
  company_change: "Cambio de compañía",
  seller_change: "Cambio de vendedor",
  correction: "Corrección",
  import: "Importación inicial",
  other: "Carga inicial",
};

export default async function PolizaDetallePage(props: PageProps<"/dashboard/polizas/[id]">) {
  const session = await requireStaff();
  const { id } = await props.params;

  const policy = await prisma.policy.findFirst({
    where: { id, ...policyScopeWhere(session) },
    include: {
      client: true,
      branch: true,
      company: true,
      seller: true,
      cancellations: { orderBy: { cancellationDate: "desc" } },
      versions: { orderBy: { versionNumber: "desc" } },
      followUps: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!policy) notFound();

  const canManage = policy.status !== "cancelled" && policy.status !== "lost";

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <Link href={`/dashboard/clientes/${policy.clientId}`} className="text-sm text-white/70 hover:underline">
          ← {policy.client.fullNameNormalized}
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gold-300">{policy.branch.name}</h1>
          <div className="flex gap-2">
            {canManage && (
              <>
                <Link href={`/dashboard/polizas/${policy.id}/editar`} className={secondaryButtonClass}>
                  Editar
                </Link>
                <Link href={`/dashboard/polizas/${policy.id}/renovar`} className={primaryButtonClass}>
                  Renovar
                </Link>
                <Link
                  href={`/dashboard/polizas/${policy.id}/baja`}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Dar de baja
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        <div className={cardClass}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs font-medium text-white/80">
              {policy.status}
            </span>
            {policy.endDate && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${EXPIRY_BADGE_CLASS[expiryLevel(policy.endDate)]}`}
              >
                {expiryLabel(policy.endDate)}
              </span>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <Field label="Compañía" value={policy.company?.name ?? "A confirmar"} />
            <Field label="N° de póliza" value={policy.policyNumber} />
            <Field label="Vendedor" value={policy.seller.displayName} />
            <Field label="Cobertura" value={policy.coverageName} />
            <Field label="Objeto asegurado" value={policy.insuredObject} />
            <Field
              label="Vigencia"
              value={
                policy.startDate || policy.endDate
                  ? `${formatDate(policy.startDate)} → ${formatDate(policy.endDate)}`
                  : null
              }
            />
            <Field label="Suma asegurada" value={policy.insuredSum ? money(policy.insuredSum) : null} />
            <Field label="Prima" value={policy.premiumAmount ? money(policy.premiumAmount) : null} />
            <Field
              label="Comisión"
              value={
                policy.commissionPercentage != null
                  ? `${(policy.commissionPercentage * 100).toFixed(0)}% · ${money(policy.commissionAmount)}`
                  : null
              }
            />
            <Field label="Forma de pago" value={policy.paymentMethod} />
            <Field label="Estado de pago" value={policy.paymentStatus} />
          </dl>
          {policy.cancellationReason && (
            <div className="mt-4 border-t border-gold-500/20 pt-3 text-sm text-red-600">
              Baja registrada — motivo: {policy.cancellationReason}
              {policy.cancellationDate && ` (${formatDate(policy.cancellationDate)})`}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-white/90">
            Historial ({policy.versions.length} versiones)
          </h2>
          <div className="space-y-2">
            {policy.versions.map((v) => (
              <div key={v.id} className={cardClass}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gold-300">
                    Versión {v.versionNumber} — {CHANGE_REASON_LABEL[v.changeReason] ?? v.changeReason}
                  </p>
                  <p className="text-xs text-white/50">
                    {new Date(v.createdAt).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <p className="text-sm text-white/70">
                  {v.startDate || v.endDate
                    ? `Vigencia: ${formatDate(v.startDate)} → ${formatDate(v.endDate)}`
                    : "Sin vigencia cargada"}
                  {v.premiumAmount ? ` · Prima ${money(v.premiumAmount)}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/90">
              Seguimientos ({policy.followUps.length})
            </h2>
            <Link
              href={`/dashboard/polizas/${policy.id}/seguimientos/nuevo`}
              className={secondaryButtonClass}
            >
              + Nuevo seguimiento
            </Link>
          </div>
          <div className="space-y-2">
            {policy.followUps.map((f) => (
              <Link
                key={f.id}
                href={`/dashboard/seguimientos/${f.id}`}
                className={`${cardClass} block transition hover:border-gold-500/40`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gold-300">{f.subject}</p>
                  <span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs text-white/80">
                    {labelFor(FOLLOW_UP_STATUS, f.status)}
                  </span>
                </div>
                {f.dueDate && (
                  <p className="text-sm text-white/70">Vence: {formatDate(f.dueDate)}</p>
                )}
              </Link>
            ))}
            {policy.followUps.length === 0 && (
              <p className="text-sm text-white/70">Sin seguimientos cargados.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-white/50">{label}</dt>
      <dd className="text-gold-300">{value || "—"}</dd>
    </div>
  );
}
