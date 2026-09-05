"use client";

import { useState } from "react";
import { submitSurveyAction } from "../actions";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import type { Survey, SurveyQuestion, SurveyOption } from "@prisma/client";

type QuestionWithOptions = SurveyQuestion & { options: SurveyOption[] };
type SurveyWithQuestions = Survey & { questions: QuestionWithOptions[] };

type ConditionalLogic = { dependsOnQuestionId: string; showWhenOptionValue: string };

export default function SurveyRunner({ survey }: { survey: SurveyWithQuestions }) {
  // answers: questionId -> selected option value(s) (para evaluar condicionales)
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  function setAnswer(questionId: string, values: string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: values }));
  }

  function isVisible(q: QuestionWithOptions): boolean {
    const cond = q.conditionalLogic as ConditionalLogic | null;
    if (!cond) return true;
    const dependsValues = answers[cond.dependsOnQuestionId] ?? [];
    return dependsValues.includes(cond.showWhenOptionValue);
  }

  return (
    <form action={submitSurveyAction} className={`${cardClass} flex flex-col gap-6`}>
      <input type="hidden" name="surveyId" value={survey.id} />
      {survey.questions.map((q) => {
        if (!isVisible(q)) return null;
        return (
          <div key={q.id}>
            <label className={labelClass}>
              {q.question} {q.isRequired && <span className="text-red-500">*</span>}
            </label>
            <QuestionInput question={q} onOptionChange={(values) => setAnswer(q.id, values)} />
          </div>
        );
      })}
      <button type="submit" className={`${primaryButtonClass} self-start`}>
        Enviar respuestas
      </button>
    </form>
  );
}

function QuestionInput({
  question,
  onOptionChange,
}: {
  question: QuestionWithOptions;
  onOptionChange: (values: string[]) => void;
}) {
  const name = `q-${question.id}`;

  if (question.questionType === "single_choice") {
    return (
      <div className="flex flex-col gap-1.5">
        {question.options.map((o) => (
          <label key={o.id} className="flex items-center gap-2 text-sm text-white/90">
            <input
              type="radio"
              name={name}
              value={o.id}
              required={question.isRequired}
              onChange={() => onOptionChange([o.value])}
            />
            {o.label}
          </label>
        ))}
      </div>
    );
  }

  if (question.questionType === "multiple_choice") {
    return (
      <MultiChoice question={question} name={name} onOptionChange={onOptionChange} />
    );
  }

  if (question.questionType === "boolean") {
    return (
      <select name={name} required={question.isRequired} defaultValue="" className={inputClass}>
        <option value="" disabled>
          Elegir...
        </option>
        <option value="true">Sí</option>
        <option value="false">No</option>
      </select>
    );
  }

  if (question.questionType === "number") {
    return <input type="number" name={name} required={question.isRequired} className={inputClass} />;
  }

  if (question.questionType === "date") {
    return <input type="date" name={name} required={question.isRequired} className={inputClass} />;
  }

  return <textarea name={name} required={question.isRequired} rows={2} className={inputClass} />;
}

function MultiChoice({
  question,
  name,
  onOptionChange,
}: {
  question: QuestionWithOptions;
  name: string;
  onOptionChange: (values: string[]) => void;
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(optionId: string, value: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) next.delete(optionId);
      else next.add(optionId);
      const values = question.options.filter((o) => next.has(o.id)).map((o) => o.value);
      onOptionChange(values);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      {question.options.map((o) => (
        <label key={o.id} className="flex items-center gap-2 text-sm text-white/90">
          <input type="checkbox" name={name} value={o.id} onChange={() => toggle(o.id, o.value)} />
          {o.label}
        </label>
      ))}
    </div>
  );
}
