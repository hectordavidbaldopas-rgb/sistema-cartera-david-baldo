"use client";

import { useActionState } from "react";
import { addFollowUpEventAction } from "../actions";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";
import { FOLLOW_UP_STATUS, EVENT_TYPE } from "@/lib/crm-fields";

export default function StatusEventForm({
  followUpId,
  currentStatus,
}: {
  followUpId: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(addFollowUpEventAction, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="followUpId" value={followUpId} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tipo de evento</label>
          <select name="eventType" defaultValue="note" className={inputClass}>
            {EVENT_TYPE.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Nuevo estado del seguimiento</label>
          <select name="newStatus" defaultValue={currentStatus} className={inputClass}>
            {FOLLOW_UP_STATUS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Nota</label>
        <textarea name="notes" rows={2} className={inputClass} />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${primaryButtonClass} self-start`}>
        {pending ? "Guardando..." : "Registrar"}
      </button>
    </form>
  );
}
