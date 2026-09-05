"use client";

import { useActionState } from "react";
import { uploadImportAction } from "./actions";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import type { Seller } from "@prisma/client";

export default function UploadForm({ sellers, isAdmin }: { sellers: Seller[]; isAdmin: boolean }) {
  const [state, formAction, pending] = useActionState(uploadImportAction, { error: null });

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-4`}>
      <div>
        <label className={labelClass}>Archivo (.xlsx o .csv)</label>
        <input name="file" type="file" accept=".xlsx,.xls,.csv" required className={inputClass} />
      </div>
      {isAdmin && (
        <div>
          <label className={labelClass}>Estos clientes son de...</label>
          <select name="sellerId" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Elegir vendedor...
            </option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.displayName}
              </option>
            ))}
          </select>
        </div>
      )}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${primaryButtonClass} self-start`}>
        {pending ? "Analizando..." : "Analizar archivo"}
      </button>
      <p className="text-xs text-white/70">
        Esto no carga nada todavía — primero se muestra una previsualización para revisar y
        confirmar.
      </p>
    </form>
  );
}
