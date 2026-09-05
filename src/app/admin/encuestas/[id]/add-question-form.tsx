"use client";

import { useActionState } from "react";
import { addQuestionAction } from "../actions";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

export default function AddQuestionForm({
  surveyId,
  questionTypes,
  conditionOptions,
}: {
  surveyId: string;
  questionTypes: readonly { value: string; label: string }[];
  conditionOptions: { id: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(addQuestionAction, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="surveyId" value={surveyId} />
      <div>
        <label className={labelClass}>Pregunta</label>
        <input name="question" required className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tipo</label>
          <select name="questionType" defaultValue="single_choice" className={inputClass}>
            {questionTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Orden</label>
          <input name="sortOrder" type="number" defaultValue={0} className={inputClass} />
        </div>
      </div>
      {conditionOptions.length > 0 && (
        <div>
          <label className={labelClass}>Mostrar solo si se respondió (opcional)</label>
          <select name="dependsOnOptionId" defaultValue="" className={inputClass}>
            <option value="">Siempre visible</option>
            {conditionOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <label className="flex items-center gap-2 text-sm text-white/90">
        <input type="checkbox" name="isRequired" />
        Obligatoria
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${primaryButtonClass} self-start`}>
        {pending ? "Agregando..." : "Agregar pregunta"}
      </button>
    </form>
  );
}
