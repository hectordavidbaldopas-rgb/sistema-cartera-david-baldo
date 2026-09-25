import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { notFound } from "next/navigation";
import EditarVendedorForm from "./form";
import ReassignSellerForm from "./reassign-form";

export default async function EditarVendedorPage(props: PageProps<"/admin/vendedores/[id]">) {
  await requireAdmin();
  const { id } = await props.params;
  const seller = await prisma.seller.findUnique({ where: { id } });
  if (!seller) notFound();

  const [policyCount, otherSellers] = await Promise.all([
    prisma.policy.count({ where: { sellerId: id } }),
    prisma.seller.findMany({
      where: { isActive: true, id: { not: id } },
      orderBy: { displayName: "asc" },
      select: { id: true, displayName: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-semibold text-gold-300">
        Editar vendedor — {seller.fullName}
      </h2>
      <EditarVendedorForm seller={seller} />
      {seller.isActive && otherSellers.length > 0 && (
        <ReassignSellerForm
          sellerId={seller.id}
          sellerName={seller.displayName}
          policyCount={policyCount}
          otherSellers={otherSellers}
        />
      )}
    </div>
  );
}
