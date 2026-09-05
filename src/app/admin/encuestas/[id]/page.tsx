import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { cardClass } from "@/lib/ui";
import { QUESTION_TYPE } from "@/lib/survey-fields";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddQuestionForm from "./add-question-form";
import QuestionCard from "./question-card";

export default async function EditSurveyPage(props: PageProps<"/admin/encuestas/[id]">) {
  await requireAdmin();
  const { id } = await props.params;

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
        include: { options: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!survey) notFound();

  const branches = await prisma.insuranceBranch.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

  const allOptions = survey.questions.flatMap((q) =>
    q.options.map((o) => ({ id: o.id, label: `${q.question} → ${o.label}` })),
  );

  return (
    <div>
      <Link href="/admin/encuestas" className="text-sm text-white/70 hover:underline">
        ← Encuestas
      </Link>
      <h2 className="mb-1 text-base font-semibold text-gold-300">{survey.name}</h2>
      {survey.description && <p className="mb-6 text-sm text-white/70">{survey.description}</p>}

      <div className="space-y-3">
        {survey.questions.map((q) => (
          <QuestionCard key={q.id} question={q} surveyId={survey.id} branches={branches} />
        ))}
        {survey.questions.length === 0 && (
          <p className="text-sm text-white/70">Todavía no hay preguntas.</p>
        )}
      </div>

      <div className={`${cardClass} mt-6 border-dashed`}>
        <p className="mb-3 text-sm font-semibold text-white/90">Agregar pregunta</p>
        <AddQuestionForm surveyId={survey.id} questionTypes={QUESTION_TYPE} conditionOptions={allOptions} />
      </div>
    </div>
  );
}
