"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Requerido"),
  branchId: z.string().optional(),
  eventType: z.string().min(1),
  templateText: z.string().min(1, "Requerido"),
  isActive: z.coerce.boolean(),
});

export async function saveTemplateAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireAdmin();

  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    branchId: formData.get("branchId") || undefined,
    eventType: formData.get("eventType"),
    templateText: formData.get("templateText"),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { id, ...data } = parsed.data;
  const payload = { ...data, branchId: data.branchId || null };

  if (id) {
    const before = await prisma.messageTemplate.findUnique({ where: { id } });
    const template = await prisma.messageTemplate.update({ where: { id }, data: payload });
    await logAudit({
      userId: session.user.id,
      entityType: "MessageTemplate",
      entityId: template.id,
      action: "update",
      oldValues: before,
      newValues: template,
    });
  } else {
    const template = await prisma.messageTemplate.create({
      data: { ...payload, createdBy: session.user.id },
    });
    await logAudit({
      userId: session.user.id,
      entityType: "MessageTemplate",
      entityId: template.id,
      action: "create",
      newValues: template,
    });
  }

  revalidatePath("/admin/plantillas");
  return { error: null };
}
