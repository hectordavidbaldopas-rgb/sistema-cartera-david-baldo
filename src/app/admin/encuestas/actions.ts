"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { logAudit } from "@/lib/audit";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

const surveySchema = z.object({
  name: z.string().min(1, "Requerido"),
  description: z.string().optional(),
});

export async function createSurveyAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireAdmin();
  const parsed = surveySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const survey = await prisma.survey.create({ data: parsed.data });
  await logAudit({ userId: session.user.id, entityType: "Survey", entityId: survey.id, action: "create", newValues: survey });

  redirect(`/admin/encuestas/${survey.id}`);
}

export async function toggleSurveyActiveAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const survey = await prisma.survey.findUnique({ where: { id } });
  if (!survey) notFound();
  await prisma.survey.update({ where: { id }, data: { isActive: !survey.isActive } });
  revalidatePath("/admin/encuestas");
}

const questionSchema = z.object({
  surveyId: z.string().min(1),
  question: z.string().min(1, "Requerido"),
  questionType: z.string().min(1),
  isRequired: z.coerce.boolean(),
  sortOrder: z.coerce.number().int().default(0),
  dependsOnOptionId: z.string().optional(),
});

export async function addQuestionAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireAdmin();
  const parsed = questionSchema.safeParse({
    surveyId: formData.get("surveyId"),
    question: formData.get("question"),
    questionType: formData.get("questionType"),
    isRequired: formData.get("isRequired") === "on",
    sortOrder: formData.get("sortOrder") || 0,
    dependsOnOptionId: formData.get("dependsOnOptionId") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const data = parsed.data;

  let conditionalLogic: { dependsOnQuestionId: string; showWhenOptionValue: string } | undefined;
  if (data.dependsOnOptionId) {
    const option = await prisma.surveyOption.findUnique({ where: { id: data.dependsOnOptionId } });
    if (option) {
      conditionalLogic = { dependsOnQuestionId: option.questionId, showWhenOptionValue: option.value };
    }
  }

  const question = await prisma.surveyQuestion.create({
    data: {
      surveyId: data.surveyId,
      question: data.question,
      questionType: data.questionType,
      isRequired: data.isRequired,
      sortOrder: data.sortOrder,
      conditionalLogic,
    },
  });

  await logAudit({ userId: session.user.id, entityType: "SurveyQuestion", entityId: question.id, action: "create", newValues: question });

  revalidatePath(`/admin/encuestas/${data.surveyId}`);
  return { error: null };
}

export async function deleteQuestionAction(formData: FormData) {
  const session = await requireAdmin();
  const id = formData.get("id") as string;
  const surveyId = formData.get("surveyId") as string;
  const question = await prisma.surveyQuestion.findUnique({ where: { id } });
  if (!question) notFound();

  await prisma.surveyAnswer.deleteMany({ where: { questionId: id } });
  await prisma.surveyOption.deleteMany({ where: { questionId: id } });
  await prisma.surveyQuestion.delete({ where: { id } });

  await logAudit({ userId: session.user.id, entityType: "SurveyQuestion", entityId: id, action: "delete" });

  revalidatePath(`/admin/encuestas/${surveyId}`);
}

const optionSchema = z.object({
  questionId: z.string().min(1),
  surveyId: z.string().min(1),
  label: z.string().min(1, "Requerido"),
  value: z.string().min(1, "Requerido"),
  sortOrder: z.coerce.number().int().default(0),
});

export async function addOptionAction(formData: FormData) {
  const session = await requireAdmin();
  const parsed = optionSchema.safeParse({
    questionId: formData.get("questionId"),
    surveyId: formData.get("surveyId"),
    label: formData.get("label"),
    value: formData.get("value"),
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) return;
  const { surveyId, ...data } = parsed.data;

  const option = await prisma.surveyOption.create({ data });
  await logAudit({ userId: session.user.id, entityType: "SurveyOption", entityId: option.id, action: "create", newValues: option });

  revalidatePath(`/admin/encuestas/${surveyId}`);
}
