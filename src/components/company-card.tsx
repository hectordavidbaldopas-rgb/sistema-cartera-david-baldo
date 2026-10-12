"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { Company } from "@/lib/companies";

// Logo de una compañía: crece al pasar el mouse y, al tocarlo, da medio giro
// sobre su eje (.company-spin en globals.css) y recién ahí abre su página
// /companias/<slug>.
export default function CompanyCard({ company, className }: { company: Company; className?: string }) {
  const router = useRouter();
  const ref = useRef<HTMLSpanElement>(null);
  const href = `/companias/${company.slug}`;

  // Precarga la página para que entre apenas termina el giro
  useEffect(() => router.prefetch(href), [router, href]);
  // Al volver con "atrás" (página restaurada del historial), el logo vuelve a verse
  useEffect(() => {
    const reset = () => ref.current?.classList.remove("company-spin");
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const open = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
    ev.preventDefault();
    const el = ref.current;
    if (!el || el.classList.contains("company-spin")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(href);
    el.classList.add("company-spin");
    // Entra al terminar el giro (con un respaldo por si el evento no llega)
    let gone = false;
    const go = () => {
      if (gone) return;
      gone = true;
      router.push(href);
    };
    el.addEventListener("animationend", go, { once: true });
    window.setTimeout(go, 1400);
  };

  return (
    <a data-fx="zoom" href={href} onClick={open} aria-label={`Conocé ${company.name}`} className={`block [perspective:600px] ${className ?? ""}`}>
      <span
        ref={ref}
        className="flex h-20 w-full items-center justify-center rounded-xl bg-white px-1.5 shadow-sm transition-[scale] duration-200 hover:scale-110 sm:h-24 sm:px-4"
      >
        {/* El logo ocupa todo el ancho del recuadro (o el 62% del alto, si es más compacto, para que no queden muy desparejos) */}
        <span className="relative block h-[62%] w-full" style={{ scale: company.logoScale }}>
          <Image src={company.logo} alt={company.name} fill sizes="(max-width: 640px) 45vw, 200px" className="object-contain" />
        </span>
      </span>
    </a>
  );
}
