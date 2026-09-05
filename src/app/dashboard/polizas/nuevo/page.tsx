import { prisma } from "@/lib/prisma";
import { requireStaff, clientScopeWhere } from "@/lib/authz";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import { primaryButtonClass } from "@/lib/ui";
import ClientPicker from "./client-picker";

export default async function NuevaPolizaElegirClientePage() {
  const session = await requireStaff();

  const clients = await prisma.client.findMany({
    where: clientScopeWhere(session),
    orderBy: { fullNameNormalized: "asc" },
    select: { id: true, fullNameNormalized: true, phone: true },
  });

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-white/70 hover:underline">
            ← Volver
          </Link>
          <HomeButton href="/dashboard" />
        </div>
        <h1 className="text-lg font-semibold text-gold-300">Cargar nueva póliza</h1>
        <p className="text-sm text-white/70">Elegí primero a qué cliente pertenece.</p>
      </header>
      <main className="mx-auto max-w-xl px-6 py-8">
        <ClientPicker clients={clients} />
        <div className="mt-6 border-t border-gold-500/30 pt-4">
          <p className="mb-2 text-sm text-white/70">¿El cliente todavía no existe?</p>
          <Link href="/dashboard/clientes/nuevo" className={primaryButtonClass}>
            + Crear cliente nuevo
          </Link>
        </div>
      </main>
    </div>
  );
}
