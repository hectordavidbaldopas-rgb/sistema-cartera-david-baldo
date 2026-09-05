"use client";

import { useState, useTransition } from "react";
import { generateBulkPortalAccessAction } from "./bulk-portal-actions";
import { cardClass, primaryButtonClass } from "@/lib/ui";
import type { BulkPortalSkip } from "@/lib/portal-bulk";

export default function BulkPortalBox({
  candidateCount,
  skipped,
}: {
  candidateCount: number;
  skipped: BulkPortalSkip[];
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: BulkPortalSkip[] } | null>(null);

  if (candidateCount === 0 && skipped.length === 0 && !result) return null;

  function handleGenerate() {
    startTransition(async () => {
      const r = await generateBulkPortalAccessAction();
      setResult(r);
      setConfirming(false);
    });
  }

  return (
    <div className={`${cardClass} mb-6 border-amber-200 bg-amber-50`}>
      {result ? (
        <div>
          <p className="text-sm font-medium text-green-700">
            Se generaron {result.created} accesos al portal (usuario = últimos 6 del teléfono,
            contraseña <code>0000</code>).
          </p>
          {result.skipped.length > 0 && (
            <details className="mt-2 text-xs text-amber-800">
              <summary className="cursor-pointer">{result.skipped.length} omitidos — ver por qué</summary>
              <ul className="mt-1 list-disc pl-4">
                {result.skipped.map((s) => (
                  <li key={s.clientId}>
                    {s.clientName}: {s.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      ) : (
        <>
          <p className="mb-1 text-sm font-semibold text-amber-900">
            {candidateCount} clientes con teléfono todavía sin acceso al portal
          </p>
          {skipped.length > 0 && (
            <details className="mb-2 text-xs text-amber-800">
              <summary className="cursor-pointer">{skipped.length} no se van a poder generar — ver por qué</summary>
              <ul className="mt-1 list-disc pl-4">
                {skipped.map((s) => (
                  <li key={s.clientId}>
                    {s.clientName}: {s.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {candidateCount > 0 &&
            (confirming ? (
              <div className="flex items-center gap-2">
                <button onClick={handleGenerate} disabled={pending} className={primaryButtonClass}>
                  {pending ? "Generando..." : `Sí, generar los ${candidateCount}`}
                </button>
                <button onClick={() => setConfirming(false)} className="text-sm text-amber-700 underline">
                  Cancelar
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)} className={primaryButtonClass}>
                Generar accesos al portal para todos
              </button>
            ))}
        </>
      )}
    </div>
  );
}
