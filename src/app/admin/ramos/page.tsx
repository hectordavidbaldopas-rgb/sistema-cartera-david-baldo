import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import BranchRow from "./branch-row";

export default async function RamosPage() {
  await requireAdmin();
  const branches = await prisma.insuranceBranch.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <h2 className="mb-6 text-base font-semibold text-gold-300">Ramos</h2>
      <div className="space-y-3">
        <BranchRow branch={null} />
        {branches.map((b) => (
          <BranchRow key={b.id} branch={b} />
        ))}
      </div>
    </div>
  );
}
