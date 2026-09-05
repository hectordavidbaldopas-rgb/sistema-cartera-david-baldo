"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Requerido"),
  code: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean(),
});

export async function saveBranchAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireAdmin();

  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    code: formData.get("code") || undefined,
    description: formData.get("description") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { id, ...data } = parsed.data;

  try {
    if (id) {
      const before = await prisma.insuranceBranch.findUnique({ where: { id } });
      const branch = await prisma.insuranceBranch.update({ where: { id }, data });
      await logAudit({
        userId: session.user.id,
        entityType: "InsuranceBranch",
        entityId: branch.id,
        action: "update",
        oldValues: before,
        newValues: branch,
      });
    } else {
      const branch = await prisma.insuranceBranch.create({ data });
      await logAudit({
        userId: session.user.id,
        entityType: "InsuranceBranch",
        entityId: branch.id,
        action: "create",
        newValues: branch,
      });
    }
  } catch {
    return { error: "Ya existe un ramo con ese nombre o código." };
  }

  revalidatePath("/admin/ramos");
  return { error: null };
}
