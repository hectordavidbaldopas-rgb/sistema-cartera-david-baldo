import { prisma } from "@/lib/prisma";

// action: "create" | "update" | "delete" | "login" | "import" | "export" | "status_change" | "settlement" | "other"
export async function logAudit(params: {
  userId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: unknown;
  newValues?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      oldValues: params.oldValues ? JSON.parse(JSON.stringify(params.oldValues)) : undefined,
      newValues: params.newValues ? JSON.parse(JSON.stringify(params.newValues)) : undefined,
    },
  });
}
