import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { cardClass, inputClass, labelClass } from "@/lib/ui";
import type { Prisma } from "@prisma/client";

const ACTION_LABEL: Record<string, string> = {
  create: "Creó",
  update: "Modificó",
  delete: "Eliminó",
  login: "Inició sesión",
  import: "Importó",
  export: "Exportó",
  status_change: "Cambió estado",
  settlement: "Liquidó",
  other: "Otro",
};

function asString(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s || undefined;
}

export default async function AuditoriaPage(props: PageProps<"/admin/auditoria">) {
  await requireAdmin();
  const searchParams = await props.searchParams;
  const entityType = asString(searchParams.entidad);

  const where: Prisma.AuditLogWhereInput = entityType ? { entityType } : {};

  const [logs, entityTypes] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { include: { seller: true, clientAccount: { include: { client: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 150,
    }),
    prisma.auditLog.findMany({ distinct: ["entityType"], select: { entityType: true } }),
  ]);

  return (
    <div>
      <h2 className="mb-6 text-base font-semibold text-gold-300">Auditoría</h2>

      <form method="get" className={`${cardClass} mb-6 flex items-end gap-3`}>
        <div>
          <label className={labelClass}>Filtrar por entidad</label>
          <select name="entidad" defaultValue={entityType ?? ""} className={inputClass}>
            <option value="">Todas</option>
            {entityTypes.map((e) => (
              <option key={e.entityType} value={e.entityType}>
                {e.entityType}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-full bg-[image:var(--gradient-gold)] px-4 py-2 text-sm font-semibold text-navy-950 shadow-sm transition hover:brightness-105">
          Filtrar
        </button>
      </form>

      <div className="space-y-2">
        {logs.map((log) => {
          const actorName =
            log.user?.seller?.displayName ??
            log.user?.clientAccount?.client.fullNameNormalized ??
            log.user?.email ??
            "Sistema";
          return (
            <div key={log.id} className={cardClass}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gold-300">
                  <span className="font-medium">{actorName}</span>{" "}
                  {(ACTION_LABEL[log.action] ?? log.action).toLowerCase()}{" "}
                  <span className="font-medium">{log.entityType}</span>{" "}
                  <span className="text-white/50">({log.entityId})</span>
                </p>
                <p className="text-xs text-white/50">{new Date(log.createdAt).toLocaleString("es-AR")}</p>
              </div>
              {(log.oldValues != null || log.newValues != null) && (
                <details className="mt-2 text-xs text-white/70">
                  <summary className="cursor-pointer select-none">Ver detalle</summary>
                  <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {log.oldValues != null && (
                      <pre className="overflow-x-auto rounded bg-navy-950 p-2">
                        {JSON.stringify(log.oldValues, null, 2)}
                      </pre>
                    )}
                    {log.newValues != null && (
                      <pre className="overflow-x-auto rounded bg-navy-950 p-2">
                        {JSON.stringify(log.newValues, null, 2)}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>
          );
        })}
        {logs.length === 0 && <p className="text-sm text-white/70">Sin actividad registrada todavía.</p>}
      </div>
    </div>
  );
}
