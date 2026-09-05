"use client";

import { useActionState } from "react";
import { renewPolicyAction } from "../../actions";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import type { Policy } from "@prisma/client";

function dateInputValue(d: Date | null | undefined) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export default function RenewForm({ policy }: { policy: Policy }) {
  const [state, formAction, pending] = useActionState(renewPolicyAction, { error: null });

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-4`}>
      <input type="hidden" name="id" value={policy.id} />

      <div>
        <label className={labelClass}>N° de póliza</label>
        <input name="policyNumber" defaultValue={policy.policyNumber ?? ""} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nueva fecha de emisión</label>
          <input
            name="startDate"
            type="date"
            required
            defaultValue={dateInputValue(policy.endDate) || dateInputValue(policy.startDate)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Nueva fecha de vencimiento</label>
          <input name="endDate" type="date" required className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Prima mensual</label>
          <input
            name="premiumAmount"
            type="number"
            step="0.01"
            defaultValue={policy.premiumAmount ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>% Comisión</label>
          <input
            name="commissionPercentage"
            type="number"
            step="0.01"
            defaultValue={policy.commissionPercentage != null ? policy.commissionPercentage * 100 : ""}
            className={inputClass}
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Renovando..." : "Confirmar renovación"}
      </button>
    </form>
  );
}
