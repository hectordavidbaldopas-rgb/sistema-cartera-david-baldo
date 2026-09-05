import { prisma } from "@/lib/prisma";
import { EXPIRY_THRESHOLDS } from "@/lib/expiry";

// Ver ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md sección 15 — reglas
// automáticas de generación de tareas. Viven acá (backend), no en el
// frontend, y son fáciles de ajustar sin tocar las pantallas.
//
// IMPORTANTE: esto NUNCA se corre solo. Siempre hay que previsualizar
// primero (previewAutomaticTasks) y confirmar explícitamente antes de
// escribir (generateAutomaticTasks) — con la cartera real, la regla de
// "datos incompletos" sola puede proponer cientos de tareas de una vez,
// y eso lo tiene que decidir una persona, no la app sola.

export const AUTO_TASK_CONFIG = {
  staleClientDays: 180, // regla 4: cliente sin actualización
};

export type AutoTaskCandidate = {
  ruleId: string;
  ruleLabel: string;
  taskType: string;
  title: string;
  sellerId: string;
  clientId: string | null;
  policyId: string | null;
  dueDate: Date | null;
};

async function existingPendingTask(clientId: string | null, policyId: string | null, taskType: string) {
  return prisma.task.findFirst({
    where: {
      taskType,
      status: { in: ["pending", "in_progress"] },
      clientId: clientId ?? undefined,
      policyId: policyId ?? undefined,
    },
  });
}

export async function previewAutomaticTasks(sellerId: string | null): Promise<AutoTaskCandidate[]> {
  const sellerFilter = sellerId ? { sellerId } : {};
  const candidates: AutoTaskCandidate[] = [];
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + EXPIRY_THRESHOLDS.warningDays);
  const staleDate = new Date();
  staleDate.setDate(staleDate.getDate() - AUTO_TASK_CONFIG.staleClientDays);

  // Regla 1: renovación próxima.
  const renewals = await prisma.policy.findMany({
    where: {
      ...sellerFilter,
      status: { in: ["active", "pending_renewal"] },
      endDate: { not: null, lte: warningDate },
    },
    include: { client: true, branch: true },
  });
  for (const p of renewals) {
    candidates.push({
      ruleId: "renewal_due",
      ruleLabel: "Renovación próxima",
      taskType: "renewal",
      title: `Renovar ${p.branch.name} — ${p.client.fullNameNormalized}`,
      sellerId: p.sellerId,
      clientId: p.clientId,
      policyId: p.id,
      dueDate: p.endDate,
    });
  }

  // Regla 2: seguimiento pendiente vencido.
  const dueFollowUps = await prisma.followUp.findMany({
    where: {
      ...sellerFilter,
      status: { notIn: ["renewed", "lost"] },
      completedAt: null,
      dueDate: { not: null, lte: new Date() },
    },
    include: { client: true },
  });
  for (const f of dueFollowUps) {
    candidates.push({
      ruleId: "follow_up_due",
      ruleLabel: "Seguimiento pendiente",
      taskType: "follow_up",
      title: `Seguimiento: ${f.subject} — ${f.client.fullNameNormalized}`,
      sellerId: f.sellerId,
      clientId: f.clientId,
      policyId: f.policyId,
      dueDate: f.dueDate,
    });
  }

  // Regla 3: cliente con datos incompletos (y al menos una póliza real).
  // Un cliente puede no tener sellerId propio, así que la tarea se le
  // asigna al vendedor de su primera póliza.
  const incompleteClients = await prisma.client.findMany({
    where: {
      isActive: true,
      informationStatus: { not: "complete" },
      policies: sellerId ? { some: { sellerId } } : { some: {} },
    },
    include: { policies: { select: { sellerId: true }, take: 1 } },
  });
  for (const c of incompleteClients) {
    const owner = sellerId ?? c.policies[0]?.sellerId;
    if (!owner) continue;
    candidates.push({
      ruleId: "missing_client_data",
      ruleLabel: "Datos de cliente incompletos",
      taskType: "missing_data",
      title: `Completar datos de ${c.fullNameNormalized}`,
      sellerId: owner,
      clientId: c.id,
      policyId: null,
      dueDate: null,
    });
  }

  // Regla 4: cliente sin actualización en mucho tiempo.
  const staleClients = await prisma.client.findMany({
    where: {
      isActive: true,
      updatedAt: { lte: staleDate },
      policies: sellerId ? { some: { sellerId } } : { some: {} },
    },
    include: { policies: { select: { sellerId: true }, take: 1 } },
  });
  for (const c of staleClients) {
    const owner = sellerId ?? c.policies[0]?.sellerId;
    if (!owner) continue;
    candidates.push({
      ruleId: "stale_client",
      ruleLabel: `Sin actualizar hace más de ${AUTO_TASK_CONFIG.staleClientDays} días`,
      taskType: "update_data",
      title: `Actualizar datos de ${c.fullNameNormalized}`,
      sellerId: owner,
      clientId: c.id,
      policyId: null,
      dueDate: null,
    });
  }

  // Regla 5: póliza no-borrador sin información económica.
  const noEconomicInfo = await prisma.policy.findMany({
    where: {
      ...sellerFilter,
      status: { notIn: ["draft", "cancelled", "lost"] },
      premiumAmount: null,
    },
    include: { client: true, branch: true },
  });
  for (const p of noEconomicInfo) {
    candidates.push({
      ruleId: "missing_economic_info",
      ruleLabel: "Póliza sin información económica",
      taskType: "missing_data",
      title: `Cargar prima de ${p.branch.name} — ${p.client.fullNameNormalized}`,
      sellerId: p.sellerId,
      clientId: p.clientId,
      policyId: p.id,
      dueDate: null,
    });
  }

  // Regla 6: póliza por vencer sin ningún seguimiento cargado.
  const expiringNoFollowUp = await prisma.policy.findMany({
    where: {
      ...sellerFilter,
      status: { notIn: ["cancelled", "lost"] },
      endDate: { not: null, lte: warningDate },
      followUps: { none: {} },
    },
    include: { client: true, branch: true },
  });
  for (const p of expiringNoFollowUp) {
    candidates.push({
      ruleId: "expiring_no_follow_up",
      ruleLabel: "Por vencer sin seguimiento",
      taskType: "follow_up",
      title: `Armar seguimiento: ${p.branch.name} vence pronto — ${p.client.fullNameNormalized}`,
      sellerId: p.sellerId,
      clientId: p.clientId,
      policyId: p.id,
      dueDate: p.endDate,
    });
  }

  // Descartar lo que ya tiene una tarea pendiente equivalente.
  const filtered: AutoTaskCandidate[] = [];
  for (const c of candidates) {
    const existing = await existingPendingTask(c.clientId, c.policyId, c.taskType);
    if (!existing) filtered.push(c);
  }
  return filtered;
}

export async function generateAutomaticTasks(
  sellerId: string | null,
  createdBy: string,
): Promise<number> {
  const candidates = await previewAutomaticTasks(sellerId);
  if (candidates.length === 0) return 0;

  await prisma.task.createMany({
    data: candidates.map((c) => ({
      clientId: c.clientId,
      policyId: c.policyId,
      sellerId: c.sellerId,
      taskType: c.taskType,
      title: c.title,
      dueDate: c.dueDate,
      priority: "medium",
      createdBy,
    })),
  });

  return candidates.length;
}
