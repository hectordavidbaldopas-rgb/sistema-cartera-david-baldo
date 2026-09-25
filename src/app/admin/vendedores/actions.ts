"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { logAudit } from "@/lib/audit";
import { initialPasswordFromDocument, normalizeDocumentNumber } from "@/lib/credentials";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Convención de acceso: el usuario de login es el DNI, la contraseña
// inicial son sus últimos 4 dígitos (ver src/lib/credentials.ts).
const dniField = z
  .string()
  .min(1, "El DNI es obligatorio para poder crear el acceso")
  .transform(normalizeDocumentNumber)
  .refine((v) => v.length >= 6 && v.length <= 9, "El DNI no parece válido");

const sellerSchema = z.object({
  fullName: z.string().min(1, "Requerido"),
  displayName: z.string().min(1, "Requerido"),
  locality: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  documentNumber: dniField,
  role: z.enum(["admin", "seller"]),
});

export async function createSellerAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireAdmin();

  const parsed = sellerSchema.safeParse({
    fullName: formData.get("fullName"),
    displayName: formData.get("displayName"),
    locality: formData.get("locality") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    email: formData.get("email") || undefined,
    documentNumber: formData.get("documentNumber"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  const existingSeller = await prisma.seller.findUnique({ where: { documentNumber: data.documentNumber } });
  if (existingSeller) {
    return { error: "Ya existe un vendedor con ese DNI." };
  }
  const existingUser = await prisma.user.findUnique({ where: { email: data.documentNumber } });
  if (existingUser) {
    return { error: "Ya existe un usuario con ese DNI." };
  }

  const password = initialPasswordFromDocument(data.documentNumber);
  const passwordHash = await bcrypt.hash(password, 10);

  const seller = await prisma.seller.create({
    data: {
      fullName: data.fullName,
      displayName: data.displayName,
      locality: data.locality,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email || null,
      documentNumber: data.documentNumber,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: data.documentNumber,
      passwordHash,
      role: data.role,
      sellerId: seller.id,
    },
  });

  await logAudit({
    userId: session.user.id,
    entityType: "Seller",
    entityId: seller.id,
    action: "create",
    newValues: { ...data, userId: user.id },
  });

  revalidatePath("/admin/vendedores");
  redirect("/admin/vendedores");
}

const updateSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(1, "Requerido"),
  displayName: z.string().min(1, "Requerido"),
  locality: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  documentNumber: z.string().optional(),
  isActive: z.coerce.boolean(),
});

export async function updateSellerAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireAdmin();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    fullName: formData.get("fullName"),
    displayName: formData.get("displayName"),
    locality: formData.get("locality") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    email: formData.get("email") || undefined,
    documentNumber: formData.get("documentNumber") || undefined,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { id, documentNumber: rawDni, ...data } = parsed.data;
  const documentNumber = rawDni ? normalizeDocumentNumber(rawDni) : null;
  if (documentNumber && (documentNumber.length < 6 || documentNumber.length > 9)) {
    return { error: "El DNI no parece válido" };
  }

  const before = await prisma.seller.findUnique({ where: { id } });
  if (!before) return { error: "Vendedor no encontrado" };

  if (documentNumber && documentNumber !== before.documentNumber) {
    const dniTaken = await prisma.seller.findUnique({ where: { documentNumber } });
    if (dniTaken && dniTaken.id !== id) {
      return { error: "Ese DNI ya está usado por otro vendedor." };
    }
  }

  const seller = await prisma.$transaction(async (tx) => {
    const updated = await tx.seller.update({ where: { id }, data: { ...data, documentNumber } });

    // Si se cargó o cambió el DNI, el login pasa a ser ese DNI y la
    // contraseña se reinicia a sus últimos 4 dígitos.
    if (documentNumber && documentNumber !== before.documentNumber) {
      const linkedUser = await tx.user.findUnique({ where: { sellerId: id } });
      if (linkedUser) {
        const password = initialPasswordFromDocument(documentNumber);
        const passwordHash = await bcrypt.hash(password, 10);
        await tx.user.update({
          where: { id: linkedUser.id },
          data: { email: documentNumber, passwordHash },
        });
      }
    }
    return updated;
  });

  await logAudit({
    userId: session.user.id,
    entityType: "Seller",
    entityId: seller.id,
    action: "update",
    oldValues: before,
    newValues: seller,
  });

  revalidatePath("/admin/vendedores");
  redirect("/admin/vendedores");
}

