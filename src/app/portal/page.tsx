import { requireClient } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { expiryLabel, expiryLevel, EXPIRY_BADGE_CLASS } from "@/lib/expiry";
import LogoutButton from "../logout-button";
import { LogoMark } from "@/components/logo";
import Link from "next/link";
import PolicyInfoForm from "./policy-info-form";

export default async function PortalPage() {
  const session = await requireClient();
  const clientId = session.user.clientId;

  const [client, branches, companies] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId ?? "__none__" },
      include: {
        policies: {
          where: { status: { notIn: ["cancelled", "lost"] } },
          include: { branch: true, company: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.insuranceBranch.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.insuranceCompany.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const contactPhone =
    (await prisma.systemSetting.findUnique({ where: { key: "contact_phone" } }))
      ?.value ?? "";
  const contactEmail =
    (await prisma.systemSetting.findUnique({ where: { key: "contact_email" } }))
      ?.value ?? "";

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="bg-texture-navy flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <LogoMark size={40} />
          <div>
            <h1 className="text-lg font-bold text-gold-300">
              Hola, {client?.fullNameNormalized ?? "cliente"}
            </h1>
            <p className="text-sm text-white/70">Portal David Baldo Seguros</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/portal/mi-cuenta" className="text-sm text-white/80 hover:text-white hover:underline">
            Mi cuenta
          </Link>
          <LogoutButton variant="dark" />
        </div>
      </header>
      <div className="divider-gold" />

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex gap-4 text-sm">
          <Link href="/portal/datos" className="font-medium text-gold-300 underline underline-offset-4">
            Mis datos →
          </Link>
          <Link href="/portal/encuestas" className="font-medium text-gold-300 underline underline-offset-4">
            Encuestas →
          </Link>
        </div>

        <h2 className="mb-3 text-sm font-semibold text-white/90">Tus coberturas</h2>
        <div className="space-y-3">
          {client?.policies.length ? (
            client.policies.map((p) => (
              <div key={p.id} className="rounded-xl border border-gold-500/30 bg-navy-900 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gold-300">{p.branch.name}</p>
                  {p.endDate && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${EXPIRY_BADGE_CLASS[expiryLevel(p.endDate)]}`}
                    >
                      {expiryLabel(p.endDate)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/70">
                  {p.company?.name ?? "Compañía a confirmar"}
                  {p.policyNumber ? ` · Póliza ${p.policyNumber}` : ""}
                </p>
                {(!p.companyId || p.branch.name === "Otro") && (
                  <PolicyInfoForm
                    policyId={p.id}
                    branchId={p.branchId}
                    companyId={p.companyId}
                    branches={branches}
                    companies={companies}
                  />
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-white/70">
              Todavía no tenés coberturas cargadas.
            </p>
          )}
        </div>

        <div className="mt-8 rounded-xl border border-gold-500/30 bg-navy-900 p-4">
          <p className="text-sm font-medium text-gold-300">
            ¿Necesitás algo?
          </p>
          <p className="mt-1 text-sm text-white/80">
            📞 {contactPhone} · ✉️ {contactEmail}
          </p>
        </div>
      </main>
    </div>
  );
}
