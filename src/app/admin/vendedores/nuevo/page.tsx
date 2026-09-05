import { requireAdmin } from "@/lib/authz";
import NuevoVendedorForm from "./form";

export default async function NuevoVendedorPage() {
  await requireAdmin();
  return (
    <div>
      <h2 className="mb-6 text-base font-semibold text-gold-300">Nuevo vendedor</h2>
      <NuevoVendedorForm />
    </div>
  );
}
