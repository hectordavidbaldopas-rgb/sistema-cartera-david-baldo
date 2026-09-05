import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import { cardClass, secondaryButtonClass } from "@/lib/ui";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import { notFound } from "next/navigation";
import { confirmImportAction, cancelImportAction } from "../actions";
import ConfirmButton from "./confirm-button";

type NormalizedData = {
  ramoTokens: { raw: string; branchName: string; mapped: boolean }[];
  matchedClientName: string | null;
  duplicatePhoneInBatch: string[];
};

export default async function ImportBatchPage(props: PageProps<"/dashboard/importar/[id]">) {
  const session = await requireStaff();
  const admin = isAdmin(session.user.role);
  const { id } = await props.params;

  const batch = await prisma.importBatch.findUnique({ where: { id } });
  if (!batch) notFound();
  if (!admin && batch.importedBy !== session.user.id) notFound();

  const rows = await prisma.importRow.findMany({ where: { batchId: id }, orderBy: { rowNumber: "asc" } });
  const isPreview = batch.status === "preview";

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/importar" className="text-sm text-white/70 hover:underline">
            ← Importar
          </Link>
          <HomeButton href="/dashboard" />
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gold-300">{batch.fileName}</h1>
          <span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs font-medium text-white/80">
            {batch.status}
          </span>
        </div>
        <p className="text-sm text-white/70">
          {batch.totalRows} filas · {batch.validRows} completas · {batch.incompleteRows} incompletas ·{" "}
          {batch.reviewRows} posibles duplicados
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {isPreview && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Nada se cargó todavía. Revisá la acción de cada fila (sobre todo las marcadas como
            posible duplicado) y confirmá abajo.
          </div>
        )}

        <form action={confirmImportAction}>
          <input type="hidden" name="batchId" value={batch.id} />
          <div className="overflow-x-auto rounded-xl border border-gold-500/30 bg-navy-900">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-navy-800 text-white/70">
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Teléfono</th>
                  <th className="px-3 py-2 font-medium">Ramo</th>
                  <th className="px-3 py-2 font-medium">Alertas</th>
                  <th className="px-3 py-2 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const raw = row.rawData as { nombre: string; telefono: string; ramo: string };
                  const normalized = row.normalizedData as NormalizedData | null;
                  return (
                    <tr key={row.id} className="border-t border-gold-500/20 align-top">
                      <td className="px-3 py-2 text-white/50">{row.rowNumber}</td>
                      <td className="px-3 py-2 text-gold-300">{raw.nombre || "—"}</td>
                      <td className="px-3 py-2 text-white/80">{raw.telefono || "—"}</td>
                      <td className="px-3 py-2 text-white/80">
                        {normalized?.ramoTokens.map((t) => t.branchName).join(", ") || "—"}
                      </td>
                      <td className="px-3 py-2">
                        <RowAlerts row={row} normalized={normalized} />
                      </td>
                      <td className="px-3 py-2">
                        {isPreview ? (
                          <select
                            name={`action-${row.id}`}
                            defaultValue={row.action}
                            className="rounded-lg border border-gold-500/40 px-2 py-1 text-xs"
                          >
                            <option value="create">Crear nuevo</option>
                            {row.matchedClientId && (
                              <option value="update">
                                Sumar a {normalized?.matchedClientName ?? "existente"}
                              </option>
                            )}
                            <option value="skip">Omitir</option>
                          </select>
                        ) : (
                          <span className="text-xs text-white/70">{row.action}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {isPreview && (
            <div className="mt-4 flex gap-3">
              <ConfirmButton />
            </div>
          )}
        </form>

        {isPreview && (
          <form action={cancelImportAction} className="mt-3">
            <input type="hidden" name="batchId" value={batch.id} />
            <button type="submit" className={secondaryButtonClass}>
              Cancelar esta importación
            </button>
          </form>
        )}

        {batch.status === "completed" && (
          <div className={`${cardClass} mt-4`}>
            <p className="text-sm font-medium text-green-700">
              Importación completada — {batch.importedRows} clientes procesados.
            </p>
            <Link href="/dashboard/clientes" className="text-sm text-white/80 underline">
              Ver cartera de clientes
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function RowAlerts({
  row,
  normalized,
}: {
  row: { validationStatus: string; validationErrors: unknown; duplicateStatus: string };
  normalized: NormalizedData | null;
}) {
  const errors = (row.validationErrors as string[] | null) ?? [];
  return (
    <div className="flex flex-col gap-1 text-xs">
      {errors.map((e) => (
        <span key={e} className="text-red-600">
          {e}
        </span>
      ))}
      {row.duplicateStatus === "confirmed" && (
        <span className="text-amber-700">Ya existe (mismo teléfono)</span>
      )}
      {row.duplicateStatus === "possible" && (
        <span className="text-amber-700">Posible duplicado (mismo nombre)</span>
      )}
      {normalized?.duplicatePhoneInBatch && normalized.duplicatePhoneInBatch.length > 0 && (
        <span className="text-red-600">
          Teléfono repetido en esta lista con: {normalized.duplicatePhoneInBatch.join(", ")}
        </span>
      )}
      {normalized?.ramoTokens.some((t) => !t.mapped) && (
        <span className="text-white/70">Ramo sin categoría exacta, va como Otro</span>
      )}
    </div>
  );
}
