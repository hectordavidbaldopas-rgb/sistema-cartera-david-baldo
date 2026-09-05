"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff, clientScopeWhere } from "@/lib/authz";
import { logAudit } from "@/lib/audit";
import { computeInformationStatus } from "@/lib/client-status";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

const clientSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  alternatePhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  occupation: z.string().optional(),
  notes: z.string().optional(),
});

function readClientForm(formData: FormData) {
  return clientSchema.parse({
    firstName: formData.get("firstName") || undefined,
    lastName: formData.get("lastName") || undefined,
    documentType: formData.get("documentType") || undefined,
    documentNumber: formData.get("documentNumber") || undefined,
    birthDate: formData.get("birthDate") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    email: formData.get("email") || undefined,
    alternatePhone: formData.get("alternatePhone") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    province: formData.get("province") || undefined,
    postalCode: formData.get("postalCode") || undefined,
    occupation: formData.get("occupation") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function createClientAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireStaff();
  const data = readClientForm(formData);

  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
  if (!fullName) {
    return { error: "Ingresá al menos nombre o apellido." };
  }

  const birthDate = data.birthDate ? new Date(data.birthDate) : null;
  const informationStatus = computeInformationStatus({ ...data, birthDate });

  const client = await prisma.client.create({
    data: {
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      fullNameNormalized: fullName.toUpperCase(),
      documentType: data.documentType || null,
      documentNumber: data.documentNumber || null,
      birthDate,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      alternatePhone: data.alternatePhone || null,
      address: data.address || null,
      city: data.city || null,
      province: data.province || null,
      postalCode: data.postalCode || null,
      occupation: data.occupation || null,
      notes: data.notes || null,
      informationStatus,
      createdBy: session.user.id,
      updatedBy: session.user.id,
    },
  });

  await logAudit({
    userId: session.user.id,
    entityType: "Client",
    entityId: client.id,
    action: "create",
    newValues: client,
  });

  revalidatePath("/dashboard/clientes");
  redirect(`/dashboard/clientes/${client.id}`);
}

export async function updateClientAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireStaff();
  const id = formData.get("id") as string;

  const existing = await prisma.client.findFirst({
    where: { id, ...clientScopeWhere(session) },
  });
  if (!existing) notFound();

  const data = readClientForm(formData);
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
  if (!fullName) {
    return { error: "Ingresá al menos nombre o apellido." };
  }

  const birthDate = data.birthDate ? new Date(data.birthDate) : null;
  const informationStatus = computeInformationStatus({ ...data, birthDate });

  const client = await prisma.client.update({
    where: { id },
    data: {
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      fullNameNormalized: fullName.toUpperCase(),
      documentType: data.documentType || null,
      documentNumber: data.documentNumber || null,
      birthDate,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      alternatePhone: data.alternatePhone || null,
      address: data.address || null,
      city: data.city || null,
      province: data.province || null,
      postalCode: data.postalCode || null,
      occupation: data.occupation || null,
      notes: data.notes || null,
      informationStatus,
      updatedBy: session.user.id,
    },
  });

  await logAudit({
    userId: session.user.id,
    entityType: "Client",
    entityId: client.id,
    action: "update",
    oldValues: existing,
    newValues: client,
  });

  revalidatePath("/dashboard/clientes");
  revalidatePath(`/dashboard/clientes/${id}`);
  redirect(`/dashboard/clientes/${id}`);
}
