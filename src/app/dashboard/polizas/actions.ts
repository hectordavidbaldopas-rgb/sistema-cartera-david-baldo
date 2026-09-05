"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff, policyScopeWhere } from "@/lib/authz";
import { logAudit } from "@/lib/audit";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

const policySchema = z.object({
  clientId: z.string().min(1),
  branchId: z.string().min(1, "Elegí un ramo"),
  companyId: z.string().optional(),
  sellerId: z.string().min(1, "Elegí un vendedor"),
  policyNumber: z.string().optional(),
  coverageName: z.string().optional(),
  insuredObject: z.string().optional(),
  insuredSum: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  premiumAmount: z.string().optional(),
  commissionPercentage: z.string().optional(),
  paymentMethod: z.string().default("unknown"),
  installmentCount: z.string().optional(),
  paymentStatus: z.string().default("unknown"),
  updateFrequency: z.string().default("none"),
  status: z.string().default("draft"),
});

function num(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function readPolicyForm(formData: FormData) {
  return policySchema.parse({
    clientId: formData.get("clientId"),
    branchId: formData.get("branchId"),
    companyId: formData.get("companyId") || undefined,
    sellerId: formData.get("sellerId"),
    policyNumber: formData.get("policyNumber") || undefined,
    coverageName: formData.get("coverageName") || undefined,
    insuredObject: formData.get("insuredObject") || undefined,
    insuredSum: formData.get("insuredSum") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    premiumAmount: formData.get("premiumAmount") || undefined,
    commissionPercentage: formData.get("commissionPercentage") || undefined,
    paymentMethod: formData.get("paymentMethod") || "unknown",
    installmentCount: formData.get("installmentCount") || undefined,
    paymentStatus: formData.get("paymentStatus") || "unknown",
    updateFrequency: formData.get("updateFrequency") || "none",
    status: formData.get("status") || "draft",
  });
}

// El % de comisión se ingresa en el formulario como número entero (10 = 10%)
// pero se guarda como fracción (0.10), igual que en los datos importados
// del Excel — mantener esta conversión en todos los puntos donde se
// escribe commissionPercentage.
function toFraction(percent: number | null): number | null {
  return percent === null ? null : Math.round((percent / 100) * 10000) / 10000;
}

function buildPolicyData(data: ReturnType<typeof readPolicyForm>) {
  const premiumAmount = num(data.premiumAmount);
  const commissionPercentage = toFraction(num(data.commissionPercentage));
  const commissionAmount =
    premiumAmount !== null && commissionPercentage !== null
      ? Math.round(premiumAmount * commissionPercentage * 100) / 100
      : null;

  return {
    clientId: data.clientId,
    branchId: data.branchId,
    companyId: data.companyId || null,
    sellerId: data.sellerId,
    policyNumber: data.policyNumber || null,
    coverageName: data.coverageName || null,
    insuredObject: data.insuredObject || null,
    insuredSum: num(data.insuredSum),
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    premiumAmount,
    commissionPercentage,
    commissionAmount,
    paymentMethod: data.paymentMethod,
    installmentCount: data.installmentCount ? Math.round(Number(data.installmentCount)) : null,
    paymentStatus: data.paymentStatus,
    updateFrequency: data.updateFrequency,
    status: data.status,
  };
}

// Regla dura (sección 28): número de póliza obligatorio si no está en borrador.
function validateBusinessRules(data: ReturnType<typeof buildPolicyData>): string | null {
  if (data.status !== "draft" && !data.policyNumber) {
    return "El número de póliza es obligatorio para cualquier estado que no sea Borrador.";
  }
  if (data.endDate && data.startDate && data.endDate < data.startDate) {
    return "La fecha de vencimiento no puede ser anterior a la de emisión.";
  }
  return null;
}

export async function createPolicyAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireStaff();
  const raw = readPolicyForm(formData);

  if (session.user.role !== "admin" && raw.sellerId !== session.user.sellerId) {
    return { error: "No podés cargar pólizas a nombre de otro vendedor." };
  }

  const client = await prisma.client.findUnique({ where: { id: raw.clientId } });
  if (!client) notFound();

  const data = buildPolicyData(raw);
  const validationError = validateBusinessRules(data);
  if (validationError) return { error: validationError };

  const policy = await prisma.$transaction(async (tx) => {
    const created = await tx.policy.create({ data });
    await tx.policyVersion.create({
      data: {
        policyId: created.id,
        versionNumber: 1,
        clientId: created.clientId,
        branchId: created.branchId,
        companyId: created.companyId,
        sellerId: created.sellerId,
        policyNumber: created.policyNumber,
        coverageName: created.coverageName,
        insuredObject: created.insuredObject,
        insuredSum: created.insuredSum,
        startDate: created.startDate,
        endDate: created.endDate,
        premiumAmount: created.premiumAmount,
        commissionPercentage: created.commissionPercentage,
        commissionAmount: created.commissionAmount,
        paymentMethod: created.paymentMethod,
        installmentCount: created.installmentCount,
        paymentStatus: created.paymentStatus,
        updateFrequency: created.updateFrequency,
        createdBy: session.user.id,
        changeReason: "other",
      },
    });
    return created;
  });

  await logAudit({
    userId: session.user.id,
    entityType: "Policy",
    entityId: policy.id,
    action: "create",
    newValues: policy,
  });

  revalidatePath(`/dashboard/clientes/${raw.clientId}`);
  redirect(`/dashboard/polizas/${policy.id}`);
}

