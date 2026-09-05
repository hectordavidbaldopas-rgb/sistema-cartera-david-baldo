import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { cardClass, primaryButtonClass, secondaryButtonClass } from "@/lib/ui";
import Link from "next/link";

export default async function VendedoresPage() {
  await requireAdmin();
  const sellers = await prisma.seller.findMany({
    orderBy: { fullName: "asc" },
    include: { user: true, _count: { select: { policies: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gold-300">Vendedores</h2>
        <Link href="/admin/vendedores/nuevo" className={primaryButtonClass}>
          + Nuevo vendedor
        </Link>
      </div>
      <div className="space-y-3">
        {sellers.map((s) => (
          <div key={s.id} className={`${cardClass} flex items-center justify-between`}>
            <div>
              <p className="font-medium text-gold-300">
                {s.fullName}{" "}
                {!s.isActive && (
                  <span className="ml-1 rounded-full bg-navy-800 px-2 py-0.5 text-xs text-white/70">
                    inactivo
                  </span>
                )}
              </p>
              <p className="text-sm text-white/70">
                {s.locality ?? "—"} · {s.user?.role === "admin" ? "Administrador" : "Vendedor"} ·{" "}
                {s._count.policies} pólizas
              </p>
              <p className="text-sm text-white/70">
                Login (DNI): {s.user?.email ?? "sin usuario"}
                {!s.documentNumber && (
                  <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                    provisorio, falta DNI
                  </span>
                )}
                {" · "}Contacto: {s.email ?? "—"} / {s.phone ?? "—"}
              </p>
            </div>
            <Link
              href={`/admin/vendedores/${s.id}`}
              className={secondaryButtonClass}
            >
              Editar
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
