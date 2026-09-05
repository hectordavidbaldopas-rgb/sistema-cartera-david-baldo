"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/authz";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

// El cliente puede corregir el ramo y la compañía de sus propias pólizas
// cuando vinieron sin cargar del Excel importado (sección 34: el portal solo
// toca sus propios datos, nunca los de otro cliente ni campos administrativos
// como comisión o estado de la póliza).
const schema = z.object({
  policyId: z.string().min(1),
  branchId: z.string().min(1, "Elegí un ramo"),
  companyId: z.string().optional(),
});

export async function updatePolicyInfoAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireClient();
  const clientId = session.user.clientId;
  if (!clientId) notFound();

  const parsed = schema.safeParse({
    policyId: formData.get("policyId"),
    branchId: formData.get("branchId"),
    companyId: formData.get("companyId") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const data = parsed.data;

  const existing = await prisma.policy.findFirst({
    where: { id: data.policyId, clientId },
  });
  if (!existing) notFound();

  const policy = await prisma.policy.update({
    where: { id: existing.id },
    data: {
      branchId: data.branchId,
      companyId: data.companyId || null,
    },
  });

  await logAudit({
    userId: session.user.id,
    entityType: "Policy",
    entityId: policy.id,
    action: "update",
    oldValues: existing,
    newValues: policy,
  });

  revalidatePath("/portal");
  return { error: null };
}
