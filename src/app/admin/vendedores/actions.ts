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
