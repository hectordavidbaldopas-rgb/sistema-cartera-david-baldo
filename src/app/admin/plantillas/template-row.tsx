"use client";

import { useActionState } from "react";
import { saveTemplateAction } from "./actions";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import { EVENT_TYPE } from "@/lib/crm-fields";
import type { MessageTemplate, InsuranceBranch } from "@prisma/client";

export default function TemplateRow({
  template,
  branches,
}: {
  template: MessageTemplate | null;
  branches: InsuranceBranch[];
}) {
  const [state, formAction, pending] = useActionState(saveTemplateAction, { error: null });
  const isNew = template === null;

  return (
    <form action={formAction} className={`${cardClass} ${isNew ? "border-dashed" : ""} flex flex-col gap-3`}>
      {template && <input type="hidden" name="id" value={template.id} />}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>{isNew ? "Nueva plantilla — nombre" : "Nombre"}</label>
          <input name="name" required defaultValue={template?.name ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Se usa cuando...</label>
          <select name="eventType" required defaultValue={template?.eventType ?? "other"} className={inputClass}>
            {EVENT_TYPE.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Ramo (opcional)</label>
          <select name="branchId" defaultValue={template?.branchId ?? ""} className={inputClass}>
            <option value="">Cualquiera</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Mensaje</label>
        <textarea
          name="templateText"
          required
          rows={3}
          defaultValue={template?.templateText ?? ""}
          className={inputClass}
          placeholder="Hola {{cliente}} 👋 ..."
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm text-white/90">
          <input type="checkbox" name="isActive" defaultChecked={template?.isActive ?? true} />
          Activa
        </label>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {isNew ? "Agregar" : "Guardar"}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
