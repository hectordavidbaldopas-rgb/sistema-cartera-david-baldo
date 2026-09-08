import Image from "next/image";
import Link from "next/link";
import { LogoFull, LogoMark } from "@/components/logo";
import { primaryButtonClass, secondaryButtonClass, whatsappButtonClass } from "@/lib/ui";
import Reveal from "@/components/reveal";
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  MailIcon,
  CheckIcon,
} from "@/components/brand-icons";
import BranchesGrid from "@/components/branches-grid";

// Datos de contacto verificados contra linktr.ee/hectordavidbaldo.pas — no
// inventar otros: si cambian, actualizar acá (única fuente de verdad de la
// landing pública).
const WHATSAPP_NUMBER = "5493406415230";
const WHATSAPP_HREF = (msg: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
const INSTAGRAM_HREF = "https://www.instagram.com/pas.david.baldo";
const FACEBOOK_HREF = "https://www.facebook.com/profile.php?id=100027309113999";
const EMAIL = "hectordavidbaldo.pas@gmail.com";

const NAV_LINKS = [
  { href: "#quien-soy", label: "Quién soy" },
  { href: "#ramas", label: "Ramas" },
  { href: "#como-trabajo", label: "Cómo trabajo" },
  { href: "#equipo", label: "Equipo" },
  { href: "#contacto", label: "Contacto" },
];

const STATS = [
  { value: "20+", label: "años de experiencia" },
  { value: "7", label: "compañías aseguradoras" },
  { value: "14", label: "ramas de seguros" },
];

const COMPANIES = [
  { name: "Mapfre", logo: "/logo-mapfre.png" },
  { name: "Swiss Medical", logo: "/logo-swissmedical.png" },
  { name: "Mercantil Andina", logo: "/logo-mercantilandina.png" },
  { name: "Andina ART", logo: "/logo-andinaart.png" },
  { name: "San Cristóbal Seguros", logo: "/logo-sancristobal.png" },
  { name: "Asociart", logo: "/logo-asociart.png" },
  { name: "Segurometal", logo: "/logo-segurometal.png" },
];

const STEPS = [
  { n: "01", title: "Escribime por WhatsApp", text: "Contame qué querés asegurar, sin vueltas." },
  { n: "02", title: "Comparo compañías por vos", text: "Reviso opciones entre Mapfre, San Cristóbal, Mercantil Andina, Asociart, Swiss Medical, Segurometal y Andina ART." },
  { n: "03", title: "Elegís la mejor opción", text: "Vos decidís, con asesoramiento real de tu lado." },
];

const TEAM = [
  { photo: "/team-david.jpg", name: "David Baldo", role: "Productor Asesor de Seguros — Mat. N° 63225 — Las Parejas" },
  { photo: "/team-lucas.jpg", name: "Lucas Baldo", role: "Representante oficial en San Jorge" },
  { photo: "/team-ruben.jpg", name: "Rubén Ide", role: "Representante oficial en Las Rosas" },
];

function PortalButtons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Link href="/login?portal=cliente" className={secondaryButtonClass}>
        Portal clientes
      </Link>
      <Link href="/login?portal=vendedor" className={primaryButtonClass}>
        Portal vendedores
      </Link>
    </div>
  );
}

