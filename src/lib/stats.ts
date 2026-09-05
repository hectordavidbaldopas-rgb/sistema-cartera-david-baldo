import { prisma } from "@/lib/prisma";
import { EXPIRY_THRESHOLDS } from "@/lib/expiry";
import type { Prisma } from "@prisma/client";

// Ver ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md sección 30 — todo esto se
// calcula en vivo a partir de policies/clients, nada se guarda como
// métrica derivada aparte.

const IN_FORCE_STATUS = ["active", "pending_renewal"] as const;

function warningDate() {
  const d = new Date();
  d.setDate(d.getDate() + EXPIRY_THRESHOLDS.warningDays);
  return d;
}

export async function getCarteraTotal(policyWhere: Prisma.PolicyWhereInput, clientWhere: Prisma.ClientWhereInput) {
  const [clientsActive, activePolicies, sums, upcomingRenewals, incompletePolicies] = await Promise.all([
    prisma.client.count({ where: { ...clientWhere, isActive: true } }),
    prisma.policy.count({ where: { ...policyWhere, status: { in: [...IN_FORCE_STATUS] } } }),
    prisma.policy.aggregate({
      where: { ...policyWhere, status: { in: [...IN_FORCE_STATUS] } },
      _sum: { premiumAmount: true, commissionAmount: true },
    }),
    prisma.policy.count({
      where: { ...policyWhere, endDate: { not: null, lte: warningDate() }, status: { notIn: ["cancelled", "lost"] } },
    }),
    prisma.policy.count({ where: { ...policyWhere, status: "draft" } }),
  ]);

  return {
    clientsActive,
    activePolicies,
    totalPremium: sums._sum.premiumAmount ?? 0,
    estimatedCommission: sums._sum.commissionAmount ?? 0,
    upcomingRenewals,
    incompletePolicies,
  };
}

export async function getStatsBySeller() {
  const sellers = await prisma.seller.findMany({ where: { isActive: true }, orderBy: { fullName: "asc" } });

  return Promise.all(
    sellers.map(async (seller) => {
      const policyWhere: Prisma.PolicyWhereInput = { sellerId: seller.id };
      const [cartera, openFollowUps, pendingTasks] = await Promise.all([
        getCarteraTotal(policyWhere, { policies: { some: { sellerId: seller.id } } }),
        prisma.followUp.count({ where: { sellerId: seller.id, status: { notIn: ["renewed", "lost"] } } }),
        prisma.task.count({ where: { sellerId: seller.id, status: { in: ["pending", "in_progress"] } } }),
      ]);
      return { seller, ...cartera, openFollowUps, pendingTasks };
    }),
  );
}

export async function getStatsByBranch(policyWhere: Prisma.PolicyWhereInput) {
  const branches = await prisma.insuranceBranch.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

  return Promise.all(
    branches.map(async (branch) => {
      const where: Prisma.PolicyWhereInput = { ...policyWhere, branchId: branch.id };
      const [total, premium, lost, concluded] = await Promise.all([
        prisma.policy.count({ where }),
        prisma.policy.aggregate({ where, _sum: { premiumAmount: true } }),
        prisma.policy.count({ where: { ...where, status: { in: ["cancelled", "lost"] } } }),
        prisma.policy.count({ where: { ...where, status: { not: "draft" } } }),
      ]);
      const retention = concluded > 0 ? (concluded - lost) / concluded : null;
      return { branch, total, premium: premium._sum.premiumAmount ?? 0, retention };
    }),
  );
}

export async function getStatsByCompany(policyWhere: Prisma.PolicyWhereInput) {
  const companies = await prisma.insuranceCompany.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  return Promise.all(
    companies.map(async (company) => {
      const where: Prisma.PolicyWhereInput = { ...policyWhere, companyId: company.id };
      const [total, premium, lost, concluded, oldest] = await Promise.all([
        prisma.policy.count({ where }),
        prisma.policy.aggregate({ where, _sum: { premiumAmount: true } }),
        prisma.policy.count({ where: { ...where, status: { in: ["cancelled", "lost"] } } }),
        prisma.policy.count({ where: { ...where, status: { not: "draft" } } }),
        prisma.policy.findFirst({ where: { ...where, startDate: { not: null } }, orderBy: { startDate: "asc" } }),
      ]);
      const retention = concluded > 0 ? (concluded - lost) / concluded : null;
      return { company, total, premium: premium._sum.premiumAmount ?? 0, retention, oldestStartDate: oldest?.startDate ?? null };
    }),
  );
}

export async function getRetention(policyWhere: Prisma.PolicyWhereInput) {
  const [renewed, lost, cancellationReasons] = await Promise.all([
    prisma.policy.count({
      where: { ...policyWhere, versions: { some: { changeReason: "renewal" } } },
    }),
    prisma.policy.count({ where: { ...policyWhere, status: { in: ["cancelled", "lost"] } } }),
    prisma.policyCancellation.groupBy({
      by: ["reason"],
      where: policyWhere.sellerId ? { policy: { sellerId: policyWhere.sellerId as string } } : {},
      _count: { reason: true },
    }),
  ]);

  const denominator = renewed + lost;
  return {
    renewed,
    lost,
    retentionRate: denominator > 0 ? renewed / denominator : null,
    cancellationReasons: cancellationReasons
      .map((r) => ({ reason: r.reason, count: r._count.reason }))
      .sort((a, b) => b.count - a.count),
  };
}
