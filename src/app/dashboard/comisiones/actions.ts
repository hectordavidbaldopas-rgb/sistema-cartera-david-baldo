"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff, requireAdmin } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import { generateCommissions } from "@/lib/commissions";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

export async function generateCommissionsAction(formData: FormData) {
  const session = await requireAdmin();
  const periodMonth = Number(formData.get("periodMonth"));
  const periodYear = Number(formData.get("periodYear"));
  const sellerId = (formData.get("sellerId") as string) || null;

  const count = await generateCommissions(periodMonth, periodYear, sellerId);

  await logAudit({
    userId: session.user.id,
    entityType: "CommissionRecord",
    entityId: "bulk-generate",
    action: "create",
    newValues: { periodMonth, periodYear, sellerId, count },
  });

  revalidatePath("/dashboard/comisiones");
}

const collectSchema = z.object({
  id: z.string().min(1),
  amount: z.coerce.number().positive("Tiene que ser mayor a 0"),
});

export async function registerCollectionAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireStaff();
  const parsed = collectSchema.safeParse({
    id: formData.get("id"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const { id, amount } = parsed.data;

  const record = await prisma.commissionRecord.findFirst({
    where: { id, sellerId: isAdmin(session.user.role) ? undefined : (session.user.sellerId ?? "__none__") },
  });
  if (!record) notFound();

  const collectedAmount = Math.min(record.collectedAmount + amount, record.generatedAmount);
  const pendingAmount = Math.max(record.generatedAmount - collectedAmount, 0);
  const status = pendingAmount === 0 ? "collected" : "partially_collected";

  const updated = await prisma.commissionRecord.update({
    where: { id },
    data: { collectedAmount, pendingAmount, status },
  });

  await logAudit({
    userId: session.user.id,
    entityType: "CommissionRecord",
    entityId: id,
    action: "update",
    oldValues: record,
    newValues: updated,
  });

  revalidatePath("/dashboard/comisiones");
  return { error: null };
}
