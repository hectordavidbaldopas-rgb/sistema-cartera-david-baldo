"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

export async function updateOpportunityStatusAction(formData: FormData) {
  const session = await requireStaff();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  const existing = await prisma.opportunity.findFirst({
    where: { id, sellerId: isAdmin(session.user.role) ? undefined : (session.user.sellerId ?? "__none__") },
  });
  if (!existing) notFound();

  const opportunity = await prisma.opportunity.update({
    where: { id },
    data: { status, closedAt: status === "won" || status === "lost" ? new Date() : null },
  });

  await logAudit({
    userId: session.user.id,
    entityType: "Opportunity",
    entityId: opportunity.id,
    action: "status_change",
    oldValues: existing,
    newValues: opportunity,
  });

  revalidatePath("/dashboard/oportunidades");
}
