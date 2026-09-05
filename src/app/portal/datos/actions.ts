"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/authz";
import { computeInformationStatus } from "@/lib/client-status";
import { logAudit } from "@/lib/audit";
import { notFound, redirect } from "next/navigation";

// El cliente puede tocar sus propios datos de contacto y su DNI — nunca
// notas internas ni nada administrativo (sección 34). Se habilitó cargar el
// DNI porque casi ninguno vino cargado desde el Excel y es más simple que lo
// complete el propio cliente a que el vendedor se lo pida uno por uno.
const schema = z.object({
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  alternatePhone: z.string().optional(),
  documentNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  occupation: z.string().optional(),
});

export async function updateMyDataAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireClient();
  const clientId = session.user.clientId;
  if (!clientId) notFound();

  const parsed = schema.safeParse({
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    email: formData.get("email") || undefined,
    alternatePhone: formData.get("alternatePhone") || undefined,
    documentNumber: formData.get("documentNumber") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    province: formData.get("province") || undefined,
    postalCode: formData.get("postalCode") || undefined,
    occupation: formData.get("occupation") || undefined,
  });
  if (!parsed.success) return { error: "Datos inválidos" };
  const data = parsed.data;

  const existing = await prisma.client.findUnique({ where: { id: clientId } });
  if (!existing) notFound();

  const informationStatus = computeInformationStatus({
    documentNumber: data.documentNumber || existing.documentNumber,
    phone: data.phone || null,
    email: data.email || null,
    address: data.address || null,
    birthDate: existing.birthDate,
  });

  const client = await prisma.client.update({
    where: { id: clientId },
    data: {
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      alternatePhone: data.alternatePhone || null,
      documentNumber: data.documentNumber || existing.documentNumber,
      documentType: data.documentNumber ? (existing.documentType ?? "DNI") : existing.documentType,
      address: data.address || null,
      city: data.city || null,
      province: data.province || null,
      postalCode: data.postalCode || null,
      occupation: data.occupation || null,
      informationStatus,
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

  redirect("/portal");
}
