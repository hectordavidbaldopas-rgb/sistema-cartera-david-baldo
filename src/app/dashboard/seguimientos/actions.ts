"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff, policyScopeWhere } from "@/lib/authz";
import { logAudit } from "@/lib/audit";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

const createSchema = z.object({
  policyId: z.string().min(1),
  subject: z.string().min(1, "Requerido"),
  priority: z.string().default("medium"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function createFollowUpAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireStaff();
  const parsed = createSchema.safeParse({
    policyId: formData.get("policyId"),
    subject: formData.get("subject"),
    priority: formData.get("priority") || "medium",
    dueDate: formData.get("dueDate") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  const policy = await prisma.policy.findFirst({
    where: { id: data.policyId, ...policyScopeWhere(session) },
  });
  if (!policy) notFound();

  const followUp = await prisma.followUp.create({
    data: {
      policyId: policy.id,
      clientId: policy.clientId,
      sellerId: policy.sellerId,
      subject: data.subject,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
      createdBy: session.user.id,
    },
  });

  await logAudit({
    userId: session.user.id,
    entityType: "FollowUp",
    entityId: followUp.id,
    action: "create",
    newValues: followUp,
  });

  revalidatePath(`/dashboard/polizas/${policy.id}`);
  redirect(`/dashboard/seguimientos/${followUp.id}`);
}

const eventSchema = z.object({
  followUpId: z.string().min(1),
  eventType: z.string().min(1),
  notes: z.string().optional(),
  newStatus: z.string().optional(),
});

export async function addFollowUpEventAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireStaff();
  const parsed = eventSchema.safeParse({
    followUpId: formData.get("followUpId"),
    eventType: formData.get("eventType"),
    notes: formData.get("notes") || undefined,
    newStatus: formData.get("newStatus") || undefined,
  });
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }
  const { followUpId, eventType, notes, newStatus } = parsed.data;

  const followUp = await prisma.followUp.findFirst({
    where: {
      id: followUpId,
      sellerId: session.user.role === "admin" ? undefined : (session.user.sellerId ?? "__none__"),
    },
  });
  if (!followUp) notFound();

  await prisma.$transaction(async (tx) => {
    await tx.followUpEvent.create({
      data: {
        followUpId: followUp.id,
        policyId: followUp.policyId,
        clientId: followUp.clientId,
        sellerId: followUp.sellerId,
        eventType,
        notes: notes || null,
        createdBy: session.user.id,
      },
    });

    if (newStatus && newStatus !== followUp.status) {
      const isClosing = newStatus === "renewed" || newStatus === "lost";
      await tx.followUp.update({
        where: { id: followUp.id },
        data: {
          status: newStatus,
          completedAt: isClosing ? new Date() : null,
        },
      });
    }
  });

  revalidatePath(`/dashboard/seguimientos/${followUpId}`);
  revalidatePath("/dashboard/seguimientos");
  return { error: null };
}

// Llamada directa (no atada a un <form>) para registrar que se abrió
// WhatsApp. Solo guarda de qué trató (nombre de la plantilla), nunca el
// texto del mensaje en sí — sección 16 del documento: nunca almacenar la
// conversación de WhatsApp.
export async function logWhatsAppSentAction(followUpId: string, templateLabel: string) {
  const session = await requireStaff();
  const followUp = await prisma.followUp.findFirst({
    where: {
      id: followUpId,
      sellerId: session.user.role === "admin" ? undefined : (session.user.sellerId ?? "__none__"),
    },
  });
  if (!followUp) notFound();

  await prisma.followUpEvent.create({
    data: {
      followUpId: followUp.id,
      policyId: followUp.policyId,
      clientId: followUp.clientId,
      sellerId: followUp.sellerId,
      eventType: "whatsapp_sent",
      notes: `Plantilla: ${templateLabel}`,
      createdBy: session.user.id,
    },
  });

  revalidatePath(`/dashboard/seguimientos/${followUpId}`);
}
