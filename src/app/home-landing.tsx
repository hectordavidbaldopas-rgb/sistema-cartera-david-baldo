import Image from "next/image";
import Link from "next/link";
import { LogoFull, LogoMark, LogoStacked } from "@/components/logo";
import { primaryButtonClass, secondaryButtonClass, whatsappButtonClass } from "@/lib/ui";
import OfficeJourney from "@/components/office-journey";
import LogoFx from "@/components/logo-fx";
import { Lines } from "@/components/fx-text";
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  MailIcon,
  CheckIcon,
} from "@/components/brand-icons";
import { BranchesChips } from "@/components/branches-grid";
import { WHATSAPP_HREF, INSTAGRAM_HREF, FACEBOOK_HREF, EMAIL } from "@/lib/contact";

const NAV_LINKS = [
  { href: "#quien-soy", label: "Quién soy" },
  { href: "#ramas", label: "Ramas" },
  { href: "#como-trabajo", label: "Cómo trabajo" },
  { href: "#equipo", label: "Equipo" },
  { href: "#contacto", label: "Contacto" },
];

const STATS = [
  // href: cada número lleva a la sección que lo explica
  { value: "+20", label: "años de experiencia", href: "#quien-soy" },
  { value: "7", label: "compañías aseguradoras", href: "#companias" },
  { value: "14", label: "ramas de seguros", href: "#ramas" },
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
  { photo: "/team-david.jpg", name: "David Baldo", role: "Las Parejas, Santa Fe", whatsapp: "" },
  // whatsapp: la tarjeta abre el chat con ese mensaje (por ahora al número de la oficina)
  { photo: "/team-lucas-4.jpg", name: "Lucas Baldo", role: "San Jorge, Santa Fe", whatsapp: "Hola Lucas! Quiero hacer una consulta." },
];

// Cada sección es una "parada" del recorrido por la oficina (ver
// components/office-journey): ocupa una pantalla y su contenido (data-panel)
// entra y sale animado acompañando el movimiento de la cámara.
const sceneClass = "flex min-h-[100svh] items-center overflow-x-clip px-4 py-20 sm:px-6";
const panelClass = "scene-text";

// Tarjetas que llevan a WhatsApp: se agrandan apenas y el borde se pone dorado
const linkCardClass = "transition-[scale,border-color] duration-200 hover:scale-[1.03] hover:border-gold-400/60";

function TeamCard({ href, children }: { href?: string; children: React.ReactNode }) {
  const className = "block h-full rounded-2xl border border-gold-500/30 bg-navy-950/70 p-6";
  return href ? (
    <a data-fx href={href} target="_blank" rel="noopener noreferrer" className={`${className} ${linkCardClass}`}>
      {children}
    </a>
  ) : (
    <div data-fx className={className}>
      {children}
    </div>
  );
}

// Título del hero: cada sílaba se agranda sola al pasar el mouse (.word-zoom).
// Las sílabas se marcan con "·" en el texto; cada palabra queda junta (sin
// cortarse entre renglones).
function ZoomWords({ text, className = "" }: { text: string; className?: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i}>
          {i > 0 && " "}
          <span className="inline-block whitespace-nowrap">
            {w.split("·").map((syl, j) => (
              <span key={j} className={`word-zoom ${className}`}>
                {syl}
              </span>
            ))}
          </span>
        </span>
      ))}
    </>
  );
}

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

// Redes y medios de contacto: van en el hero (debajo de los botones principales,
// para tenerlos a mano) y se repiten en el footer.
const socialLinkClass =
  "flex items-center gap-2 rounded-full border border-gold-500/50 bg-navy-950/85 px-4 py-2 text-sm font-medium text-white/90 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.6)] transition hover:border-gold-400 hover:bg-navy-900 hover:text-gold-300";

function SocialButtons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href={WHATSAPP_HREF("Hola David! Quiero hacer una consulta.")}
        target="_blank"
        rel="noopener noreferrer"
        className={socialLinkClass}
      >
        <WhatsAppIcon className="h-4 w-4" /> WhatsApp
      </a>
      <a href={INSTAGRAM_HREF} target="_blank" rel="noopener noreferrer" className={socialLinkClass}>
        <InstagramIcon className="h-4 w-4" /> Instagram
      </a>
      <a href={FACEBOOK_HREF} target="_blank" rel="noopener noreferrer" className={socialLinkClass}>
        <FacebookIcon className="h-4 w-4" /> Facebook
      </a>
      <a href={`mailto:${EMAIL}`} className={socialLinkClass}>
        <MailIcon className="h-4 w-4" /> Email
      </a>
    </div>
  );
}

