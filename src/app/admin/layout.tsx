import Link from "next/link";
import LogoutButton from "../logout-button";
import HomeButton from "@/components/home-button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-sm text-white/70 hover:underline">
              ← Panel general
            </Link>
            <h1 className="text-lg font-semibold text-gold-300">Administración</h1>
          </div>
          <div className="flex items-center gap-3">
            <HomeButton href="/dashboard" />
            <LogoutButton />
          </div>
        </div>
        <nav className="mt-4 flex gap-4 text-sm">
          <Link href="/admin/vendedores" className="text-white/80 hover:text-gold-300">
            Vendedores
          </Link>
          <Link href="/admin/ramos" className="text-white/80 hover:text-gold-300">
            Ramos
          </Link>
          <Link href="/admin/companias" className="text-white/80 hover:text-gold-300">
            Compañías
          </Link>
          <Link href="/admin/plantillas" className="text-white/80 hover:text-gold-300">
            Plantillas WhatsApp
          </Link>
          <Link href="/admin/encuestas" className="text-white/80 hover:text-gold-300">
            Encuestas
          </Link>
          <Link href="/admin/auditoria" className="text-white/80 hover:text-gold-300">
            Auditoría
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
