"use client";

import { useActionState } from "react";
import { createFollowUpAction } from "@/app/dashboard/seguimientos/actions";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import { PRIORITY } from "@/lib/crm-fields";

export default function FollowUpForm({ policyId }: { policyId: string }) {
  const [state, formAction, pending] = useActionState(createFollowUpAction, { error: null });

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-4`}>
      <input type="hidden" name="policyId" value={policyId} />
      <div>
        <label className={labelClass}>Asunto</label>
        <input
          name="subject"
          required
          className={inputClass}
          placeholder="Ej: Llamar para revisar renovación"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Prioridad</label>
          <select name="priority" defaultValue="medium" className={inputClass}>
            {PRIORITY.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Fecha límite</label>
          <input name="dueDate" type="date" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Notas</label>
        <textarea name="notes" rows={3} className={inputClass} />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Creando..." : "Crear seguimiento"}
      </button>
    </form>
  );
}