export default function HomeLanding() {
  return (
    <div className="min-h-screen bg-navy-950">
      <header className="sticky top-0 z-20 border-b border-gold-500/20 bg-navy-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <LogoFull width={130} />
          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-white/70 transition hover:text-gold-300"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <PortalButtons />
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-texture-navy px-6 pb-24 pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-gold-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-steel-500/10 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-5 inline-block rounded-xl border border-gold-500/40 px-3.5 py-1.5 text-center text-[11px] font-semibold uppercase leading-snug tracking-wide text-gold-400 sm:rounded-full sm:px-3 sm:py-1 sm:text-xs sm:tracking-widest">
              Nueva imagen — la confianza, la de siempre
            </p>
            <h1 className="max-w-xl text-4xl font-bold leading-tight text-white sm:text-5xl">
              Protegemos lo que más te importa,{" "}
              <span className="text-gradient-gold">hace 20 años.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-white/70">
              Soy David Baldo, Productor Asesor de Seguros — Matrícula N° 63225. Acompaño a
              familias y empresas de Las Parejas y la zona con asesoramiento real, no solo una
              póliza más.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={WHATSAPP_HREF("Hola David! Quiero cotizar un seguro.")}
                target="_blank"
                rel="noopener noreferrer"
                className={`${whatsappButtonClass} inline-flex items-center gap-2`}
              >
                <WhatsAppIcon className="h-4 w-4" />
                Cotizar por WhatsApp
              </a>
              <a href="#quien-soy" className={secondaryButtonClass}>
                Conocé más
              </a>
            </div>
            <div className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-gold-500/20 pt-6">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-gold-300">{s.value}</p>
                  <p className="text-xs text-white/50">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto hidden w-full max-w-sm sm:block">
            <div
              aria-hidden
              className="absolute -inset-3 rounded-[2rem] border border-gold-500/20"
            />
            <div className="relative rounded-3xl border border-gold-500/30 bg-navy-900/80 p-8 shadow-2xl backdrop-blur">
              <LogoMark size={64} />
              <p className="mt-4 text-xl font-bold text-white">David Baldo</p>
              <p className="text-sm text-white/60">Productor Asesor de Seguros</p>
              <div className="divider-gold my-5" />
              <p className="text-xs uppercase tracking-widest text-gold-400">Matrícula</p>
              <p className="text-lg font-semibold text-gold-300">N° 63225</p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {COMPANIES.map((c) =>
                  c.logo ? (
                    <span
                      key={c.name}
                      className="flex items-center rounded-md bg-white/95 px-2 py-1"
                    >
                      <Image src={c.logo} alt={c.name} width={72} height={18} className="h-3.5 w-auto object-contain" />
                    </span>
                  ) : (
                    <span
                      key={c.name}
                      className="rounded-full border border-gold-500/30 px-2.5 py-1 text-[11px] font-medium text-white/70"
                    >
                      {c.name}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUIÉN SOY */}
      <section id="quien-soy" className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 sm:grid-cols-2">
          <Reveal>
            <div className="relative mx-auto max-w-sm">
              <div
                aria-hidden
                className="absolute -bottom-4 -right-4 h-full w-full rounded-2xl bg-[image:var(--gradient-gold)] opacity-90"
              />
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-gold-500/30">
                <Image
                  src="/david-quien-soy.jpg"
                  alt="David Baldo, Productor Asesor de Seguros — Quién soy"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 420px"
                />
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="mb-4 text-white/70">
              Hace 20 años acompaño a familias y empresas de Las Parejas y la zona a proteger lo
              que más les importa: el auto, el hogar, el campo, el negocio.
            </p>
            <p className="mb-6 text-white/70">
              Trabajo junto a Mapfre, San Cristóbal, Mercantil Andina, Asociart, Swiss Medical,
              Segurometal y Andina ART para ofrecerte la cobertura que mejor se adapta a vos, con
              asesoramiento real — no solo una póliza más.
            </p>
            <ul className="space-y-2">
              {["Atención personalizada, cara a cara", "Trabajo con varias aseguradoras", "Seguimiento durante toda la vigencia"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/80">
                    <CheckIcon className="h-4 w-4 shrink-0 text-gold-400" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* COMPAÑÍAS */}
      <section className="border-y border-gold-500/15 bg-navy-900 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-white/40">
            Trabajo con las principales aseguradoras
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {COMPANIES.map((c) =>
              c.logo ? (
                <span
                  key={c.name}
                  className="flex items-center rounded-lg bg-white/95 px-4 py-2.5 shadow-sm"
                >
                  <Image src={c.logo} alt={c.name} width={110} height={28} className="h-6 w-auto object-contain" />
                </span>
              ) : (
                <span
                  key={c.name}
                  className="rounded-lg border border-gold-500/25 px-4 py-2.5 text-sm font-medium text-white/60"
                >
                  {c.name}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* RAMAS */}
      <section id="ramas" className="bg-navy-900 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-gold-400">
              Ramas que trabajo
            </p>
            <h2 className="mb-3 text-center text-3xl font-bold text-white sm:text-4xl">
              Un seguro para cada necesidad
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-sm text-white/50">
              Muchas de estas coberturas se combinan entre sí: por ejemplo, granizo o robo pueden ir incluidos
              dentro de tu seguro de auto o de tu combinado familiar. Tocá cada rama para ver el detalle.
            </p>
          </Reveal>
          <BranchesGrid />
        </div>
      </section>

      {/* CÓMO TRABAJO */}
      <section id="como-trabajo" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold-400">
              Cómo trabajo
            </p>
            <h2 className="mb-12 text-3xl font-bold text-white sm:text-4xl">
              Cotizá tu seguro en 24 horas
            </h2>
          </Reveal>
          <div className="mb-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div className="relative">
                  <p className="mb-3 text-3xl font-bold text-gold-400">{s.n}</p>
                  <p className="mb-1 font-semibold text-white">{s.title}</p>
                  <p className="text-sm text-white/60">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <a
            href={WHATSAPP_HREF("Hola David! Quiero cotizar un seguro.")}
            target="_blank"
            rel="noopener noreferrer"
            className={`${whatsappButtonClass} inline-flex items-center gap-2`}
          >
            <WhatsAppIcon className="h-4 w-4" />
            Escribime al (3406) 41-5230
          </a>
        </div>
      </section>

      {/* EQUIPO */}
      <section id="equipo" className="bg-navy-900 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold-400">
              Nuestro equipo
            </p>
            <h2 className="mb-12 text-3xl font-bold text-white sm:text-4xl">
              Con quién vas a hablar
            </h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-3">
            {TEAM.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="rounded-2xl border border-gold-500/30 bg-navy-950 p-6">
                  <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-full border-2 border-gold-400 shadow-[0_0_0_3px_rgba(11,17,29,1)]">
                    <Image src={t.photo} alt={t.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <p className="font-semibold text-gold-300">{t.name}</p>
                  <p className="text-sm text-white/60">{t.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO / FOOTER */}
      <footer id="contacto" className="border-t border-gold-500/20 bg-texture-navy px-6 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
          <LogoFull width={120} />
          <p className="text-sm text-white/60">Las Parejas, Santa Fe</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={WHATSAPP_HREF("Hola David! Quiero hacer una consulta.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-gold-500/40 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-gold-400 hover:text-gold-300"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={INSTAGRAM_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-gold-500/40 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-gold-400 hover:text-gold-300"
            >
              <InstagramIcon className="h-4 w-4" /> Instagram
            </a>
            <a
              href={FACEBOOK_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-gold-500/40 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-gold-400 hover:text-gold-300"
            >
              <FacebookIcon className="h-4 w-4" /> Facebook
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-2 rounded-full border border-gold-500/40 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-gold-400 hover:text-gold-300"
            >
              <MailIcon className="h-4 w-4" /> Email
            </a>
          </div>
          <PortalButtons className="mt-4" />
          <p className="text-xs text-white/30">© {new Date().getFullYear()} David Baldo Seguros</p>
        </div>
      </footer>

      {/* CTA flotante */}
      <a
        href={WHATSAPP_HREF("Hola David! Quiero cotizar un seguro.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribir por WhatsApp"
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-xl transition duration-150 hover:bg-green-700 active:translate-y-px"
      >
        <WhatsAppIcon className="h-6 w-6" />
      </a>
    </div>
  );
}
