import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LogoFull, LogoMark } from "@/components/logo";
import CompanyCard from "@/components/company-card";
import { WhatsAppIcon } from "@/components/brand-icons";
import { secondaryButtonClass, whatsappButtonClass } from "@/lib/ui";
import { WHATSAPP_HREF, WHATSAPP_DISPLAY } from "@/lib/contact";
import { COMPANIES } from "@/lib/companies";

export function generateStaticParams() {
  return COMPANIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/companias/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const c = COMPANIES.find((x) => x.slug === slug);
  if (!c) return {};
  return { title: `${c.name} — Baldo Seguros`, description: c.text };
}

// Página de cada compañía (se llega tocando su logo en la landing): origen,
// fundación y una descripción breve; abajo, accesos a las demás.
export default async function CompaniaPage(props: PageProps<"/companias/[slug]">) {
  const { slug } = await props.params;
  const c = COMPANIES.find((x) => x.slug === slug);
  if (!c) notFound();
  const others = COMPANIES.filter((x) => x.slug !== slug);

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

      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-gold-400">
            Compañías con las que trabajo
          </p>
          <article className="rounded-2xl border border-gold-500/25 bg-navy-950/70 p-6 sm:p-8">
            <div className="mb-6 flex h-28 items-center justify-center rounded-xl bg-white px-5 sm:h-36">
              <span className="relative block h-3/4 w-full" style={{ scale: c.logoScale }}>
                <Image src={c.logo} alt={c.name} fill priority sizes="(max-width: 640px) 90vw, 600px" className="object-contain" />
              </span>
            </div>
            <h1 className="mb-3 text-3xl font-bold text-white">{c.name}</h1>
            <div className="mb-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-gold-300">
              <span className="rounded-full border border-gold-500/40 px-3 py-1">{c.origin}</span>
              <span className="rounded-full border border-gold-500/40 px-3 py-1">{c.founded}</span>
            </div>
            <p className="leading-relaxed text-white/75">{c.text}</p>
          </article>

          <div className="mt-8 flex justify-center">
            <a
              href={WHATSAPP_HREF(`Hola David! Quiero cotizar un seguro con ${c.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${whatsappButtonClass} inline-flex items-center gap-2`}
            >
              <WhatsAppIcon className="h-4 w-4" />
              Consultá por WhatsApp al {WHATSAPP_DISPLAY}
            </a>
          </div>

          <p className="mb-4 mt-12 text-center text-xs font-semibold uppercase tracking-widest text-white/40">
            Otras compañías
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {others.map((o) => (
              <CompanyCard key={o.slug} company={o} className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)]" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
