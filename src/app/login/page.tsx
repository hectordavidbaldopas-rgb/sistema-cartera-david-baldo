import { Suspense } from "react";
import LoginForm from "./login-form";
import { LogoMark } from "@/components/logo";

export default function LoginPage() {
  return (
    <div className="bg-texture-navy flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-navy-900 p-8 shadow-xl">
        <div className="mb-5 flex flex-col items-center text-center">
          <LogoMark size={64} />
          <h1 className="mt-3 text-xl font-bold text-gold-300">Sistema de Cartera</h1>
          <p className="text-sm text-white/70">David Baldo Seguros</p>
        </div>
        <div className="divider-gold mb-6" />
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
