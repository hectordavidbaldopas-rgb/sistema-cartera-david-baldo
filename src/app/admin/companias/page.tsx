import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import CompanyRow from "./company-row";

export default async function CompaniasPage() {
  await requireAdmin();
  const companies = await prisma.insuranceCompany.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h2 className="mb-6 text-base font-semibold text-gold-300">Compañías</h2>
      <div className="space-y-3">
        <CompanyRow company={null} />
        {companies.map((c) => (
          <CompanyRow key={c.id} company={c} />
        ))}
      </div>
    </div>
  );
}
