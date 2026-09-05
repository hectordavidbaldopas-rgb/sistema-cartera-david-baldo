"use client";

import { useActionState } from "react";
import { saveBranchAction } from "./actions";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import type { InsuranceBranch } from "@prisma/client";

export default function BranchRow({ branch }: { branch: InsuranceBranch | null }) {
  const [state, formAction, pending] = useActionState(saveBranchAction, { error: null });
  const isNew = branch === null;

  return (
    <form
      action={formAction}
      className={`${cardClass} ${isNew ? "border-dashed" : ""} grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end`}
    >
      {branch && <input type="hidden" name="id" value={branch.id} />}
      <div className="sm:col-span-4">
        <label className={labelClass}>{isNew ? "Nuevo ramo — nombre" : "Nombre"}</label>
        <input name="name" required defaultValue={branch?.name ?? ""} className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Código</label>
        <input name="code" defaultValue={branch?.code ?? ""} className={inputClass} />
      </div>
      <div className="sm:col-span-3">
        <label className={labelClass}>Descripción</label>
        <input name="description" defaultValue={branch?.description ?? ""} className={inputClass} />
      </div>
      <div className="sm:col-span-1">
        <label className={labelClass}>Orden</label>
        <input
          name="sortOrder"
          type="number"
          defaultValue={branch?.sortOrder ?? 0}
          className={inputClass}
        />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <label className="flex items-center gap-1.5 text-sm text-white/90">
          <input type="checkbox" name="isActive" defaultChecked={branch?.isActive ?? true} />
          Activo
        </label>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {isNew ? "Agregar" : "Guardar"}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-600 sm:col-span-12">{state.error}</p>}
    </form>
  );
}
