"use client";

import { useActionState } from "react";
import { createSettlementAction } from "./actions";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import type { Seller } from "@prisma/client";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function NewSettlementForm({ sellers }: { sellers: Seller[] }) {
  const [state, formAction, pending] = useActionState(createSettlementAction, { error: null });
  const now = new Date();

  return (
    <form action={formAction} className={`${cardClass} flex flex-wrap items-end gap-3 border-dashed`}>
      <div>
        <label className={labelClass}>Vendedor</label>
        <select name="sellerId" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Elegir...
          </option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.displayName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Mes</label>
        <select name="periodMonth" defaultValue={now.getMonth() + 1} className={inputClass}>
          {MONTH_NAMES.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Año</label>
        <input name="periodYear" type="number" defaultValue={now.getFullYear()} className={`${inputClass} w-24`} />
      </div>
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Creando..." : "Crear liquidación"}
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
