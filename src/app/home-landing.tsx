import Image from "next/image";
import Link from "next/link";
import { LogoFull, LogoMark, LogoStacked } from "@/components/logo";
import { primaryButtonClass, secondaryButtonClass, whatsappButtonClass } from "@/lib/ui";
import OfficeJourney from "@/components/office-journey";
import LogoFx from "@/components/logo-fx";
import TapZoom from "@/components/tap-zoom";
import CompanyCard from "@/components/company-card";
import { COMPANIES } from "@/lib/companies";
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
// components/office-journey): ocupa el alto visible debajo del encabezado (así
// cada barrida encastra justo en la sección siguiente) y su contenido (data-panel)
// entra y sale animado acompañando el movimiento de la cámara. En el celular
// todo va más compacto para que cada sección entre entera en una pantalla.
const sceneClass = "flex min-h-[calc(100dvh-var(--header-h,4rem))] items-center overflow-x-clip px-4 py-4 sm:px-6 sm:py-20";
const panelClass = "scene-text";

// Tarjetas que llevan a WhatsApp: se agrandan apenas y el borde se pone dorado
const linkCardClass = "transition-[scale,border-color] duration-200 hover:scale-[1.03] hover:border-gold-400/60";

function TeamCard({ href, children }: { href?: string; children: React.ReactNode }) {
  const className = "block h-full rounded-2xl border border-gold-500/30 bg-navy-950/70 p-5 sm:p-6";
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

// En el encabezado van más chicos en el celular, para que no se superpongan
// ni queden más grandes que el logo.
const compactSize = "px-3 py-1.5 text-[11px] sm:px-4 sm:py-2 sm:text-sm";
const compactSecondaryClass = secondaryButtonClass.replace("px-5 py-2.5 text-sm", compactSize);
const compactPrimaryClass = primaryButtonClass.replace("px-5 py-2.5 text-sm", compactSize);

function PortalButtons({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
      <Link href="/login?portal=cliente" className={`${compact ? compactSecondaryClass : secondaryButtonClass} whitespace-nowrap`}>
        Portal clientes
      </Link>
      <Link href="/login?portal=vendedor" className={`${compact ? compactPrimaryClass : primaryButtonClass} whitespace-nowrap`}>
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
    <div className="landing-snap min-h-screen overflow-x-clip">
      <OfficeJourney />
      <header data-site-header className="sticky top-0 z-20 border-b border-gold-500/20 bg-[#071a36]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
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
          <PortalButtons compact />
        </div>
      </header>

      {/* PORTADA: el logo en primer plano, llega girando con zoom y brillo */}
      <section data-scene className="relative flex min-h-[calc(100dvh-var(--header-h,4rem))] flex-col items-center justify-center overflow-x-clip px-4 py-16">
        <div className="flex flex-col items-center" data-panel>
          <div data-fx="logo">
            <LogoStacked width="100%" autoPlay className="block w-[min(72vw,360px)]" />
          </div>
          <a
            href="#inicio"
            className="mt-14 flex flex-col items-center gap-1 text-xs font-medium uppercase tracking-widest text-gold-300/80 transition hover:text-gold-300"
          >
            Conocenos
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* HERO */}
      <section id="inicio" data-scene className="relative flex min-h-[calc(100dvh-var(--header-h,4rem))] items-center overflow-hidden px-5 py-4 sm:px-6 sm:py-16">
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className={panelClass} data-panel>
            <p className="mb-3 inline-block rounded-xl sm:mb-5 border border-gold-500/40 px-3.5 py-1.5 text-center text-[11px] font-semibold uppercase leading-snug tracking-wide text-gold-400 sm:rounded-full sm:px-3 sm:py-1 sm:text-xs sm:tracking-widest">
              Nueva imagen — la confianza, la de siempre
            </p>
            <h1 className="max-w-xl text-[2rem] font-bold leading-tight text-white sm:text-5xl">
              <Lines
                lines={[
                  <ZoomWords key="1" text="Pro·te·ge·mos lo que" />,
                  <ZoomWords key="2" text="más te im·por·ta," />,
                  <ZoomWords key="3" text="ha·ce 20 a·ños." className="text-gradient-gold" />,
                ]}
              />
            </h1>
            <p className="mt-4 max-w-lg text-base text-white/70 sm:mt-6 sm:text-lg">
              Soy David Baldo, Productor Asesor de Seguros — Matrícula N° 63225. Acompaño a
              familias y empresas de Las Parejas y la zona con asesoramiento real, no solo una
              póliza más.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 sm:mt-8">
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
            {/* Las redes y el contacto quedan solo al final (Contacto) */}
            <div className="mt-6 grid max-w-md grid-cols-3 gap-4 border-t border-gold-500/20 pt-4 sm:mt-12 sm:pt-6">
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
                      className="flex items-center rounded-md bg-white px-2 py-1"
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
        <div className={`mx-auto grid w-full max-w-6xl items-center gap-7 sm:grid-cols-2 sm:gap-14 ${panelClass}`} data-panel>
          <div>
            <TapZoom data-fx="fade" className="group relative mx-auto max-w-[min(18rem,calc((100dvh-27.5rem)*1.17))] transition-[scale] sm:max-w-sm duration-500 ease-out hover:scale-105 data-[on=true]:scale-105">
              <div
                aria-hidden
                className="absolute -bottom-2.5 -right-2.5 h-full w-full rounded-2xl sm:-bottom-4 sm:-right-4 bg-[image:var(--gradient-gold)] opacity-90"
              />
              {/* Foto recortada sin la franja de logos de abajo; al pasar el mouse crece todo el
                  recuadro y, sutilmente, también la foto dentro del marco (en el celular, al tocarla) */}
              <div className="relative aspect-[1000/850] overflow-hidden rounded-2xl border border-gold-500/30">
                <Image
                  src="/david-quien-soy-2.jpg"
                  alt="David Baldo, Productor Asesor de Seguros — Quién soy"
                  fill
                  className="object-cover transition-[scale] duration-700 ease-out group-hover:scale-[1.06] group-data-[on=true]:scale-[1.06]"
                  sizes="(max-width: 640px) 100vw, 420px"
                />
              </div>
            </TapZoom>
          </div>
          <div>
            <p className="mb-4 text-lg font-medium leading-snug text-white sm:mb-5 sm:text-2xl">
              Hace 20 años acompaño a familias y empresas de Las Parejas y la zona a proteger lo que más
              les importa: el auto, el hogar, el campo, el negocio.
            </p>
            <p className="mb-4 text-sm text-white/70 sm:mb-6 sm:text-base">
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
          {/* De a dos en el celular (de a cuatro en la compu), todos del mismo tamaño;
              el último, si queda solo, va centrado */}
          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3 sm:gap-5">
            {COMPANIES.map((c) => (
              <CompanyCard key={c.slug} company={c} className="w-[calc(50%-0.375rem)] sm:w-[calc(25%-0.9375rem)]" />
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-white/50">Tocá una compañía para conocerla.</p>
        </div>
      </section>

      {/* RAMAS */}
      <section id="ramas" data-scene className={sceneClass}>
        <div className={`mx-auto w-full max-w-4xl ${panelClass}`} data-panel>
          <div>
            <p className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-gold-400">
              Ramas que trabajo
            </p>
            <h2 className="mb-4 text-center text-2xl font-bold text-white sm:mb-8 sm:text-4xl">
              <Lines lines={["Un seguro", <span key="m">para cada necesidad.</span>]} />
            </h2>
            <BranchesChips />
            <div className="mt-5 flex justify-center sm:mt-8">
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
            <h2 className="mb-4 text-3xl font-bold text-white sm:mb-12 sm:text-4xl">
              <a href={WHATSAPP_HREF("Hola David! Quiero cotizar un seguro.")} target="_blank" rel="noopener noreferrer">
                <Lines lines={["Cotizá tu seguro", <span key="m" className="text-gradient-gold">en 24 horas.</span>]} />
              </a>
            </h2>
          </div>
          <div className="mb-4 grid auto-rows-fr gap-2.5 sm:mb-10 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((s) => (
              <div key={s.n}>
                {/* Cada paso abre el chat de WhatsApp para cotizar */}
                <a
                  data-fx
                  href={WHATSAPP_HREF("Hola David! Quiero cotizar un seguro.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative flex h-full items-start gap-3.5 rounded-2xl border border-white/10 bg-navy-950/60 px-4 py-3 sm:block sm:p-6 ${linkCardClass}`}
                >
                  {/* En el celular el número va al costado, para ocupar menos alto */}
                  <p className="text-2xl font-bold leading-none text-gold-400 sm:mb-3 sm:text-3xl">{s.n}</p>
                  <span className="block">
                    <span className="mb-1 block font-semibold text-white">{s.title}</span>
                    <span className="block text-xs text-white/60 sm:text-sm">{s.text}</span>
                  </span>
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
            <h2 className="mb-6 text-3xl font-bold text-white sm:mb-12 sm:text-4xl">
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
        <div className={`mx-auto flex w-full max-w-3xl flex-col items-center gap-5 text-center sm:gap-6 ${panelClass}`} data-panel>
          <LogoStacked width={150} playOnView />
          <p className="text-sm text-white/60">Las Parejas, Santa Fe</p>
          <SocialButtons className="justify-center" />
          <PortalButtons className="mt-2 sm:mt-4" />
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
