"use server";

import { requireStaff, clientScopeWhere } from "@/lib/authz";
import { generateBulkPortalAccess } from "@/lib/portal-bulk";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function generateBulkPortalAccessAction() {
  const session = await requireStaff();
  const result = await generateBulkPortalAccess(clientScopeWhere(session));

  await logAudit({
    userId: session.user.id,
    entityType: "ClientAccount",
    entityId: "bulk-generate",
    action: "create",
    newValues: { created: result.created, skipped: result.skipped.length },
  });

  revalidatePath("/dashboard/clientes");
  return result;
}
