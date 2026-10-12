"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import type { Company } from "@/lib/companies";

// Logo de una compañía en la landing: crece al pasar el mouse y, al tocarlo,
// da una vuelta sobre su eje (.company-spin en globals.css) y recién ahí abre
// su ficha en /companias.
export default function CompanyCard({ company, className }: { company: Company; className?: string }) {
  const router = useRouter();
  const ref = useRef<HTMLSpanElement>(null);
  const href = `/companias#${company.slug}`;

  const open = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
    ev.preventDefault();
    const el = ref.current;
    if (!el || el.classList.contains("company-spin")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(href);
    el.classList.add("company-spin");
    window.setTimeout(() => router.push(href), 650);
  };

  return (
    <a data-fx="zoom" href={href} onClick={open} aria-label={`Conocé ${company.name}`} className={`block [perspective:600px] ${className ?? ""}`}>
      <span
        ref={ref}
        className="flex h-20 w-full items-center justify-center rounded-xl bg-white/95 px-4 shadow-sm transition-[scale] duration-200 hover:scale-110 sm:h-24"
      >
        <Image src={company.logo} alt={company.name} width={140} height={36} className="h-8 w-auto max-w-full object-contain sm:h-10" />
      </span>
    </a>
  );
}
