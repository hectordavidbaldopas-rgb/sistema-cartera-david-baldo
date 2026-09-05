"use client";

import { useActionState } from "react";
import { createSurveyAction } from "./actions";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";

export default function NewSurveyForm() {
  const [state, formAction, pending] = useActionState(createSurveyAction, { error: null });

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-3 border-dashed`}>
      <div>
        <label className={labelClass}>Nueva encuesta — nombre</label>
        <input name="name" required className={inputClass} placeholder="Ej: Revisión anual de coberturas" />
      </div>
      <div>
        <label className={labelClass}>Descripción</label>
        <textarea name="description" rows={2} className={inputClass} />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${primaryButtonClass} self-start`}>
        {pending ? "Creando..." : "Crear encuesta"}
      </button>
    </form>
  );
}
