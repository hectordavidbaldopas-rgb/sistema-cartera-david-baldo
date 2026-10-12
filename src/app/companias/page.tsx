import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { LogoFull, LogoMark } from "@/components/logo";
import { WhatsAppIcon } from "@/components/brand-icons";
import { secondaryButtonClass, whatsappButtonClass } from "@/lib/ui";
import { WHATSAPP_HREF, WHATSAPP_DISPLAY } from "@/lib/contact";
import { COMPANIES } from "@/lib/companies";

export const metadata: Metadata = {
  title: "Compañías con las que trabajo — Baldo Seguros",
  description:
    "Mapfre, Swiss Medical, Mercantil Andina, Andina ART, San Cristóbal, Asociart y Segurometal: las aseguradoras con las que trabaja Baldo Seguros.",
};

// Ficha breve de cada compañía (origen, fundación, a qué se dedica). Se llega
// desde los logos de la landing, que apuntan a /companias#<slug>.
export default function CompaniasPage() {
  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="sticky top-0 z-20 border-b border-gold-500/20 bg-[#071a36]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" aria-label="Ir al inicio">
            <LogoMark size={36} className="shrink-0 sm:hidden" />
            <LogoFull width={160} className="hidden shrink-0 sm:block" />
          </Link>
          <Link href="/#companias" className={secondaryButtonClass}>
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-gold-400">
            Compañías con las que trabajo
          </p>
          <h1 className="mb-3 text-center text-3xl font-bold text-white sm:text-4xl">
            Respaldo de las principales aseguradoras
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-center text-sm text-white/50">
            Comparo entre estas compañías para ofrecerte la cobertura que mejor se adapta a vos.
          </p>
          <div className="space-y-5">
            {COMPANIES.map((c) => (
              <article
                key={c.slug}
                id={c.slug}
                className="scroll-mt-24 rounded-2xl border border-gold-500/25 bg-navy-950/70 p-5 target:border-gold-400 target:shadow-[0_0_0_1px_var(--color-gold-400)] sm:flex sm:gap-6 sm:p-6"
              >
                <div className="mb-4 flex h-24 shrink-0 items-center justify-center rounded-xl bg-white px-4 sm:mb-0 sm:w-56">
                  <span className="relative block h-3/4 w-full">
                    <Image src={c.logo} alt={c.name} fill sizes="(max-width: 640px) 90vw, 224px" className="object-contain" />
                  </span>
                </div>
                <div>
                  <h2 className="mb-1 text-xl font-bold text-white">{c.name}</h2>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gold-300">
                    {c.origin} · {c.founded}
                  </p>
                  <p className="text-sm leading-relaxed text-white/70">{c.text}</p>
                </div>
              </article>
            ))}
          </div>
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
