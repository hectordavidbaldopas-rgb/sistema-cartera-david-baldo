import { prisma } from "@/lib/prisma";
import { requireStaff, clientScopeWhere } from "@/lib/authz";
import { missingFields } from "@/lib/client-status";
import { cardClass, secondaryButtonClass, primaryButtonClass } from "@/lib/ui";
import { expiryLabel, EXPIRY_BADGE_CLASS, expiryLevel } from "@/lib/expiry";
import { formatDate } from "@/lib/dates";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import { notFound } from "next/navigation";
import PortalAccessBox from "./portal-access-box";
import ClientMessageSender from "./client-message-sender";

export default async function ClienteDetallePage(props: PageProps<"/dashboard/clientes/[id]">) {
  const session = await requireStaff();
  const { id } = await props.params;

  const client = await prisma.client.findFirst({
    where: { id, ...clientScopeWhere(session) },
    include: {
      policies: {
        include: { branch: true, company: true, seller: true },
        orderBy: { createdAt: "desc" },
      },
      clientAccount: true,
    },
  });
  if (!client) notFound();

  const missing = missingFields(client);
  const isAdmin = session.user.role === "admin";
  const clientFirstName = client.firstName || client.fullNameNormalized;

  const templates = isAdmin
    ? await prisma.messageTemplate.findMany({
        where: { isActive: true },
        include: { branch: true },
        orderBy: { name: "asc" },
      })
    : [];

  const policiesByBranch: Record<
    string,
    { branchId: string; companyName: string; policyNumber: string; endDateFormatted: string }
  > = {};
  for (const p of client.policies) {
    if (policiesByBranch[p.branchId]) continue;
    policiesByBranch[p.branchId] = {
      branchId: p.branchId,
      companyName: p.company?.name ?? "",
      policyNumber: p.policyNumber ?? "",
      endDateFormatted: p.endDate ? formatDate(p.endDate) : "",
    };
  }

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/clientes" className="text-sm text-white/70 hover:underline">
            ← Cartera de clientes
          </Link>
          <HomeButton href="/dashboard" />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gold-300">{client.fullNameNormalized}</h1>
          <Link href={`/dashboard/clientes/${client.id}/editar`} className={secondaryButtonClass}>
            Editar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        <div className={cardClass}>
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                client.informationStatus === "complete"
                  ? "bg-green-100 text-green-700"
                  : client.informationStatus === "partial"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-navy-800 text-white/80"
              }`}
            >
              {client.informationStatus}
            </span>
            {missing.length > 0 && (
              <span className="text-xs text-white/70">Falta: {missing.join(", ")}</span>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <Field label="Teléfono" value={client.phone} />
            <Field label="WhatsApp" value={client.whatsapp} />
            <Field label="Email" value={client.email} />
            <Field label="Tel. alternativo/emergencia" value={client.alternatePhone} />
            <Field label="Documento" value={client.documentNumber} />
            <Field label="Domicilio" value={client.address} />
            <Field label="Ciudad" value={client.city} />
            <Field label="Provincia" value={client.province} />
            <Field label="Ocupación" value={client.occupation} />
          </dl>
          {client.notes && (
            <div className="mt-4 border-t border-gold-500/20 pt-3">
              <p className={"mb-1 text-xs font-medium uppercase text-white/50"}>Notas</p>
              <p className="whitespace-pre-line text-sm text-white/80">{client.notes}</p>
            </div>
          )}
        </div>

        <PortalAccessBox
          clientId={client.id}
          clientName={clientFirstName}
          phone={client.phone}
          hasAccount={!!client.clientAccount}
          hasLoggedIn={!!client.clientAccount?.lastLoginAt}
          informationStatus={client.informationStatus}
          missing={missing}
          isAdmin={isAdmin}
          inviteLinkSentCount={client.clientAccount?.inviteLinkSentCount ?? 0}
          inviteLinkSentAt={client.clientAccount?.inviteLinkSentAt ?? null}
        />

        {isAdmin && client.phone && (
          <ClientMessageSender
            clientName={clientFirstName}
            phone={client.phone}
            templates={templates.map((t) => ({
              id: t.id,
              name: t.name,
              templateText: t.templateText,
              branchId: t.branchId,
              branchName: t.branch?.name ?? null,
            }))}
            policiesByBranch={policiesByBranch}
          />
        )}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/90">
              Pólizas ({client.policies.length})
            </h2>
            <Link
              href={`/dashboard/clientes/${client.id}/polizas/nuevo`}
              className={primaryButtonClass}
            >
              + Nueva póliza
            </Link>
          </div>
          <div className="space-y-2">
            {client.policies.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/polizas/${p.id}`}
                className={`${cardClass} block transition hover:border-gold-500/40`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gold-300">{p.branch.name}</p>
                  <div className="flex items-center gap-2">
                    {p.endDate && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${EXPIRY_BADGE_CLASS[expiryLevel(p.endDate)]}`}
                      >
                        {expiryLabel(p.endDate)}
                      </span>
                    )}
                    <span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs text-white/80">
                      {p.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-white/70">
                  {p.company?.name ?? "Compañía a confirmar"}
                  {p.policyNumber ? ` · Póliza ${p.policyNumber}` : ""} · Vendedor:{" "}
                  {p.seller.displayName}
                </p>
              </Link>
            ))}
            {client.policies.length === 0 && (
              <p className="text-sm text-white/70">Sin pólizas cargadas todavía.</p>
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
