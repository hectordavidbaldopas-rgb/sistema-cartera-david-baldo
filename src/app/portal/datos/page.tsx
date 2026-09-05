import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/authz";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import { notFound } from "next/navigation";
import EditDataForm from "./form";

export default async function MisDatosPage() {
  const session = await requireClient();
  const clientId = session.user.clientId;
  if (!clientId) notFound();

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) notFound();

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/portal" className="text-sm text-white/70 hover:underline">
            ← Volver
          </Link>
          <HomeButton href="/portal" />
        </div>
        <h1 className="text-lg font-semibold text-gold-300">Mis datos de contacto</h1>
        <p className="text-sm text-white/70">
          Para corregir tu fecha de nacimiento, escribinos.
        </p>
      </header>
      <main className="mx-auto max-w-lg px-6 py-8">
        <EditDataForm client={client} />
      </main>
    </div>
  );
}
