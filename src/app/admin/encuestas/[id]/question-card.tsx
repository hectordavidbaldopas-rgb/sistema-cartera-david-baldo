"use client";

import { useState } from "react";
import { addOptionAction, deleteQuestionAction } from "../actions";
import { inputClass, cardClass } from "@/lib/ui";
import { labelFor } from "@/lib/crm-fields";
import { QUESTION_TYPE } from "@/lib/survey-fields";
import type { SurveyQuestion, SurveyOption, InsuranceBranch } from "@prisma/client";

const CHOICE_TYPES = ["single_choice", "multiple_choice"];

export default function QuestionCard({
  question,
  surveyId,
  branches,
}: {
  question: SurveyQuestion & { options: SurveyOption[] };
  surveyId: string;
  branches: InsuranceBranch[];
}) {
  const [mode, setMode] = useState<"branch" | "custom">("branch");
  const isChoice = CHOICE_TYPES.includes(question.questionType);
  const conditional = question.conditionalLogic as { showWhenOptionValue: string } | null;

  return (
    <div className={cardClass}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-gold-300">
            {question.question} {question.isRequired && <span className="text-red-500">*</span>}
          </p>
          <p className="text-xs text-white/70">
            {labelFor(QUESTION_TYPE, question.questionType)}
            {conditional && ` · condicional (${conditional.showWhenOptionValue})`}
          </p>
        </div>
        <form action={deleteQuestionAction}>
          <input type="hidden" name="id" value={question.id} />
          <input type="hidden" name="surveyId" value={surveyId} />
          <button type="submit" className="text-xs text-red-500 hover:underline">
            Eliminar
          </button>
        </form>
      </div>

      {isChoice && (
        <div className="mt-3 border-t border-gold-500/20 pt-3">
          <ul className="mb-2 space-y-1 text-sm text-white/80">
            {question.options.map((o) => (
              <li key={o.id}>• {o.label}</li>
            ))}
            {question.options.length === 0 && <li className="text-white/50">Sin opciones todavía</li>}
          </ul>

          <div className="mb-2 flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => setMode("branch")}
              className={mode === "branch" ? "font-semibold text-gold-300" : "text-white/50"}
            >
              Opción = ramo
            </button>
            <button
              type="button"
              onClick={() => setMode("custom")}
              className={mode === "custom" ? "font-semibold text-gold-300" : "text-white/50"}
            >
              Opción personalizada
            </button>
          </div>

          <form action={addOptionAction} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="questionId" value={question.id} />
            <input type="hidden" name="surveyId" value={surveyId} />
            {mode === "branch" ? (
              <BranchOptionFields branches={branches} />
            ) : (
              <CustomOptionFields />
            )}
            <button type="submit" className="rounded-full bg-[image:var(--gradient-gold)] px-3 py-1.5 text-xs font-semibold text-navy-950 shadow-sm transition hover:brightness-105">
              + Opción
            </button>
          </form>
          {mode === "branch" && (
            <p className="mt-1 text-xs text-white/50">
              Si el cliente marca esta opción y no tiene una póliza vigente de ese ramo, se genera
              una oportunidad automáticamente.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BranchOptionFields({ branches }: { branches: InsuranceBranch[] }) {
  const [branchId, setBranchId] = useState("");
  const branch = branches.find((b) => b.id === branchId);

  return (
    <>
      <select
        value={branchId}
        onChange={(e) => setBranchId(e.target.value)}
        className={`${inputClass} w-56`}
      >
        <option value="" disabled>
          Elegir ramo...
        </option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <input type="hidden" name="label" value={branch?.name ?? ""} />
      <input type="hidden" name="value" value={branch?.id ?? ""} />
    </>
  );
}

function CustomOptionFields() {
  return (
    <>
      <input name="label" required placeholder="Texto de la opción" className={`${inputClass} w-48`} />
      <input name="value" required placeholder="Valor interno" className={`${inputClass} w-32`} />
    </>
  );
}
