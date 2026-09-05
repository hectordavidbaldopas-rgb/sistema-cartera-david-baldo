import { requireStaff } from "@/lib/authz";
import Link from "next/link";
import ClientForm from "../client-form";
import { createClientAction } from "../actions";

export default async function NuevoClientePage() {
  await requireStaff();
  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <Link href="/dashboard/clientes" className="text-sm text-white/70 hover:underline">
          ← Cartera de clientes
        </Link>
        <h1 className="text-lg font-semibold text-gold-300">Nuevo cliente</h1>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <ClientForm action={createClientAction} submitLabel="Crear cliente" />
      </main>
    </div>
  );
}
