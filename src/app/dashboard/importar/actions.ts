"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import { logAudit } from "@/lib/audit";
import { parseClientListFile } from "@/lib/import/parse";
import { analyzeImportRows } from "@/lib/import/analyze";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function uploadImportAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await requireStaff();
  const file = formData.get("file") as File | null;
  const sellerId = isAdmin(session.user.role)
    ? (formData.get("sellerId") as string)
    : session.user.sellerId;

  if (!file || file.size === 0) {
    return { error: "Elegí un archivo." };
  }
  if (!sellerId) {
    return { error: "Elegí a qué vendedor pertenecen estos clientes." };
  }

  let rows;
  try {
    const buffer = await file.arrayBuffer();
    rows = parseClientListFile(buffer);
  } catch {
    return { error: "No se pudo leer el archivo. Tiene que ser un .xlsx o .csv." };
  }
  if (rows.length === 0) {
    return { error: "El archivo no tiene filas con datos." };
  }

  const analyzed = await analyzeImportRows(rows);

  const batch = await prisma.importBatch.create({
    data: {
      fileName: file.name,
      importedBy: session.user.id,
      totalRows: analyzed.length,
      validRows: analyzed.filter((r) => r.validationStatus === "valid").length,
      incompleteRows: analyzed.filter((r) => r.validationStatus === "incomplete").length,
      reviewRows: analyzed.filter((r) => r.duplicateStatus === "possible").length,
      status: "preview",
    },
  });

  await prisma.importRow.createMany({
    data: analyzed.map((r, i) => ({
      batchId: batch.id,
      rowNumber: r.rowNumber,
      rawData: { nombre: r.nombre, telefono: r.telefono, ramo: rows[i].ramo, sellerId },
      normalizedData: {
        ramoTokens: r.ramoTokens,
        matchedClientName: r.matchedClientName,
        duplicatePhoneInBatch: r.duplicatePhoneInBatch,
      },
      validationStatus: r.validationStatus,
      validationErrors: r.validationErrors.length ? r.validationErrors : undefined,
      duplicateStatus: r.duplicateStatus,
      matchedClientId: r.matchedClientId,
      action: r.suggestedAction,
    })),
  });

  await logAudit({
    userId: session.user.id,
    entityType: "ImportBatch",
    entityId: batch.id,
    action: "import",
    newValues: { fileName: file.name, totalRows: analyzed.length },
  });

  redirect(`/dashboard/importar/${batch.id}`);
}

export async function confirmImportAction(formData: FormData) {
  const session = await requireStaff();
  const batchId = formData.get("batchId") as string;

  const batch = await prisma.importBatch.findUnique({ where: { id: batchId } });
  if (!batch) notFound();
  if (!isAdmin(session.user.role) && batch.importedBy !== session.user.id) notFound();

  const rows = await prisma.importRow.findMany({ where: { batchId }, orderBy: { rowNumber: "asc" } });

  const branches = await prisma.insuranceBranch.findMany();
  const branchIdByName = new Map(branches.map((b) => [b.name, b.id]));

  let imported = 0;

  for (const row of rows) {
    const chosenAction = (formData.get(`action-${row.id}`) as string) || row.action;
    const raw = row.rawData as { nombre: string; telefono: string; ramo: string; sellerId: string };
    const normalized = row.normalizedData as {
      ramoTokens: { raw: string; branchName: string; mapped: boolean }[];
    } | null;

    if (chosenAction === "skip") {
      await prisma.importRow.update({ where: { id: row.id }, data: { action: "skip" } });
      continue;
    }

    if (chosenAction === "update" && row.matchedClientId) {
      const client = await prisma.client.findUnique({ where: { id: row.matchedClientId } });
      if (client) {
        await prisma.client.update({
          where: { id: client.id },
          data: { phone: client.phone ?? (raw.telefono || null) },
        });
        await createPoliciesForClient(client.id, raw, normalized, branchIdByName, batchId, row.rowNumber, session.user.id);
        imported++;
      }
      await prisma.importRow.update({
        where: { id: row.id },
        data: { action: "update", matchedClientId: row.matchedClientId },
      });
      continue;
    }

    // create
    const client = await prisma.client.create({
      data: {
        fullNameNormalized: raw.nombre.toUpperCase(),
        phone: raw.telefono || null,
        informationStatus: raw.telefono ? "partial" : "incomplete",
        createdBy: session.user.id,
        updatedBy: session.user.id,
      },
    });
    await createPoliciesForClient(client.id, raw, normalized, branchIdByName, batchId, row.rowNumber, session.user.id);
    imported++;

    await prisma.importRow.update({
      where: { id: row.id },
      data: { action: "create", matchedClientId: client.id },
    });
  }

  await prisma.importBatch.update({
    where: { id: batchId },
    data: { status: "completed", importedRows: imported },
  });

  await logAudit({
    userId: session.user.id,
    entityType: "ImportBatch",
    entityId: batchId,
    action: "import",
    newValues: { status: "completed", importedRows: imported },
  });

  revalidatePath(`/dashboard/importar/${batchId}`);
  revalidatePath("/dashboard/clientes");
}

async function createPoliciesForClient(
  clientId: string,
  raw: { ramo: string; sellerId: string },
  normalized: { ramoTokens: { raw: string; branchName: string; mapped: boolean }[] } | null,
  branchIdByName: Map<string, string>,
  batchId: string,
  rowNumber: number,
  createdBy: string,
) {
  const tokens = normalized?.ramoTokens ?? [];
  for (const t of tokens) {
    const branchId = branchIdByName.get(t.branchName) ?? branchIdByName.get("Otro");
    if (!branchId) continue;
    const notes = t.mapped
      ? null
      : `Ramo "${t.raw}" no tiene categoría exacta en el desplegable, se dejó como Otro.`;

    const policy = await prisma.policy.create({
      data: {
        clientId,
        branchId,
        sellerId: raw.sellerId,
        status: "draft",
        commissionPercentage: 0.1,
        importBatchId: batchId,
        sourceRowNumber: rowNumber,
      },
    });
    await prisma.policyVersion.create({
      data: {
        policyId: policy.id,
        versionNumber: 1,
        clientId,
        branchId,
        sellerId: raw.sellerId,
        commissionPercentage: 0.1,
        changeReason: "import",
        createdBy,
      },
    });
    if (notes) {
      const client = await prisma.client.findUnique({ where: { id: clientId } });
      const combinedNotes = [client?.notes, notes].filter(Boolean).join("\n---\n");
      await prisma.client.update({ where: { id: clientId }, data: { notes: combinedNotes } });
    }
  }
}

export async function cancelImportAction(formData: FormData) {
  const session = await requireStaff();
  const batchId = formData.get("batchId") as string;
  const batch = await prisma.importBatch.findUnique({ where: { id: batchId } });
  if (!batch) notFound();
  if (!isAdmin(session.user.role) && batch.importedBy !== session.user.id) notFound();

  await prisma.importRow.deleteMany({ where: { batchId } });
  await prisma.importBatch.update({ where: { id: batchId }, data: { status: "cancelled" } });

  await logAudit({
    userId: session.user.id,
    entityType: "ImportBatch",
    entityId: batchId,
    action: "other",
    newValues: { status: "cancelled" },
  });

  redirect("/dashboard/importar");
}
