import { prisma } from "@/lib/prisma";
import { requireStaff, clientScopeWhere } from "@/lib/authz";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import { notFound } from "next/navigation";
import ClientForm from "../../client-form";
import { updateClientAction } from "../../actions";

export default async function EditarClientePage(props: PageProps<"/dashboard/clientes/[id]/editar">) {
  const session = await requireStaff();
  const { id } = await props.params;

  const client = await prisma.client.findFirst({
    where: { id, ...clientScopeWhere(session) },
  });
  if (!client) notFound();

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href={`/dashboard/clientes/${client.id}`} className="text-sm text-white/70 hover:underline">
            ← {client.fullNameNormalized}
          </Link>
          <HomeButton href="/dashboard" />
        </div>
        <h1 className="text-lg font-semibold text-gold-300">Editar cliente</h1>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <ClientForm action={updateClientAction} client={client} submitLabel="Guardar cambios" />
      </main>
    </div>
  );
}
