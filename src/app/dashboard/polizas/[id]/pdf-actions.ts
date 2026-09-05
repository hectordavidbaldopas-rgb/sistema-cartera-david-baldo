"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff, policyScopeWhere } from "@/lib/authz";
import { logAudit } from "@/lib/audit";
import { uploadPolicyPdf, deletePolicyPdf } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

export async function uploadPolicyPdfAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireStaff();
  const policyId = formData.get("policyId") as string;

  const policy = await prisma.policy.findFirst({ where: { id: policyId, ...policyScopeWhere(session) } });
  if (!policy) notFound();

  const file = formData.get("pdfFile");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Elegí un archivo PDF para subir." };
  }
  if (file.type && file.type !== "application/pdf") {
    return { error: "El archivo tiene que ser un PDF." };
  }
  if (file.size > MAX_PDF_BYTES) {
    return { error: "El PDF no puede pesar más de 10 MB." };
  }

  const previousPath = policy.pdfPath;
  const path = await uploadPolicyPdf(policy.id, file);

  await prisma.policy.update({
    where: { id: policy.id },
    data: { pdfPath: path, pdfOriginalName: file.name, pdfUploadedAt: new Date() },
  });

  if (previousPath && previousPath !== path) {
    await deletePolicyPdf(previousPath).catch(() => {});
  }

  await logAudit({
    userId: session.user.id,
    entityType: "Policy",
    entityId: policy.id,
    action: "update",
    oldValues: { pdfPath: previousPath },
    newValues: { pdfPath: path, pdfOriginalName: file.name },
  });

  revalidatePath(`/dashboard/polizas/${policy.id}`);
  revalidatePath(`/portal`);
  return { error: null };
}
