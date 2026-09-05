import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { notFound } from "next/navigation";
import EditarVendedorForm from "./form";

export default async function EditarVendedorPage(props: PageProps<"/admin/vendedores/[id]">) {
  await requireAdmin();
  const { id } = await props.params;
  const seller = await prisma.seller.findUnique({ where: { id } });
  if (!seller) notFound();

  return (
    <div>
      <h2 className="mb-6 text-base font-semibold text-gold-300">
        Editar vendedor — {seller.fullName}
      </h2>
      <EditarVendedorForm seller={seller} />
    </div>
  );
}
