"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireStaff } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import { logAudit } from "@/lib/audit";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

const createSchema = z.object({
  sellerId: z.string().min(1, "Elegí un vendedor"),
  periodMonth: z.coerce.number().int().min(1).max(12),
  periodYear: z.coerce.number().int().min(2000),
});

export async function createSettlementAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireAdmin();
  const parsed = createSchema.safeParse({
    sellerId: formData.get("sellerId"),
    periodMonth: formData.get("periodMonth"),
    periodYear: formData.get("periodYear"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const { sellerId, periodMonth, periodYear } = parsed.data;

  // Comisiones de este vendedor/período que tengan algo cobrado y todavía
  // no estén incluidas en ninguna liquidación activa.
  const alreadyUsed = await prisma.settlementItem.findMany({
    where: { settlement: { sellerId, status: { not: "cancelled" } } },
    select: { commissionRecordId: true },
  });
  const usedIds = new Set(alreadyUsed.map((i) => i.commissionRecordId));

  const records = await prisma.commissionRecord.findMany({
    where: { sellerId, periodMonth, periodYear, collectedAmount: { gt: 0 } },
  });
  const eligible = records.filter((r) => !usedIds.has(r.id));

  if (eligible.length === 0) {
    return { error: "No hay comisiones cobradas de este vendedor/período que todavía no estén liquidadas." };
  }

  const generatedAmount = eligible.reduce((s, r) => s + r.generatedAmount, 0);
  const collectedAmount = eligible.reduce((s, r) => s + r.collectedAmount, 0);

  const settlement = await prisma.$transaction(async (tx) => {
    const created = await tx.sellerSettlement.create({
      data: {
        sellerId,
        periodMonth,
        periodYear,
        generatedAmount,
        collectedAmount,
        pendingAmount: generatedAmount - collectedAmount,
        payableAmount: collectedAmount,
        status: "calculated",
        createdBy: session.user.id,
      },
    });
    await tx.settlementItem.createMany({
      data: eligible.map((r) => ({
        settlementId: created.id,
        commissionRecordId: r.id,
        amount: r.collectedAmount,
      })),
    });
    return created;
  });

  await logAudit({
    userId: session.user.id,
    entityType: "SellerSettlement",
    entityId: settlement.id,
    action: "create",
    newValues: settlement,
  });

  redirect(`/dashboard/liquidaciones/${settlement.id}`);
}

const paySchema = z.object({
  id: z.string().min(1),
  amount: z.coerce.number().positive("Tiene que ser mayor a 0"),
});

export async function registerPaymentAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireAdmin();
  const parsed = paySchema.safeParse({ id: formData.get("id"), amount: formData.get("amount") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const { id, amount } = parsed.data;

  const settlement = await prisma.sellerSettlement.findUnique({ where: { id } });
  if (!settlement) notFound();

  const paidAmount = Math.min(settlement.paidAmount + amount, settlement.payableAmount);
  const status = paidAmount >= settlement.payableAmount ? "paid" : "partially_paid";

  const updated = await prisma.sellerSettlement.update({
    where: { id },
    data: { paidAmount, status, paidAt: status === "paid" ? new Date() : settlement.paidAt },
  });

  await logAudit({
    userId: session.user.id,
    entityType: "SellerSettlement",
    entityId: id,
    action: "settlement",
    oldValues: settlement,
    newValues: updated,
  });

  revalidatePath(`/dashboard/liquidaciones/${id}`);
  revalidatePath("/dashboard/liquidaciones");
  return { error: null };
}

export async function cancelSettlementAction(formData: FormData) {
  const session = await requireAdmin();
  const id = formData.get("id") as string;
  const settlement = await prisma.sellerSettlement.findUnique({ where: { id } });
  if (!settlement) notFound();

  const updated = await prisma.sellerSettlement.update({ where: { id }, data: { status: "cancelled" } });

  await logAudit({
    userId: session.user.id,
    entityType: "SellerSettlement",
    entityId: id,
    action: "status_change",
    oldValues: settlement,
    newValues: updated,
  });

  revalidatePath("/dashboard/liquidaciones");
  redirect("/dashboard/liquidaciones");
}

export async function requireSettlementAccess(settlementId: string) {
  const session = await requireStaff();
  const settlement = await prisma.sellerSettlement.findUnique({ where: { id: settlementId } });
  if (!settlement) notFound();
  if (!isAdmin(session.user.role) && settlement.sellerId !== session.user.sellerId) notFound();
  return { session, settlement };
}
