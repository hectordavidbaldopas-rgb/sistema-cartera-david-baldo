import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/authz";
import { cardClass, secondaryButtonClass } from "@/lib/ui";
import { formatDate } from "@/lib/dates";
import { labelFor, FOLLOW_UP_STATUS, EVENT_TYPE } from "@/lib/crm-fields";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import { notFound } from "next/navigation";
import StatusEventForm from "./status-form";
import WhatsAppSender from "./whatsapp-sender";

export default async function SeguimientoDetallePage(props: PageProps<"/dashboard/seguimientos/[id]">) {
  const session = await requireStaff();
  const { id } = await props.params;

  const followUp = await prisma.followUp.findFirst({
    where: {
      id,
      sellerId: session.user.role === "admin" ? undefined : (session.user.sellerId ?? "__none__"),
    },
    include: {
      client: true,
      seller: true,
      policy: { include: { branch: true, company: true } },
      events: { orderBy: { eventDate: "desc" } },
    },
  });
  if (!followUp) notFound();

  const templates = await prisma.messageTemplate.findMany({
    where: {
      isActive: true,
      OR: [{ branchId: null }, { branchId: followUp.policy.branchId }],
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href={`/dashboard/polizas/${followUp.policyId}`} className="text-sm text-white/70 hover:underline">
            ← {followUp.client.fullNameNormalized} · {followUp.policy.branch.name}
          </Link>
          <HomeButton href="/dashboard" />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gold-300">{followUp.subject}</h1>
          <span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs font-medium text-white/80">
            {labelFor(FOLLOW_UP_STATUS, followUp.status)}
          </span>
        </div>
        {followUp.dueDate && (
          <p className="text-sm text-white/70">Vence: {formatDate(followUp.dueDate)}</p>
        )}
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        {followUp.client.phone && (
          <WhatsAppSender
            followUpId={followUp.id}
            phone={followUp.client.phone}
            templates={templates.map((t) => ({ id: t.id, name: t.name, templateText: t.templateText }))}
            vars={{
              cliente: followUp.client.fullNameNormalized,
              vendedor: followUp.seller.displayName,
              ramo: followUp.policy.branch.name,
              compania: followUp.policy.company?.name ?? "",
              poliza: followUp.policy.policyNumber ?? "",
              fecha_vencimiento: formatDate(followUp.policy.endDate),
            }}
          />
        )}

        <div className={cardClass}>
          <p className="mb-2 text-sm font-semibold text-white/90">Cambiar estado / agregar evento</p>
          <StatusEventForm followUpId={followUp.id} currentStatus={followUp.status} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-white/90">
            Línea de tiempo ({followUp.events.length})
          </h2>
          <div className="space-y-2">
            {followUp.events.map((e) => (
              <div key={e.id} className={cardClass}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gold-300">{labelFor(EVENT_TYPE, e.eventType)}</p>
                  <p className="text-xs text-white/50">
                    {new Date(e.eventDate).toLocaleString("es-AR")}
                  </p>
                </div>
                {e.notes && <p className="text-sm text-white/70 whitespace-pre-line">{e.notes}</p>}
              </div>
            ))}
            {followUp.events.length === 0 && (
              <p className="text-sm text-white/70">Sin eventos todavía.</p>
            )}
          </div>
        </div>

        {followUp.notes && (
          <div className={cardClass}>
            <p className="mb-1 text-xs font-medium uppercase text-white/50">Notas iniciales</p>
            <p className="whitespace-pre-line text-sm text-white/80">{followUp.notes}</p>
          </div>
        )}

        <Link href={`/dashboard/polizas/${followUp.policyId}`} className={secondaryButtonClass}>
          ← Volver a la póliza
        </Link>
      </main>
    </div>
  );
}