export default function HomeLanding() {
  return (
    <div className="min-h-screen">
      <OfficeJourney />
      <header className="sticky top-0 z-20 border-b border-gold-500/20 bg-[#071a36]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <LogoMark size={36} className="shrink-0 sm:hidden" />
          <LogoFull width={160} className="hidden shrink-0 sm:block" />
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
      <section data-scene className="relative flex min-h-[calc(100svh-68px)] items-center overflow-hidden px-6 py-16">
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className={panelClass} data-panel>
            <p className="mb-5 inline-block rounded-xl border border-gold-500/40 px-3.5 py-1.5 text-center text-[11px] font-semibold uppercase leading-snug tracking-wide text-gold-400 sm:rounded-full sm:px-3 sm:py-1 sm:text-xs sm:tracking-widest">
              Nueva imagen — la confianza, la de siempre
            </p>
            <h1 className="max-w-xl text-4xl font-bold leading-tight text-white sm:text-5xl">
              <Lines
                lines={[
                  <ZoomWords key="1" text="Pro·te·ge·mos lo que" />,
                  <ZoomWords key="2" text="más te im·por·ta," />,
                  <ZoomWords key="3" text="ha·ce 20 a·ños." className="text-gradient-gold" />,
                ]}
              />
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
            <div className="mt-10 max-w-lg rounded-2xl border border-gold-500/20 bg-navy-950/40 px-5 py-6">
              <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-gold-400">
                Nuestras redes y contacto
              </p>
              <SocialButtons className="justify-center" />
            </div>
            <div className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-gold-500/20 pt-6">
              {STATS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="group block rounded-xl transition-[scale] duration-200 hover:scale-105"
                >
                  <span className="block text-2xl font-bold text-gold-300" data-count={s.value}>{s.value}</span>
                  <span className="block text-xs text-white/50 transition-colors group-hover:text-gold-300">
                    {s.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="relative mx-auto hidden w-full max-w-sm sm:block" data-panel>
            <div
              aria-hidden
              className="absolute -inset-3 rounded-[2rem] border border-gold-500/20"
            />
            <div data-fx className="relative rounded-3xl border border-gold-500/30 bg-navy-900/85 p-8 shadow-2xl">
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
      <section id="quien-soy" data-scene className={sceneClass}>
        <div className={`mx-auto grid w-full max-w-6xl items-center gap-14 sm:grid-cols-2 ${panelClass}`} data-panel>
          <div>
            <div data-fx="fade" className="group relative mx-auto max-w-sm transition-[scale] duration-500 ease-out hover:scale-105">
              <div
                aria-hidden
                className="absolute -bottom-4 -right-4 h-full w-full rounded-2xl bg-[image:var(--gradient-gold)] opacity-90"
              />
              {/* Foto recortada sin la franja de logos de abajo; al pasar el mouse crece todo el
                  recuadro y, sutilmente, también la foto dentro del marco */}
              <div className="relative aspect-[1000/850] overflow-hidden rounded-2xl border border-gold-500/30">
                <Image
                  src="/david-quien-soy-2.jpg"
                  alt="David Baldo, Productor Asesor de Seguros — Quién soy"
                  fill
                  className="object-cover transition-[scale] duration-700 ease-out group-hover:scale-[1.06]"
                  sizes="(max-width: 640px) 100vw, 420px"
                />
              </div>
            </div>
          </div>
          <div>
            <p className="mb-5 text-xl font-medium leading-snug text-white sm:text-2xl">
              Hace 20 años acompaño a familias y empresas de Las Parejas y la zona a proteger lo que más
              les importa: el auto, el hogar, el campo, el negocio.
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
          </div>
        </div>
      </section>

      {/* COMPAÑÍAS */}
      <section id="companias" data-scene className={sceneClass}>
        <div className={`mx-auto w-full max-w-6xl ${panelClass}`} data-panel>
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-white/40">
            Trabajo con las principales aseguradoras
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {COMPANIES.map((c) =>
              c.logo ? (
                <span
                  key={c.name}
                  data-fx="zoom"
                  className="flex items-center rounded-lg bg-white/95 px-4 py-2.5 shadow-sm transition-[scale] duration-200 hover:scale-115"
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
      <section id="ramas" data-scene className={sceneClass}>
        <div className={`mx-auto w-full max-w-4xl ${panelClass}`} data-panel>
          <div>
            <p className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-gold-400">
              Ramas que trabajo
            </p>
            <h2 className="mb-8 text-center text-3xl font-bold text-white sm:text-4xl">
              <Lines lines={["Un seguro", <span key="m">para cada necesidad.</span>]} />
            </h2>
            <BranchesChips />
            <div className="mt-8 flex justify-center">
              <Link href="/ramas" className={secondaryButtonClass}>
                Ver el detalle de cada rama →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO TRABAJO */}
      <section id="como-trabajo" data-scene className={sceneClass}>
        <div className={`mx-auto w-full max-w-6xl ${panelClass}`} data-panel>
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold-400">
              Cómo trabajo
            </p>
            <h2 className="mb-12 text-3xl font-bold text-white sm:text-4xl">
              <a href={WHATSAPP_HREF("Hola David! Quiero cotizar un seguro.")} target="_blank" rel="noopener noreferrer">
                <Lines lines={["Cotizá tu seguro", <span key="m" className="text-gradient-gold">en 24 horas.</span>]} />
              </a>
            </h2>
          </div>
          <div className="mb-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                {/* Cada paso abre el chat de WhatsApp para cotizar */}
                <a
                  data-fx
                  href={WHATSAPP_HREF("Hola David! Quiero cotizar un seguro.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative block h-full rounded-2xl border border-white/10 bg-navy-950/60 p-6 ${linkCardClass}`}
                >
                  <p className="mb-3 text-3xl font-bold text-gold-400">{s.n}</p>
                  <p className="mb-1 font-semibold text-white">{s.title}</p>
                  <p className="text-sm text-white/60">{s.text}</p>
                </a>
              </div>
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
      <section id="equipo" data-scene className={sceneClass}>
        <div className={`mx-auto w-full max-w-6xl ${panelClass}`} data-panel>
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold-400">
              Nuestro equipo
            </p>
            <h2 className="mb-12 text-3xl font-bold text-white sm:text-4xl">
              <Lines lines={["Con quién", <span key="m">vas a hablar.</span>]} />
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {TEAM.map((t) => (
              <div key={t.name} className="h-full">
                {/* h-full: todas las tarjetas del mismo tamaño */}
                {/* Las tarjetas con whatsapp abren el chat (por ahora solo Lucas) */}
                <TeamCard href={t.whatsapp ? WHATSAPP_HREF(t.whatsapp) : undefined}>
                  {/* La foto gira con zoom y brillo igual que el logo (mouse, clic o toque) */}
                  <LogoFx mark={{ left: 0, top: 0, width: 100, height: 100 }} round className="mb-4">
                    <span className="relative block h-20 w-20 overflow-hidden rounded-full border-2 border-gold-400 shadow-[0_0_0_3px_rgba(11,17,29,1)]">
                      <Image src={t.photo} alt={t.name} fill className="object-cover" sizes="80px" />
                    </span>
                  </LogoFx>
                  <p className="font-semibold text-gold-300">{t.name}</p>
                  <p className="text-sm text-white/60">{t.role}</p>
                </TeamCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO / FOOTER */}
      <footer id="contacto" data-scene className={sceneClass}>
        <div className={`mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center ${panelClass}`} data-panel>
          <LogoStacked width={150} />
          <p className="text-sm text-white/60">Las Parejas, Santa Fe</p>
          <SocialButtons className="justify-center" />
          <PortalButtons className="mt-4" />
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Baldo Seguros</p>
        </div>
      </footer>

      {/* CTA flotante */}
      <a
        href={WHATSAPP_HREF("Hola David! Quiero cotizar un seguro.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribir por WhatsApp"
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-green-600 text-white shadow-[0_10px_24px_-6px_rgba(0,0,0,0.7),0_4px_16px_-4px_rgba(22,163,74,0.6)] transition duration-200 hover:-translate-y-0.5 hover:border-green-600 hover:bg-white hover:text-green-700 active:translate-y-px"
      >
        <WhatsAppIcon className="h-6 w-6" />
      </a>
    </div>
  );
}
