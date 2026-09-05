"use server";

import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/authz";
import { generateOpportunitiesFromResponse } from "@/lib/opportunities";
import { redirect, notFound } from "next/navigation";

export async function submitSurveyAction(formData: FormData) {
  const session = await requireClient();
  const clientId = session.user.clientId;
  if (!clientId) notFound();

  const surveyId = formData.get("surveyId") as string;
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { questions: { include: { options: true } } },
  });
  if (!survey || !survey.isActive) notFound();

  const alreadyAnswered = await prisma.surveyResponse.findFirst({
    where: { surveyId, clientId, status: "completed" },
  });
  if (alreadyAnswered) redirect("/portal/encuestas");

  const response = await prisma.surveyResponse.create({
    data: { surveyId, clientId, status: "completed", completedAt: new Date() },
  });

  for (const q of survey.questions) {
    if (q.questionType === "single_choice") {
      const optionId = formData.get(`q-${q.id}`) as string | null;
      if (optionId) {
        await prisma.surveyAnswer.create({ data: { responseId: response.id, questionId: q.id, optionId } });
      }
    } else if (q.questionType === "multiple_choice") {
      const optionIds = formData.getAll(`q-${q.id}`) as string[];
      for (const optionId of optionIds) {
        await prisma.surveyAnswer.create({ data: { responseId: response.id, questionId: q.id, optionId } });
      }
    } else if (q.questionType === "boolean") {
      const value = formData.get(`q-${q.id}`) as string | null;
      if (value) {
        await prisma.surveyAnswer.create({
          data: { responseId: response.id, questionId: q.id, answerBoolean: value === "true" },
        });
      }
    } else if (q.questionType === "number") {
      const value = formData.get(`q-${q.id}`) as string | null;
      if (value) {
        await prisma.surveyAnswer.create({
          data: { responseId: response.id, questionId: q.id, answerNumber: Number(value) },
        });
      }
    } else if (q.questionType === "date") {
      const value = formData.get(`q-${q.id}`) as string | null;
      if (value) {
        await prisma.surveyAnswer.create({
          data: { responseId: response.id, questionId: q.id, answerDate: new Date(value) },
        });
      }
    } else {
      const value = formData.get(`q-${q.id}`) as string | null;
      if (value) {
        await prisma.surveyAnswer.create({ data: { responseId: response.id, questionId: q.id, answerText: value } });
      }
    }
  }

  await generateOpportunitiesFromResponse(response.id);

  redirect("/portal/encuestas");
}