export async function updatePolicyAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireStaff();
  const id = formData.get("id") as string;

  const existing = await prisma.policy.findFirst({ where: { id, ...policyScopeWhere(session) } });
  if (!existing) notFound();

  const raw = readPolicyForm(formData);
  if (session.user.role !== "admin" && raw.sellerId !== session.user.sellerId) {
    return { error: "No podés reasignar la póliza a otro vendedor." };
  }

  const data = buildPolicyData(raw);
  const validationError = validateBusinessRules(data);
  if (validationError) return { error: validationError };

  const policy = await prisma.$transaction(async (tx) => {
    const updated = await tx.policy.update({ where: { id }, data });
    const lastVersion = await tx.policyVersion.findFirst({
      where: { policyId: id },
      orderBy: { versionNumber: "desc" },
    });
    await tx.policyVersion.create({
      data: {
        policyId: updated.id,
        versionNumber: (lastVersion?.versionNumber ?? 0) + 1,
        previousVersionId: lastVersion?.id,
        clientId: updated.clientId,
        branchId: updated.branchId,
        companyId: updated.companyId,
        sellerId: updated.sellerId,
        policyNumber: updated.policyNumber,
        coverageName: updated.coverageName,
        insuredObject: updated.insuredObject,
        insuredSum: updated.insuredSum,
        startDate: updated.startDate,
        endDate: updated.endDate,
        premiumAmount: updated.premiumAmount,
        commissionPercentage: updated.commissionPercentage,
        commissionAmount: updated.commissionAmount,
        paymentMethod: updated.paymentMethod,
        installmentCount: updated.installmentCount,
        paymentStatus: updated.paymentStatus,
        updateFrequency: updated.updateFrequency,
        createdBy: session.user.id,
        changeReason: "correction",
      },
    });
    return updated;
  });

  await logAudit({
    userId: session.user.id,
    entityType: "Policy",
    entityId: policy.id,
    action: "update",
    oldValues: existing,
    newValues: policy,
  });

  revalidatePath(`/dashboard/clientes/${policy.clientId}`);
  revalidatePath(`/dashboard/polizas/${id}`);
  redirect(`/dashboard/polizas/${id}`);
}

const renewSchema = z.object({
  id: z.string().min(1),
  startDate: z.string().min(1, "Requerido"),
  endDate: z.string().min(1, "Requerido"),
  premiumAmount: z.string().optional(),
  commissionPercentage: z.string().optional(),
  policyNumber: z.string().optional(),
});

