import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { cardClass, primaryButtonClass } from "@/lib/ui";
import Link from "next/link";
import NewSurveyForm from "./new-survey-form";
import ToggleActiveButton from "./toggle-active-button";

export default async function EncuestasPage() {
  await requireAdmin();
  const surveys = await prisma.survey.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true, responses: true } } },
  });

  return (
    <div>
      <h2 className="mb-6 text-base font-semibold text-gold-300">Encuestas</h2>
      <NewSurveyForm />
      <div className="mt-6 space-y-3">
        {surveys.map((s) => (
          <div key={s.id} className={`${cardClass} flex items-center justify-between`}>
            <div>
              <Link href={`/admin/encuestas/${s.id}`} className="font-medium text-gold-300 hover:underline">
                {s.name}
              </Link>
              {!s.isActive && (
                <span className="ml-2 rounded-full bg-navy-800 px-2 py-0.5 text-xs text-white/70">inactiva</span>
              )}
              <p className="text-sm text-white/70">
                {s._count.questions} preguntas · {s._count.responses} respuestas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ToggleActiveButton id={s.id} isActive={s.isActive} />
              <Link href={`/admin/encuestas/${s.id}`} className={primaryButtonClass}>
                Editar
              </Link>
            </div>
          </div>
        ))}
        {surveys.length === 0 && <p className="text-sm text-white/70">Todavía no hay encuestas.</p>}
      </div>
    </div>
  );
}
