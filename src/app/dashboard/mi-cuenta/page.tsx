import { requireStaff } from "@/lib/authz";
import Link from "next/link";
import HomeButton from "@/components/home-button";
import ChangePasswordForm from "@/components/change-password-form";

export default async function MiCuentaPage() {
  const session = await requireStaff();

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-white/70 hover:underline">
            ← Volver
          </Link>
          <HomeButton href="/dashboard" />
        </div>
        <h1 className="text-lg font-semibold text-gold-300">Mi cuenta</h1>
        <p className="text-sm text-white/70">Usuario: {session.user.email}</p>
      </header>
      <main className="mx-auto max-w-md px-6 py-8">
        <ChangePasswordForm />
      </main>
    </div>
  );
}