export async function renewPolicyAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireStaff();
  const parsed = renewSchema.safeParse({
    id: formData.get("id"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    premiumAmount: formData.get("premiumAmount") || undefined,
    commissionPercentage: formData.get("commissionPercentage") || undefined,
    policyNumber: formData.get("policyNumber") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { id, ...form } = parsed.data;

  const existing = await prisma.policy.findFirst({ where: { id, ...policyScopeWhere(session) } });
  if (!existing) notFound();

  if (new Date(form.endDate) < new Date(form.startDate)) {
    return { error: "La fecha de vencimiento no puede ser anterior a la de emisión." };
  }

  const premiumAmount = num(form.premiumAmount) ?? existing.premiumAmount;
  const commissionPercentage = toFraction(num(form.commissionPercentage)) ?? existing.commissionPercentage;
  const commissionAmount =
    premiumAmount !== null && commissionPercentage !== null
      ? Math.round(premiumAmount * commissionPercentage * 100) / 100
      : null;

  const policy = await prisma.$transaction(async (tx) => {
    const lastVersion = await tx.policyVersion.findFirst({
      where: { policyId: id },
      orderBy: { versionNumber: "desc" },
    });

    const updated = await tx.policy.update({
      where: { id },
      data: {
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
        premiumAmount,
        commissionPercentage,
        commissionAmount,
        policyNumber: form.policyNumber || existing.policyNumber,
        status: "active",
        lastUpdateDate: new Date(),
      },
    });

    await tx.policyVersion.create({
      data: {
        policyId: updated.id,
        versionNumber: (lastVersion?.versionNumber ?? 0) + 1,
        previousVersionId: lastVersion?.id,
        clientId: updated.clientId,
        branchId: updated.branchId,
        companyId: updated.companyId,
        sellerId: updated.sellerId,
        policyNumber: updated.policyNumber,
        coverageName: updated.coverageName,
        insuredObject: updated.insuredObject,
        insuredSum: updated.insuredSum,
        startDate: updated.startDate,
        endDate: updated.endDate,
        premiumAmount: updated.premiumAmount,
        commissionPercentage: updated.commissionPercentage,
        commissionAmount: updated.commissionAmount,
        paymentMethod: updated.paymentMethod,
        installmentCount: updated.installmentCount,
        paymentStatus: updated.paymentStatus,
        updateFrequency: updated.updateFrequency,
        createdBy: session.user.id,
        changeReason: "renewal",
      },
    });

    return updated;
  });

  await logAudit({
    userId: session.user.id,
    entityType: "Policy",
    entityId: policy.id,
    action: "update",
    oldValues: existing,
    newValues: policy,
  });

  revalidatePath(`/dashboard/clientes/${policy.clientId}`);
  revalidatePath(`/dashboard/polizas/${id}`);
  redirect(`/dashboard/polizas/${id}`);
}

const cancelSchema = z.object({
  id: z.string().min(1),
  reason: z.string().min(1),
  notes: z.string().optional(),
  newStatus: z.enum(["cancelled", "lost"]),
});

export async function cancelPolicyAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireStaff();
  const parsed = cancelSchema.safeParse({
    id: formData.get("id"),
    reason: formData.get("reason"),
    notes: formData.get("notes") || undefined,
    newStatus: formData.get("newStatus"),
  });
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }
  const { id, reason, notes, newStatus } = parsed.data;

  const existing = await prisma.policy.findFirst({ where: { id, ...policyScopeWhere(session) } });
  if (!existing) notFound();

  const policy = await prisma.$transaction(async (tx) => {
    const updated = await tx.policy.update({
      where: { id },
      data: {
        status: newStatus,
        cancellationReason: reason,
        cancellationDate: new Date(),
      },
    });
    await tx.policyCancellation.create({
      data: {
        policyId: id,
        cancellationDate: new Date(),
        reason,
        notes: notes || null,
        createdBy: session.user.id,
      },
    });
    return updated;
  });

  await logAudit({
    userId: session.user.id,
    entityType: "Policy",
    entityId: policy.id,
    action: "status_change",
    oldValues: existing,
    newValues: policy,
  });

  revalidatePath(`/dashboard/clientes/${policy.clientId}`);
  revalidatePath(`/dashboard/polizas/${id}`);
  redirect(`/dashboard/polizas/${id}`);
}
