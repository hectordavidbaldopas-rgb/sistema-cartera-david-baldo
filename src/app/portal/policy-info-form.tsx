"use client";

import { useActionState } from "react";
import { updatePolicyInfoAction } from "./policy-actions";
import { inputClass, primaryButtonClass } from "@/lib/ui";
import type { InsuranceBranch, InsuranceCompany } from "@prisma/client";

export default function PolicyInfoForm({
  policyId,
  branchId,
  companyId,
  branches,
  companies,
}: {
  policyId: string;
  branchId: string;
  companyId: string | null;
  branches: InsuranceBranch[];
  companies: InsuranceCompany[];
}) {
  const [state, formAction, pending] = useActionState(updatePolicyInfoAction, { error: null });

  return (
    <form action={formAction} className="mt-3 border-t border-gold-500/20 pt-3">
      <input type="hidden" name="policyId" value={policyId} />
      <p className="mb-2 text-xs font-medium text-amber-700">
        Ayudanos a completar esta cobertura:
      </p>
      <div className="grid grid-cols-2 gap-2">
        <select name="branchId" defaultValue={branchId} className={inputClass}>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select name="companyId" defaultValue={companyId ?? ""} className={inputClass}>
          <option value="">Compañía a confirmar</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${primaryButtonClass} mt-2 text-xs`}>
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
