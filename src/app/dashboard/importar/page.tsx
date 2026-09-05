import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/authz";
import { isAdmin } from "@/lib/roles";
import { cardClass } from "@/lib/ui";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import UploadForm from "./upload-form";

export default async function ImportarPage() {
  const session = await requireStaff();
  const admin = isAdmin(session.user.role);

  const [sellers, recentBatches] = await Promise.all([
    admin ? prisma.seller.findMany({ where: { isActive: true }, orderBy: { fullName: "asc" } }) : Promise.resolve([]),
    prisma.importBatch.findMany({
      where: admin ? {} : { importedBy: session.user.id },
      orderBy: { importedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-white/70 hover:underline">
            ← Volver
          </Link>
          <HomeButton href="/dashboard" />
        </div>
        <h1 className="text-lg font-semibold text-gold-300">Importar clientes desde Excel</h1>
        <p className="text-sm text-white/70">
          Formato: una lista simple, sin encabezado — columna A nombre, columna B teléfono,
          columna C ramo (ej: &quot;AUTO-MOTO&quot;, &quot;PICK UP - HOGAR&quot;).
        </p>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-6 py-8">
        <UploadForm sellers={sellers} isAdmin={admin} />

        {recentBatches.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-white/90">Importaciones recientes</h2>
            <div className="space-y-2">
              {recentBatches.map((b) => (
                <Link key={b.id} href={`/dashboard/importar/${b.id}`} className={`${cardClass} block hover:border-gold-500/40`}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gold-300">{b.fileName}</p>
                    <span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs text-white/80">
                      {b.status}
                    </span>
                  </div>
                  <p className="text-sm text-white/70">
                    {b.totalRows} filas · {new Date(b.importedAt).toLocaleString("es-AR")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
