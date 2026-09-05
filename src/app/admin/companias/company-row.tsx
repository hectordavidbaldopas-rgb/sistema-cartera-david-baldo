"use client";

import { useActionState } from "react";
import { saveCompanyAction } from "./actions";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import type { InsuranceCompany } from "@prisma/client";

export default function CompanyRow({ company }: { company: InsuranceCompany | null }) {
  const [state, formAction, pending] = useActionState(saveCompanyAction, { error: null });
  const isNew = company === null;

  return (
    <form
      action={formAction}
      className={`${cardClass} ${isNew ? "border-dashed" : ""} grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end`}
    >
      {company && <input type="hidden" name="id" value={company.id} />}
      <div className="sm:col-span-3">
        <label className={labelClass}>{isNew ? "Nueva compañía — nombre" : "Nombre"}</label>
        <input name="name" required defaultValue={company?.name ?? ""} className={inputClass} />
      </div>
      <div className="sm:col-span-3">
        <label className={labelClass}>Razón social</label>
        <input name="legalName" defaultValue={company?.legalName ?? ""} className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>CUIT</label>
        <input name="cuit" defaultValue={company?.cuit ?? ""} className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Teléfono</label>
        <input name="phone" defaultValue={company?.phone ?? ""} className={inputClass} />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <label className="flex items-center gap-1.5 text-sm text-white/90">
          <input type="checkbox" name="isActive" defaultChecked={company?.isActive ?? true} />
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
