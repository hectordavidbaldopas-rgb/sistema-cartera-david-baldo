"use client";

import { useActionState } from "react";
import { cancelPolicyAction } from "../../actions";
import { inputClass, labelClass, cardClass, dangerButtonClass } from "@/lib/ui";
import { CANCELLATION_REASON } from "@/lib/policy-fields";

export default function CancelForm({ policyId }: { policyId: string }) {
  const [state, formAction, pending] = useActionState(cancelPolicyAction, { error: null });

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-4`}>
      <input type="hidden" name="id" value={policyId} />

      <div>
        <label className={labelClass}>Resultado</label>
        <select name="newStatus" required defaultValue="cancelled" className={inputClass}>
          <option value="cancelled">Cancelada (tenía la póliza, la dio de baja)</option>
          <option value="lost">Perdida (nunca se concretó / no renovó)</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Motivo</label>
        <select name="reason" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Elegir...
          </option>
          {CANCELLATION_REASON.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Notas</label>
        <textarea name="notes" rows={3} className={inputClass} />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className={dangerButtonClass}
      >
        {pending ? "Guardando..." : "Confirmar baja"}
      </button>
    </form>
  );
}
