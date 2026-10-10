import Link from "next/link";
import type { Metadata } from "next";
import { LogoFull, LogoMark } from "@/components/logo";
import BranchesGrid from "@/components/branches-grid";
import { WhatsAppIcon } from "@/components/brand-icons";
import { secondaryButtonClass, whatsappButtonClass } from "@/lib/ui";
import { WHATSAPP_HREF, WHATSAPP_DISPLAY } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Ramas que trabajo — Baldo Seguros",
  description:
    "Las 14 ramas de seguros que trabaja Baldo Seguros en Las Parejas y la zona: auto, hogar, comercio, campo, vida, responsabilidad civil y más.",
};

// Listado completo de ramas, separado de la landing para que la home no quede
// tan cargada (ahí solo se muestran los nombres como accesos directos).
export default function RamasPage() {
  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="sticky top-0 z-20 border-b border-gold-500/20 bg-[#071a36]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" aria-label="Ir al inicio">
            <LogoMark size={36} className="shrink-0 sm:hidden" />
            <LogoFull width={160} className="hidden shrink-0 sm:block" />
          </Link>
          <Link href="/" className={secondaryButtonClass}>
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-gold-400">
            Ramas que trabajo
          </p>
          <h1 className="mb-3 text-center text-3xl font-bold text-white sm:text-4xl">
            Un seguro para cada necesidad
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-center text-sm text-white/50">
            Muchas de estas coberturas se combinan entre sí: por ejemplo, granizo o robo pueden ir incluidos
            dentro de tu seguro de auto o de tu combinado familiar. Tocá cada rama para ver el detalle.
          </p>
          <BranchesGrid />
          <div className="mt-12 flex justify-center">
            <a
              href={WHATSAPP_HREF("Hola David! Quiero cotizar un seguro.")}
              target="_blank"
              rel="noopener noreferrer"
              className={`${whatsappButtonClass} inline-flex items-center gap-2`}
            >
              <WhatsAppIcon className="h-4 w-4" />
              Consultá por WhatsApp al {WHATSAPP_DISPLAY}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
