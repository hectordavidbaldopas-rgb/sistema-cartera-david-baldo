import { requireClient } from "@/lib/authz";
import Link from "next/link";
import ChangePasswordForm from "@/components/change-password-form";

export default async function MiCuentaPortalPage() {
  const session = await requireClient();

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <Link href="/portal" className="text-sm text-white/70 hover:underline">
          ← Volver
        </Link>
        <h1 className="text-lg font-semibold text-gold-300">Mi cuenta</h1>
        <p className="text-sm text-white/70">Usuario (DNI): {session.user.email}</p>
      </header>
      <main className="mx-auto max-w-md px-6 py-8">
        <ChangePasswordForm />
      </main>
    </div>
  );
}
