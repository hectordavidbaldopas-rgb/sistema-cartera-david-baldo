"use client";

import { useActionState } from "react";
import { createTaskAction } from "./actions";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";
import { TASK_TYPE, PRIORITY } from "@/lib/crm-fields";
import type { Seller } from "@prisma/client";

export default function NewTaskForm({
  sellers,
  clients,
  isAdmin,
}: {
  sellers: Seller[];
  clients: { id: string; fullNameNormalized: string }[];
  isAdmin: boolean;
}) {
  const [state, formAction, pending] = useActionState(createTaskAction, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label className={labelClass}>Título</label>
        <input name="title" required className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tipo</label>
          <select name="taskType" defaultValue="other" className={inputClass}>
            {TASK_TYPE.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
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
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Fecha límite</label>
          <input name="dueDate" type="date" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Cliente (opcional)</label>
          <select name="clientId" defaultValue="" className={inputClass}>
            <option value="">—</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullNameNormalized}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isAdmin && (
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
      )}
      <div>
        <label className={labelClass}>Descripción</label>
        <textarea name="description" rows={2} className={inputClass} />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${primaryButtonClass} self-start`}>
        {pending ? "Creando..." : "Crear tarea"}
      </button>
    </form>
  );
}
