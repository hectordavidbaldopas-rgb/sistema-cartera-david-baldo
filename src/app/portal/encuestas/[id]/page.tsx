import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/authz";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SurveyRunner from "./survey-runner";

export default async function AnswerSurveyPage(props: PageProps<"/portal/encuestas/[id]">) {
  const session = await requireClient();
  const clientId = session.user.clientId;
  if (!clientId) notFound();
  const { id } = await props.params;

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: { questions: { orderBy: { sortOrder: "asc" }, include: { options: { orderBy: { sortOrder: "asc" } } } } },
  });
  if (!survey || !survey.isActive) notFound();

  const alreadyAnswered = await prisma.surveyResponse.findFirst({
    where: { surveyId: id, clientId, status: "completed" },
  });
  if (alreadyAnswered) redirect("/portal/encuestas");

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <Link href="/portal/encuestas" className="text-sm text-white/70 hover:underline">
          ← Encuestas
        </Link>
        <h1 className="text-lg font-semibold text-gold-300">{survey.name}</h1>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <SurveyRunner survey={survey} />
      </main>
    </div>
  );
}
