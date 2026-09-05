"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Requerido"),
  legalName: z.string().optional(),
  code: z.string().optional(),
  cuit: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  isActive: z.coerce.boolean(),
});

export async function saveCompanyAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireAdmin();

  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    legalName: formData.get("legalName") || undefined,
    code: formData.get("code") || undefined,
    cuit: formData.get("cuit") || undefined,
    phone: formData.get("phone") || undefined,
    website: formData.get("website") || undefined,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { id, ...data } = parsed.data;

  try {
    if (id) {
      const before = await prisma.insuranceCompany.findUnique({ where: { id } });
      const company = await prisma.insuranceCompany.update({ where: { id }, data });
      await logAudit({
        userId: session.user.id,
        entityType: "InsuranceCompany",
        entityId: company.id,
        action: "update",
        oldValues: before,
        newValues: company,
      });
    } else {
      const company = await prisma.insuranceCompany.create({ data });
      await logAudit({
        userId: session.user.id,
        entityType: "InsuranceCompany",
        entityId: company.id,
        action: "create",
        newValues: company,
      });
    }
  } catch {
    return { error: "Ya existe una compañía con ese nombre o código." };
  }

  revalidatePath("/admin/companias");
  return { error: null };
}
