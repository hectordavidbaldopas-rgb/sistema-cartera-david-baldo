import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { clientUsernameFromPhone, isValidPhoneForLogin, CLIENT_DEFAULT_PASSWORD } from "@/lib/credentials";
import bcrypt from "bcryptjs";

export type BulkPortalCandidate = {
  clientId: string;
  clientName: string;
  username: string;
};

export type BulkPortalSkip = {
  clientId: string;
  clientName: string;
  reason: string;
};

export type BulkPortalPreview = {
  candidates: BulkPortalCandidate[];
  skipped: BulkPortalSkip[];
};

// Ver README — clientes sin acceso todavía, con teléfono usable, dentro del
// alcance del que pide la vista previa (todos si admin, solo los propios si
// es vendedor). Nunca pisa a alguien que ya tiene cuenta.
export async function previewBulkPortalAccess(clientWhere: Prisma.ClientWhereInput): Promise<BulkPortalPreview> {
  const clients = await prisma.client.findMany({
    where: { ...clientWhere, clientAccount: null, phone: { not: null } },
    select: { id: true, fullNameNormalized: true, phone: true },
  });

  const existingUsernames = new Set(
    (await prisma.user.findMany({ where: { role: "client" }, select: { email: true } })).map((u) => u.email),
  );

  const candidates: BulkPortalCandidate[] = [];
  const skipped: BulkPortalSkip[] = [];
  const usedInBatch = new Map<string, string>(); // username -> clientName

  for (const c of clients) {
    if (!c.phone || !isValidPhoneForLogin(c.phone)) {
      skipped.push({ clientId: c.id, clientName: c.fullNameNormalized, reason: "Teléfono inválido o muy corto" });
      continue;
    }
    const username = clientUsernameFromPhone(c.phone);
    if (existingUsernames.has(username)) {
      skipped.push({
        clientId: c.id,
        clientName: c.fullNameNormalized,
        reason: `El usuario ${username} ya existe (otro cliente o vendedor)`,
      });
      continue;
    }
    if (usedInBatch.has(username)) {
      skipped.push({
        clientId: c.id,
        clientName: c.fullNameNormalized,
        reason: `Mismo teléfono (últimos 6) que ${usedInBatch.get(username)} — se omiten ambos, revisar a mano`,
      });
      continue;
    }
    usedInBatch.set(username, c.fullNameNormalized);
    candidates.push({ clientId: c.id, clientName: c.fullNameNormalized, username });
  }

  // Si dos clientes de este lote comparten teléfono, el primero que se
  // agregó también hay que sacarlo del resultado final.
  const usernameCounts = new Map<string, number>();
  for (const cand of candidates) usernameCounts.set(cand.username, (usernameCounts.get(cand.username) ?? 0) + 1);
  const finalCandidates = candidates.filter((cand) => usernameCounts.get(cand.username) === 1);

  return { candidates: finalCandidates, skipped };
}

export async function generateBulkPortalAccess(clientWhere: Prisma.ClientWhereInput): Promise<{
  created: number;
  skipped: BulkPortalSkip[];
}> {
  const { candidates, skipped } = await previewBulkPortalAccess(clientWhere);
  if (candidates.length === 0) return { created: 0, skipped };

  const passwordHash = await bcrypt.hash(CLIENT_DEFAULT_PASSWORD, 10);

  for (const cand of candidates) {
    const user = await prisma.user.create({
      data: { email: cand.username, passwordHash, role: "client", clientId: cand.clientId },
    });
    await prisma.clientAccount.create({ data: { clientId: cand.clientId, userId: user.id } });
  }

  return { created: candidates.length, skipped };
}
