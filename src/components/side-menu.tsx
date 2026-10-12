"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CATEGORIES, slugify } from "@/components/branches-grid";
import { COMPANIES } from "@/lib/companies";

type Item = { label: string; href?: string; children?: Item[] };

// Mapa de la landing: secciones (#…, las lleva el paso de página de
// office-journey) y, desplegables, las páginas de cada compañía y el detalle
// de cada rama agrupado por rubro.
const ITEMS: Item[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "Quién soy", href: "#quien-soy" },
  {
    label: "Compañías",
    href: "#companias",
    children: COMPANIES.map((c) => ({ label: c.name, href: `/companias/${c.slug}` })),
  },
  {
    label: "Ramas",
    href: "#ramas",
    children: [
      ...CATEGORIES.map((c) => ({
        label: c.label,
        children: c.branches.map((b) => ({ label: b, href: `/ramas#${slugify(b)}` })),
      })),
      { label: "Ver todas las ramas", href: "/ramas" },
    ],
  },
  { label: "Cómo trabajo", href: "#como-trabajo" },
  { label: "Equipo", href: "#equipo" },
  { label: "Contacto", href: "#contacto" },
  { label: "Portal clientes", href: "/login?portal=cliente" },
  { label: "Portal vendedores", href: "/login?portal=vendedor" },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuItem({ item, depth, onNavigate }: { item: Item; depth: number; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const text = depth === 0 ? "text-base font-semibold text-white" : depth === 1 ? "text-sm text-white/85" : "text-sm text-white/65";
  const row = `flex-1 py-2.5 text-left transition hover:text-gold-300 ${text}`;
  const link = item.href?.startsWith("#") ? (
    <a href={item.href} onClick={onNavigate} className={row}>
      {item.label}
    </a>
  ) : item.href ? (
    <Link href={item.href} onClick={onNavigate} className={row}>
      {item.label}
    </Link>
  ) : (
    // Sin página propia (rubros): toda la fila abre y cierra
    <button type="button" onClick={() => setOpen((v) => !v)} className={row} aria-expanded={open}>
      {item.label}
    </button>
  );

  return (
    <li>
      <div className="flex items-center">
        {link}
        {item.children && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`${open ? "Cerrar" : "Abrir"} ${item.label}`}
            className="-mr-2 rounded-lg p-2.5 text-gold-300 transition hover:bg-white/5"
          >
            <Chevron open={open} />
          </button>
        )}
      </div>
      {item.children && open && (
        <ul className="mb-1 ml-1 border-l border-gold-500/25 pl-4">
          {item.children.map((c) => (
            <MenuItem key={c.label} item={c} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </li>
  );
}

// Botón del logo del header: abre un menú lateral con todas las secciones.
export default function SideMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // true recién en el navegador (en el servidor no hay <body> para el portal)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menú" aria-expanded={open} className="shrink-0">
        {children}
      </button>
      {/* El panel va directo en <body>: dentro del header quedaría debajo del botón flotante de WhatsApp */}
      {mounted &&
        createPortal(
      <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          onClick={close}
          className={`absolute inset-0 bg-black/55 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <nav
          aria-label="Menú"
          className={`absolute inset-y-0 left-0 flex w-[min(82vw,20rem)] flex-col border-r border-gold-500/25 bg-navy-950 shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gold-500/20 px-5 py-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">Menú</span>
            <button type="button" onClick={close} aria-label="Cerrar menú" className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/5 hover:text-white">
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto overscroll-contain px-5 py-3">
            {ITEMS.map((item) => (
              <MenuItem key={item.label} item={item} depth={0} onNavigate={close} />
            ))}
          </ul>
        </nav>
      </div>,
          document.body,
        )}
    </>
  );
}
