import { prisma } from "@/lib/prisma";

// Ver ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md sección 19 — comisión generada,
// cobrada, pendiente y pagada son cuatro cosas separadas. Acá solo se
// resuelve "generada" (a partir de la prima mensual y el % de comisión de
// cada póliza vigente); cobrada/pagada se registran a mano porque dependen
// de que la compañía y el vendedor confirmen esos movimientos reales.

export type CommissionCandidate = {
  policyId: string;
  policyVersionId: string | null;
  sellerId: string;
  sellerName: string;
  clientName: string;
  branchName: string;
  premiumBase: number;
  commissionPercentage: number;
  generatedAmount: number;
};

export async function previewCommissionGeneration(
  periodMonth: number,
  periodYear: number,
  sellerId: string | null,
): Promise<CommissionCandidate[]> {
  const policies = await prisma.policy.findMany({
    where: {
      status: { in: ["active", "pending_renewal"] },
      premiumAmount: { not: null },
      commissionPercentage: { not: null },
      ...(sellerId ? { sellerId } : {}),
    },
    include: { seller: true, client: true, branch: true },
  });

  const candidates: CommissionCandidate[] = [];
  for (const p of policies) {
    const existing = await prisma.commissionRecord.findFirst({
      where: { policyId: p.id, periodMonth, periodYear },
    });
    if (existing) continue;

    const premiumBase = p.premiumAmount!;
    const commissionPercentage = p.commissionPercentage!;
    const generatedAmount = Math.round(premiumBase * commissionPercentage * 100) / 100;

    const lastVersion = await prisma.policyVersion.findFirst({
      where: { policyId: p.id },
      orderBy: { versionNumber: "desc" },
      select: { id: true },
    });

    candidates.push({
      policyId: p.id,
      policyVersionId: lastVersion?.id ?? null,
      sellerId: p.sellerId,
      sellerName: p.seller.displayName,
      clientName: p.client.fullNameNormalized,
      branchName: p.branch.name,
      premiumBase,
      commissionPercentage,
      generatedAmount,
    });
  }
  return candidates;
}

export async function generateCommissions(
  periodMonth: number,
  periodYear: number,
  sellerId: string | null,
): Promise<number> {
  const candidates = await previewCommissionGeneration(periodMonth, periodYear, sellerId);
  if (candidates.length === 0) return 0;

  await prisma.commissionRecord.createMany({
    data: candidates.map((c) => ({
      policyId: c.policyId,
      policyVersionId: c.policyVersionId,
      sellerId: c.sellerId,
      periodMonth,
      periodYear,
      premiumBase: c.premiumBase,
      commissionPercentage: c.commissionPercentage,
      generatedAmount: c.generatedAmount,
      pendingAmount: c.generatedAmount,
      status: "generated",
    })),
  });
  return candidates.length;
}