export type ReassignSellerState = { error: string | null; ok: boolean };

// Baja de un vendedor: sus pólizas pasan a otro vendedor (queda registrado
// como una versión nueva de cada póliza, changeReason "seller_change", igual
// que cualquier otra edición) y se desactivan su Seller y su User para que
// no pueda volver a entrar ni aparezca en los selectores de vendedor activo
// (esos ya filtran por isActive en todo el resto de la app).
export async function reassignAndDeactivateSellerAction(
  _prevState: ReassignSellerState,
  formData: FormData,
): Promise<ReassignSellerState> {
  const session = await requireAdmin();
  const sellerId = formData.get("sellerId") as string;
  const newSellerId = formData.get("newSellerId") as string;

  if (!newSellerId) return { error: "Elegí a qué vendedor pasan las pólizas.", ok: false };
  if (newSellerId === sellerId) return { error: "Elegí un vendedor distinto.", ok: false };

  const seller = await prisma.seller.findUnique({ where: { id: sellerId }, include: { user: true } });
  if (!seller) return { error: "Vendedor no encontrado.", ok: false };

  const newSeller = await prisma.seller.findUnique({ where: { id: newSellerId } });
  if (!newSeller) return { error: "El vendedor de destino no existe.", ok: false };

  const policies = await prisma.policy.findMany({ where: { sellerId } });
  const policyIds = policies.map((p) => p.id);

  if (policyIds.length > 0) {
    const versions = await prisma.policyVersion.findMany({ where: { policyId: { in: policyIds } } });
    const latestByPolicy = new Map<string, (typeof versions)[number]>();
    for (const v of versions) {
      const current = latestByPolicy.get(v.policyId);
      if (!current || v.versionNumber > current.versionNumber) latestByPolicy.set(v.policyId, v);
    }

    const newVersions = policies.map((p) => {
      const last = latestByPolicy.get(p.id);
      return {
        policyId: p.id,
        versionNumber: (last?.versionNumber ?? 0) + 1,
        previousVersionId: last?.id ?? null,
        clientId: p.clientId,
        branchId: p.branchId,
        companyId: p.companyId,
        sellerId: newSellerId,
        policyNumber: p.policyNumber,
        coverageName: p.coverageName,
        insuredObject: p.insuredObject,
        insuredSum: p.insuredSum,
        startDate: p.startDate,
        endDate: p.endDate,
        premiumAmount: p.premiumAmount,
        commissionPercentage: p.commissionPercentage,
        commissionAmount: p.commissionAmount,
        paymentMethod: p.paymentMethod,
        installmentCount: p.installmentCount,
        paymentStatus: p.paymentStatus,
        updateFrequency: p.updateFrequency,
        createdBy: session.user.id,
        changeReason: "seller_change",
      };
    });

    await prisma.$transaction([
      prisma.policy.updateMany({ where: { sellerId }, data: { sellerId: newSellerId } }),
      prisma.policyVersion.createMany({ data: newVersions }),
    ]);
  }

  await prisma.seller.update({ where: { id: sellerId }, data: { isActive: false } });
  if (seller.user) {
    await prisma.user.update({ where: { id: seller.user.id }, data: { isActive: false } });
  }

  await logAudit({
    userId: session.user.id,
    entityType: "Seller",
    entityId: sellerId,
    action: "status_change",
    oldValues: { isActive: true, policiesReassigned: policyIds.length },
    newValues: { isActive: false, reassignedTo: newSellerId },
  });

  revalidatePath("/admin/vendedores");
  revalidatePath(`/admin/vendedores/${sellerId}`);
  return { error: null, ok: true };
}
