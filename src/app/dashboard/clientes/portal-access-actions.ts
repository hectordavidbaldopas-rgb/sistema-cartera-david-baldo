"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff, clientScopeWhere } from "@/lib/authz";
import { clientUsernameFromPhone, isValidPhoneForLogin, CLIENT_DEFAULT_PASSWORD } from "@/lib/credentials";
import { logAudit } from "@/lib/audit";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

export type PortalAccessResult = { error: string | null; credentials: { user: string; password: string } | null };

export async function generatePortalAccessAction(
  _prevState: PortalAccessResult,
  formData: FormData,
): Promise<PortalAccessResult> {
  const session = await requireStaff();
  const clientId = formData.get("clientId") as string;

  const client = await prisma.client.findFirst({ where: { id: clientId, ...clientScopeWhere(session) } });
  if (!client) notFound();

  if (!client.phone || !isValidPhoneForLogin(client.phone)) {
    return { error: "Cargá primero un teléfono válido del cliente (botón Editar en su ficha).", credentials: null };
  }
  const username = clientUsernameFromPhone(client.phone);
  const password = CLIENT_DEFAULT_PASSWORD;
  const passwordHash = await bcrypt.hash(password, 10);

  const existingByUsername = await prisma.user.findUnique({ where: { email: username } });
  if (existingByUsername && existingByUsername.clientId !== clientId) {
    return {
      error:
        "Ya existe otro usuario con ese mismo usuario (los últimos 6 dígitos del teléfono coinciden con los de otro cliente). Revisá los teléfonos de ambos.",
      credentials: null,
    };
  }

  const existingAccount = await prisma.clientAccount.findUnique({ where: { clientId } });

  if (existingAccount) {
    // Ya tenía acceso: esto reinicia la contraseña a "0000" y actualiza el
    // usuario por si el teléfono cambió.
    await prisma.user.update({
      where: { id: existingAccount.userId },
      data: { email: username, passwordHash, isActive: true },
    });
  } else {
    const user = await prisma.user.create({
      data: { email: username, passwordHash, role: "client", clientId },
    });
    await prisma.clientAccount.create({ data: { clientId, userId: user.id } });
  }

  await logAudit({
    userId: session.user.id,
    entityType: "ClientAccount",
    entityId: clientId,
    action: existingAccount ? "update" : "create",
    newValues: { username },
  });

  revalidatePath(`/dashboard/clientes/${clientId}`);
  return { error: null, credentials: { user: username, password } };
}
