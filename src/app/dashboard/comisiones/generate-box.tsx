"use client";

import { useState, useTransition } from "react";
import { generateCommissionsAction } from "./actions";
import { cardClass, primaryButtonClass, inputClass, labelClass } from "@/lib/ui";
import type { Seller } from "@prisma/client";

export default function GenerateBox({
  periodMonth,
  periodYear,
  sellers,
  candidateCount,
}: {
  periodMonth: number;
  periodYear: number;
  sellers: Seller[];
  candidateCount: number;
}) {
  const [pending, startTransition] = useTransition();
  const [sellerId, setSellerId] = useState("");

  if (candidateCount === 0) {
    return (
      <div className={cardClass}>
        <p className="text-sm text-white/70">
          No hay pólizas vigentes con prima cargada que todavía no tengan comisión generada para
          este período.
        </p>
      </div>
    );
  }

  return (
    <form
      action={(formData) => startTransition(() => generateCommissionsAction(formData))}
      className={`${cardClass} border-amber-200 bg-amber-50`}
    >
      <input type="hidden" name="periodMonth" value={periodMonth} />
      <input type="hidden" name="periodYear" value={periodYear} />
      <p className="mb-2 text-sm font-semibold text-amber-900">
        {candidateCount} pólizas listas para generar comisión este período
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className={labelClass}>Solo de un vendedor (opcional)</label>
          <select
            name="sellerId"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            className={inputClass}
          >
            <option value="">Todos</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.displayName}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Generando..." : "Generar comisiones"}
        </button>
      </div>
    </form>
  );
}
