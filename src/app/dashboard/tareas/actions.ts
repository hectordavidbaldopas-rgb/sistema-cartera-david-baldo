"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import { logAudit } from "@/lib/audit";
import { generateAutomaticTasks } from "@/lib/auto-tasks";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

const createSchema = z.object({
  title: z.string().min(1, "Requerido"),
  description: z.string().optional(),
  taskType: z.string().default("other"),
  priority: z.string().default("medium"),
  dueDate: z.string().optional(),
  clientId: z.string().optional(),
  sellerId: z.string().optional(),
});

export async function createTaskAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireStaff();
  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    taskType: formData.get("taskType") || "other",
    priority: formData.get("priority") || "medium",
    dueDate: formData.get("dueDate") || undefined,
    clientId: formData.get("clientId") || undefined,
    sellerId: formData.get("sellerId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;
  const sellerId = isAdmin(session.user.role) ? data.sellerId : session.user.sellerId;
  if (!sellerId) {
    return { error: "Elegí un vendedor para la tarea." };
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      taskType: data.taskType,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      clientId: data.clientId || null,
      sellerId,
      createdBy: session.user.id,
    },
  });

  await logAudit({
    userId: session.user.id,
    entityType: "Task",
    entityId: task.id,
    action: "create",
    newValues: task,
  });

  revalidatePath("/dashboard/tareas");
  return { error: null };
}

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
});

export async function updateTaskStatusAction(formData: FormData) {
  const session = await requireStaff();
  const parsed = statusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;
  const { id, status } = parsed.data;

  const existing = await prisma.task.findFirst({
    where: {
      id,
      sellerId: isAdmin(session.user.role) ? undefined : (session.user.sellerId ?? "__none__"),
    },
  });
  if (!existing) notFound();

  const task = await prisma.task.update({
    where: { id },
    data: { status, completedAt: status === "completed" ? new Date() : null },
  });

  await logAudit({
    userId: session.user.id,
    entityType: "Task",
    entityId: task.id,
    action: "status_change",
    oldValues: existing,
    newValues: task,
  });

  revalidatePath("/dashboard/tareas");
}

export async function generateAutoTasksAction() {
  const session = await requireStaff();
  const scope = isAdmin(session.user.role) ? null : (session.user.sellerId ?? null);
  const count = await generateAutomaticTasks(scope, session.user.id);

  await logAudit({
    userId: session.user.id,
    entityType: "Task",
    entityId: "bulk-auto-generate",
    action: "create",
    newValues: { count, scope },
  });

  revalidatePath("/dashboard/tareas");
  return count;
}
